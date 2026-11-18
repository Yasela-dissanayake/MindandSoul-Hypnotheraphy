import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpen, CalendarDays, GraduationCap, Search, Sparkles } from "lucide-react";
import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { BOOKING_TZ, MODE_LABEL, time12 } from "@/lib/booking";
import { formatDate, todayIn } from "@/lib/dates";
import { money } from "@/lib/learning";
import { countNewSales } from "@/lib/sales";
import { viewerTimezone } from "@/lib/viewer-tz";
import { cn } from "@/lib/utils";
import { CancelBookingButton } from "@/components/admin/calendar-blocker";
import { MarkSeenButton } from "@/components/admin/mark-seen-button";

// Everything people have booked or bought on the website, in one place:
// session bookings, class enrolments and course purchases.
// New ones are highlighted until Rangika marks them as seen.

type Tab = "sessions" | "courses" | "learning";
type SP = { tab?: string; q?: string; show?: string };

const TABS: { id: Tab; label: string; icon: typeof Sparkles }[] = [
  { id: "sessions", label: "Session bookings", icon: Sparkles },
  { id: "courses", label: "Class enrolments", icon: GraduationCap },
  { id: "learning", label: "Courses", icon: BookOpen },
];

const longDay = (d: string) => formatDate(d, { weekday: "short", day: "numeric", month: "short", year: "numeric" });

function NewPill() {
  return <span className="rounded bg-sage-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">New</span>;
}

/** One line per booking or purchase; new ones get a light green background and a "New" label. */
function Row({ isNew, children }: { isNew: boolean; children: ReactNode }) {
  return <li className={cn("flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3", isNew && "bg-sage-50")}>{children}</li>;
}

function Name({ userId, name }: { userId?: string | null; name: string }) {
  return userId ? (
    <Link href={`/admin/clients/${userId}`} className="font-medium text-stone-800 hover:underline">
      {name}
    </Link>
  ) : (
    <span className="font-medium text-stone-800">{name}</span>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-white p-5 text-sm text-stone-500 ring-1 ring-stone-200">{children}</p>;
}

function List({ children }: { children: ReactNode }) {
  return <ul className="divide-y divide-stone-100 overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200">{children}</ul>;
}

export default async function BookingsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdminPage();
  const tz = await viewerTimezone();
  const sp = await searchParams;
  const tab: Tab = sp.tab === "courses" || sp.tab === "learning" ? sp.tab : "sessions";
  const q = (sp.q ?? "").trim().slice(0, 100);
  const counts = await countNewSales();

  const paidOn = (d: Date | null) =>
    d ? d.toLocaleString("en-AU", { timeZone: tz, day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "";
  const href = (next: Partial<SP>) => {
    const p = new URLSearchParams();
    const merged = { tab, q, ...next };
    if (merged.tab && merged.tab !== "sessions") p.set("tab", merged.tab);
    if (merged.q) p.set("q", merged.q);
    if (next.show) p.set("show", next.show);
    const s = p.toString();
    return `/admin/bookings${s ? `?${s}` : ""}`;
  };

  // Accounts for the people listed, so their name links to their page.
  const accountsFor = async (emails: string[]) => {
    const users = await db.user.findMany({ where: { email: { in: [...new Set(emails)] } }, select: { id: true, email: true } });
    return new Map(users.map((u) => [u.email, u.id]));
  };

  let body: ReactNode;

  if (tab === "sessions") {
    const today = todayIn(BOOKING_TZ);
    const match = q
      ? { OR: [{ clientName: { contains: q, mode: "insensitive" as const } }, { clientEmail: { contains: q, mode: "insensitive" as const } }, { clientPhone: { contains: q } }] }
      : {};
    const show = sp.show === "past" || sp.show === "cancelled" ? sp.show : "upcoming";
    const where =
      show === "upcoming"
        ? { status: "CONFIRMED" as const, date: { gte: today }, ...match }
        : show === "past"
          ? { status: "CONFIRMED" as const, date: { lt: today }, ...match }
          : { status: "CANCELLED" as const, ...match };
    const [bookings, upcoming, past, cancelled] = await Promise.all([
      db.booking.findMany({
        where,
        orderBy: show === "upcoming" ? [{ date: "asc" }, { start: "asc" }] : [{ date: "desc" }, { start: "desc" }],
        take: 200,
      }),
      db.booking.count({ where: { status: "CONFIRMED", date: { gte: today }, ...match } }),
      db.booking.count({ where: { status: "CONFIRMED", date: { lt: today }, ...match } }),
      db.booking.count({ where: { status: "CANCELLED", ...match } }),
    ]);
    const accounts = await accountsFor(bookings.map((b) => b.clientEmail.toLowerCase()));

    body = (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["upcoming", `Upcoming (${upcoming})`],
              ["past", `Past (${past})`],
              ["cancelled", `Cancelled (${cancelled})`],
            ] as const
          ).map(([id, label]) => (
            <Link
              key={id}
              href={href({ show: id === "upcoming" ? undefined : id })}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm ring-1",
                show === id ? "bg-sage-600 text-white ring-sage-600" : "bg-white text-stone-600 ring-stone-200 hover:bg-stone-50",
              )}
            >
              {label}
            </Link>
          ))}
          <Link href="/admin/calendar" className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-sage-700 hover:bg-sage-50">
            <CalendarDays className="h-4 w-4" /> Block times in the calendar
          </Link>
        </div>
        {bookings.length === 0 ? (
          <Empty>{q ? `No ${show} bookings match "${q}".` : `No ${show} bookings.`}</Empty>
        ) : (
          <List>
            {bookings.map((b) => {
              const isNew = b.status === "CONFIRMED" && !b.seenAt;
              const userId = accounts.get(b.clientEmail.toLowerCase());
              const notes = [
                ["What they'd like help with", b.concerns],
                ["Previous therapy", b.previousTherapy],
                ["Medical conditions", b.medicalConditions],
              ].filter(([, v]) => v) as [string, string][];
              return (
                <Row key={b.id} isNew={isNew}>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="flex flex-wrap items-center gap-2">
                      {isNew && <NewPill />}
                      <Name userId={userId} name={b.clientName} />
                      <span className="text-stone-600">{b.service}</span>
                    </p>
                    <p className="text-sm text-stone-500">
                      {longDay(b.date)}, {time12(b.start)} – {time12(b.end)}
                      {b.clientPhone ? ` · ${b.clientPhone}` : ""}
                    </p>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-xs text-sage-700 hover:underline">Details</summary>
                      <div className="mt-2 space-y-2 rounded-lg bg-white p-3 text-stone-600 ring-1 ring-stone-200">
                        <p>
                          <a className="hover:underline" href={`mailto:${b.clientEmail}`}>{b.clientEmail}</a> · {MODE_LABEL[b.mode]} · paid{" "}
                          {money(b.amount, b.currency)} · booked {paidOn(b.createdAt)}
                          {b.clientTimezone && b.clientTimezone !== BOOKING_TZ ? ` · client's time zone: ${b.clientTimezone}` : ""}
                          {b.cancelledAt ? ` · cancelled ${paidOn(b.cancelledAt)}` : ""}
                        </p>
                        {notes.map(([k, v]) => (
                          <div key={k}>
                            <p className="text-xs text-stone-400">{k}</p>
                            <p className="whitespace-pre-wrap">{v}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {isNew && <MarkSeenButton kind="sessions" id={b.id} />}
                    {show === "upcoming" && (
                      <CancelBookingButton id={b.id} name={b.clientName} when={`${formatDate(b.date, { day: "numeric", month: "short" })} at ${time12(b.start)}`} />
                    )}
                  </div>
                </Row>
              );
            })}
          </List>
        )}
      </div>
    );
  } else if (tab === "courses") {
    const purchases = await db.coursePurchase.findMany({
      where: {
        status: "PAID",
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { course: { title: { contains: q, mode: "insensitive" } } }] } : {}),
      },
      orderBy: { paidAt: "desc" },
      take: 200,
      include: { course: { select: { id: true, title: true } } },
    });
    body =
      purchases.length === 0 ? (
        <Empty>{q ? `No class enrolments match "${q}".` : "No one has enrolled on a class through the website yet."}</Empty>
      ) : (
        <List>
          {purchases.map((p) => {
            const isNew = !p.seenAt;
            return (
              <Row key={p.id} isNew={isNew}>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="flex flex-wrap items-center gap-2">
                    {isNew && <NewPill />}
                    <Name userId={p.userId} name={p.name} />
                    <Link href={`/admin/classes/${p.course.id}`} className="text-stone-600 hover:underline">
                      {p.course.title}
                    </Link>
                  </p>
                  <p className="text-sm text-stone-500">
                    {paidOn(p.paidAt)} · {money(p.amount, p.currency)} · {p.phone || p.email}
                  </p>
                </div>
                {isNew && <MarkSeenButton kind="courses" id={p.id} />}
              </Row>
            );
          })}
        </List>
      );
  } else {
    const purchases = await db.packagePurchase.findMany({
      where: {
        status: "PAID",
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { package: { title: { contains: q, mode: "insensitive" } } }] } : {}),
      },
      orderBy: { paidAt: "desc" },
      take: 200,
      include: { package: { select: { id: true, title: true } } },
    });
    body =
      purchases.length === 0 ? (
        <Empty>{q ? `No course purchases match "${q}".` : "No one has bought a course yet."}</Empty>
      ) : (
        <List>
          {purchases.map((p) => {
            const isNew = !p.seenAt;
            return (
              <Row key={p.id} isNew={isNew}>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="flex flex-wrap items-center gap-2">
                    {isNew && <NewPill />}
                    <Name userId={p.userId} name={p.name} />
                    <Link href={`/admin/courses/${p.package.id}`} className="text-stone-600 hover:underline">
                      {p.package.title}
                    </Link>
                  </p>
                  <p className="text-sm text-stone-500">
                    {paidOn(p.paidAt)} · {money(p.amount, p.currency)} · {p.email}
                  </p>
                </div>
                {isNew && <MarkSeenButton kind="learning" id={p.id} />}
              </Row>
            );
          })}
        </List>
      );
  }

  const newHere = counts[tab];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-stone-800">Bookings &amp; sales</h1>
        <p className="text-stone-500">Everything booked or bought on the website. New ones are highlighted until you mark them as seen.</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {TABS.map((t) => {
          const n = counts[t.id];
          return (
            <Link
              key={t.id}
              href={href({ tab: t.id, q: "" })}
              className={cn(
                "flex items-center gap-3 rounded-xl p-3 ring-1 transition-colors",
                tab === t.id ? "bg-sage-600 text-white ring-sage-600" : "bg-white text-stone-700 ring-stone-200 hover:bg-stone-50",
              )}
            >
              <t.icon className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-sm font-medium">{t.label}</span>
              {n > 0 && <span className={cn("rounded px-1.5 py-0.5 text-xs font-semibold", tab === t.id ? "bg-white text-sage-700" : "bg-sage-600 text-white")}>{n} new</span>}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form action="/admin/bookings" className="flex min-w-0 flex-1 items-center gap-2">
          {tab !== "sessions" && <input type="hidden" name="tab" value={tab} />}
          {tab === "sessions" && sp.show && <input type="hidden" name="show" value={sp.show} />}
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder={tab === "sessions" ? "Search by name, email or phone" : tab === "courses" ? "Search by name, email or class" : "Search by name, email or course"}
              className="h-10 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100"
            />
          </div>
          <button type="submit" className="h-10 rounded-lg bg-sage-600 px-4 text-sm font-medium text-white hover:bg-sage-700">
            Search
          </button>
          {q && (
            <Link href={href({ q: "", show: sp.show })} className="text-sm text-stone-500 hover:underline">
              Clear
            </Link>
          )}
        </form>
        {newHere > 0 && <MarkSeenButton kind={tab} />}
      </div>

      {body}
    </div>
  );
}
