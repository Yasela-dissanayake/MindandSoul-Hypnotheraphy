import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpen, CalendarDays, Globe, GraduationCap, Headphones, MapPin, Search, Sparkles } from "lucide-react";
import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { BOOKING_TZ, time12 } from "@/lib/booking";
import { formatDate, todayIn } from "@/lib/dates";
import { formatPrice } from "@/lib/currency";
import { countNewSales } from "@/lib/sales";
import { viewerTimezone } from "@/lib/viewer-tz";
import { cn } from "@/lib/utils";
import { CancelBookingButton } from "@/components/admin/calendar-blocker";
import { MarkSeenButton } from "@/components/admin/mark-seen-button";

// Everything people have booked or bought on the website, in one place:
// session bookings, class enrollments and course purchases, each as a table.
// New ones are highlighted until Rangika marks them as seen.

type Tab = "sessions" | "courses" | "learning";
type SP = { tab?: string; q?: string; show?: string };

const TABS: { id: Tab; label: string; icon: typeof Sparkles }[] = [
  { id: "sessions", label: "Session bookings", icon: Sparkles },
  { id: "courses", label: "Class enrollments", icon: GraduationCap },
  { id: "learning", label: "Courses", icon: BookOpen },
];

const longDay = (d: string) => formatDate(d, { weekday: "short", day: "numeric", month: "short", year: "numeric" });

function NewPill() {
  return <span className="mb-1 inline-block rounded bg-sage-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">New</span>;
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-white p-5 text-sm text-stone-500 ring-1 ring-stone-200">{children}</p>;
}

/** A table that scrolls sideways on small screens. */
function Table({ head, minWidth, children }: { head: string[]; minWidth: string; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-stone-200">
      <table className={cn("w-full text-sm", minWidth)}>
        <thead className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
          <tr>
            {head.map((h, i) => (
              <th key={h} className={cn("px-4 py-3 font-medium", i === head.length - 1 && "text-right")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/** One row; new bookings/sales are tinted. */
function Tr({ isNew, children }: { isNew: boolean; children: ReactNode }) {
  return <tr className={cn("border-b border-stone-100 align-top last:border-0", isNew ? "bg-sage-50/70" : "hover:bg-stone-50")}>{children}</tr>;
}

/** Name (linked to their account when they have one), email and phone you can click. */
function Person({ userId, name, email, phone }: { userId?: string | null; name: string; email: string; phone?: string | null }) {
  return (
    <>
      {userId ? (
        <Link href={`/admin/clients/${userId}`} className="font-medium text-stone-800 hover:underline">
          {name}
        </Link>
      ) : (
        <p className="font-medium text-stone-800">{name}</p>
      )}
      <a href={`mailto:${email}`} className="block break-words text-sage-700 underline-offset-2 hover:underline">
        {email}
      </a>
      {phone && (
        <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="block text-sage-700 underline-offset-2 hover:underline">
          {phone}
        </a>
      )}
    </>
  );
}

export default async function BookingsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdminPage();
  const [tz, sp] = await Promise.all([viewerTimezone(), searchParams]);
  const tab: Tab = sp.tab === "courses" || sp.tab === "learning" ? sp.tab : "sessions";
  const q = (sp.q ?? "").trim().slice(0, 100);
  // Started now, awaited where the tabs are drawn: runs alongside the tab's own queries.
  // (Same request as the menu badge, so it's usually already answered.)
  const countsPromise = countNewSales();
  countsPromise.catch(() => {}); // a failure is reported where it's awaited, not as an "unhandled" error

  const stamp = (d: Date | null) =>
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
        include: { option: { select: { title: true } } },
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
          <Table head={["When (Perth time)", "Client", "Session", "Payment", "Notes", "Actions"]} minWidth="min-w-[880px]">
            {bookings.map((b) => {
              const isNew = b.status === "CONFIRMED" && !b.seenAt;
              const notes = [
                ["What they'd like help with", b.concerns],
                ["Previous therapy", b.previousTherapy],
                ["Medical conditions", b.medicalConditions],
              ].filter(([, v]) => v) as [string, string][];
              return (
                <Tr key={b.id} isNew={isNew}>
                  <td className="whitespace-nowrap px-4 py-3">
                    {isNew && <NewPill />}
                    <p className="font-medium text-stone-800">{longDay(b.date)}</p>
                    {b.recorded ? (
                      <p className="text-stone-600">No appointment (bought)</p>
                    ) : (
                      <p className="text-stone-600">
                        {time12(b.start)} – {time12(b.end)}
                      </p>
                    )}
                    {b.clientTimezone && b.clientTimezone !== BOOKING_TZ && (
                      <p className="text-xs text-stone-500">Client in {b.clientTimezone.replace(/_/g, " ")}</p>
                    )}
                  </td>
                  <td className="min-w-[12rem] px-4 py-3">
                    <Person userId={b.userId ?? accounts.get(b.clientEmail.toLowerCase())} name={b.clientName} email={b.clientEmail} phone={b.clientPhone} />
                  </td>
                  <td className="min-w-[9rem] px-4 py-3 text-stone-700">
                    <p>{b.service}</p>
                    <p className="text-xs text-stone-500">{b.credit ? "From their package" : b.option?.title ?? ""}</p>
                    {b.recorded ? (
                      <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-amber-800">
                        <Headphones className="h-3.5 w-3.5" /> Self-paced recorded journey
                      </p>
                    ) : (
                      <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-stone-500">
                        {b.mode === "IN_PERSON" ? <MapPin className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                        {b.mode === "IN_PERSON" ? "In person" : "Online / distance"}
                      </p>
                    )}
                  </td>
                  <td className="min-w-[8rem] px-4 py-3 text-stone-700">
                    {b.credit ? <span className="text-stone-500">Package</span> : b.amount === 0 ? <span className="font-medium text-amber-700">Free</span> : formatPrice(b.amount, b.currency)}
                    <p className="text-xs text-stone-500">Booked {stamp(b.createdAt)}</p>
                    {b.cancelledAt && <p className="text-xs text-red-700">Cancelled {stamp(b.cancelledAt)}</p>}
                  </td>
                  <td className="min-w-[10rem] px-4 py-3 text-stone-700">
                    {notes.length === 0 ? (
                      <span className="text-stone-400">—</span>
                    ) : (
                      <details className="group">
                        <summary className="cursor-pointer list-none text-xs font-medium text-sage-700 [&::-webkit-details-marker]:hidden">
                          <span className="group-open:hidden">Show {notes.length === 1 ? "note" : `${notes.length} notes`}</span>
                          <span className="hidden group-open:inline">Hide notes</span>
                        </summary>
                        <div className="mt-2 space-y-2">
                          {notes.map(([k, v]) => (
                            <div key={k}>
                              <p className="text-xs text-stone-400">{k}</p>
                              <p className="whitespace-pre-wrap">{v}</p>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {isNew && <MarkSeenButton kind="sessions" id={b.id} />}
                      {show === "upcoming" && (
                        <CancelBookingButton id={b.id} name={b.clientName} when={`${formatDate(b.date, { day: "numeric", month: "short" })} at ${time12(b.start)}`} />
                      )}
                    </div>
                  </td>
                </Tr>
              );
            })}
          </Table>
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
        <Empty>{q ? `No class enrollments match "${q}".` : "No one has enrolled on a class through the website yet."}</Empty>
      ) : (
        <Table head={["Paid on", "Student", "Class", "Amount", "Account", "Actions"]} minWidth="min-w-[860px]">
          {purchases.map((p) => {
            const isNew = !p.seenAt;
            return (
              <Tr key={p.id} isNew={isNew}>
                <td className="whitespace-nowrap px-4 py-3 text-stone-600">
                  {isNew && <NewPill />}
                  <p>{stamp(p.paidAt)}</p>
                </td>
                <td className="min-w-[13rem] px-4 py-3">
                  <Person userId={p.userId} name={p.name} email={p.email} phone={p.phone} />
                </td>
                <td className="min-w-[12rem] px-4 py-3">
                  <Link href={`/admin/classes/${p.course.id}`} className="text-stone-700 hover:underline">
                    {p.course.title}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-stone-700">{p.amount === 0 ? <span className="font-medium text-amber-700">Free</span> : formatPrice(p.amount, p.currency)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-stone-500">{p.newAccount ? "New account created" : "Existing account"}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex justify-end">{isNew && <MarkSeenButton kind="courses" id={p.id} />}</div>
                </td>
              </Tr>
            );
          })}
        </Table>
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
        <Table head={["Paid on", "Learner", "Course", "Amount", "Account", "Actions"]} minWidth="min-w-[860px]">
          {purchases.map((p) => {
            const isNew = !p.seenAt;
            return (
              <Tr key={p.id} isNew={isNew}>
                <td className="whitespace-nowrap px-4 py-3 text-stone-600">
                  {isNew && <NewPill />}
                  <p>{stamp(p.paidAt)}</p>
                </td>
                <td className="min-w-[13rem] px-4 py-3">
                  <Person userId={p.userId} name={p.name} email={p.email} />
                </td>
                <td className="min-w-[12rem] px-4 py-3">
                  <Link href={`/admin/courses/${p.package.id}`} className="text-stone-700 hover:underline">
                    {p.package.title}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-stone-700">{p.amount === 0 ? <span className="font-medium text-amber-700">Free</span> : formatPrice(p.amount, p.currency)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-stone-500">{p.newAccount ? "New account created" : "Existing account"}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex justify-end">{isNew && <MarkSeenButton kind="learning" id={p.id} />}</div>
                </td>
              </Tr>
            );
          })}
        </Table>
      );
  }

  const counts = await countsPromise;
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
          {tab !== "sessions" && <input suppressHydrationWarning type="hidden" name="tab" value={tab} />}
          {tab === "sessions" && sp.show && <input suppressHydrationWarning type="hidden" name="show" value={sp.show} />}
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input suppressHydrationWarning
              name="q"
              defaultValue={q}
              placeholder={tab === "sessions" ? "Search by name, email or phone" : tab === "courses" ? "Search by name, email or class" : "Search by name, email or course"}
              className="h-10 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100"
            />
          </div>
          <button suppressHydrationWarning type="submit" className="h-10 rounded-lg bg-sage-600 px-4 text-sm font-medium text-white hover:bg-sage-700">
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
