import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpen, CalendarDays, ClipboardList, Globe, GraduationCap, Headphones, LayoutList, MapPin, Search, Sparkles } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { BOOKING_TZ, time12 } from "@/lib/booking";
import { formatDate, isValidTimezone, momentIn, todayIn, zoneCity } from "@/lib/dates";
import { formatPrice } from "@/lib/currency";
import { newBookingWhere, newPurchaseWhere } from "@/lib/sales";
import { viewerTimezone } from "@/lib/viewer-tz";
import { cn } from "@/lib/utils";
import { CancelBookingButton } from "@/components/admin/calendar-blocker";
import { MarkSeenButton } from "@/components/admin/mark-seen-button";

// Everything people have booked or bought on the website, in one place, with the same tabs as the
// Services menu: All, Hypnotherapy, Reiki Energy Healing (session bookings), Reiki Training (class
// enrollments) and Courses (online course purchases). New ones are highlighted until Rangika marks them as seen.

type Tab = "all" | "hypnotherapy" | "reiki" | "courses" | "learning";
type Area = "hypnotherapy" | "reiki";
type SP = { tab?: string; q?: string; show?: string };

const TABS: { id: Tab; label: string; icon: typeof Sparkles }[] = [
  { id: "all", label: "All", icon: LayoutList },
  { id: "hypnotherapy", label: "Hypnotherapy", icon: ClipboardList },
  { id: "reiki", label: "Reiki Energy Healing", icon: Sparkles },
  { id: "courses", label: "Reiki Training", icon: GraduationCap },
  { id: "learning", label: "Courses", icon: BookOpen },
];
const TAB_IDS = TABS.map((t) => t.id);

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

/** "6:30 am – 7:30 am their time (Colombo)", with their day added when it isn't the same date as on the viewer's clock. */
function clientTime(startsAt: Date, endsAt: Date, viewerDate: string, tz: string) {
  const s = momentIn(startsAt, tz);
  const day = s.date !== viewerDate ? `${s.day.replace(/ \d{4}$/, "")}, ` : "";
  return `${day}${s.time} – ${momentIn(endsAt, tz).time} their time (${zoneCity(tz)})`;
}

/** The coloured label in the All tab saying what kind of booking or sale a row is. */
const KIND_STYLE: Record<Tab, string> = {
  all: "",
  hypnotherapy: "bg-sage-100 text-sage-800",
  reiki: "bg-amber-100 text-amber-900",
  courses: "bg-sky-100 text-sky-900",
  learning: "bg-violet-100 text-violet-900",
};
function KindLabel({ kind }: { kind: Exclude<Tab, "all"> }) {
  const t = TABS.find((x) => x.id === kind)!;
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium", KIND_STYLE[kind])}>
      <t.icon className="h-3.5 w-3.5" aria-hidden /> {t.label}
    </span>
  );
}

// What a session booking needs to know which service area it belongs to.
const bookingInclude = {
  option: { select: { title: true, service: { select: { category: true } } } },
  plan: { select: { service: true } },
} satisfies Prisma.BookingInclude;
type BookingRow = Prisma.BookingGetPayload<{ include: typeof bookingInclude }>;

export default async function BookingsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdminPage();
  const [tz, sp] = await Promise.all([viewerTimezone(), searchParams]);
  // Older links: "sessions" (the old first tab) opens All.
  const tab: Tab = (TAB_IDS as string[]).includes(sp.tab ?? "") ? (sp.tab as Tab) : "all";
  const q = (sp.q ?? "").trim().slice(0, 100);

  const stamp = (d: Date | null) =>
    d ? d.toLocaleString("en-AU", { timeZone: tz, day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "";
  const href = (next: Partial<SP>) => {
    const p = new URLSearchParams();
    const merged = { tab, q, ...next };
    if (merged.tab && merged.tab !== "all") p.set("tab", merged.tab);
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

  // Which tab a session booking belongs to: from the session option bought, else the client's plan,
  // else the session's name (older bookings).
  const services = await db.sessionService.findMany({ select: { title: true, category: true } });
  const categoryByTitle = new Map(services.map((s) => [s.title.toLowerCase(), s.category]));
  const areaOf = (b: Pick<BookingRow, "option" | "plan" | "service">): Area => {
    const c = b.option?.service.category ?? b.plan?.service ?? categoryByTitle.get(b.service.toLowerCase()) ?? "HYPNOTHERAPY";
    return c === "HYPNOTHERAPY" ? "hypnotherapy" : "reiki";
  };

  // New (not yet seen) per tab, for the "N new" on each tab.
  const [newBookings, newClasses, newCourses] = await Promise.all([
    db.booking.findMany({ where: newBookingWhere, select: { id: true, service: true, option: bookingInclude.option, plan: bookingInclude.plan } }),
    db.coursePurchase.count({ where: newPurchaseWhere }),
    db.packagePurchase.count({ where: newPurchaseWhere }),
  ]);
  const newIds: Record<Area, string[]> = { hypnotherapy: [], reiki: [] };
  for (const b of newBookings) newIds[areaOf(b)].push(b.id);
  const counts: Record<Tab, number> = {
    all: newBookings.length + newClasses + newCourses,
    hypnotherapy: newIds.hypnotherapy.length,
    reiki: newIds.reiki.length,
    courses: newClasses,
    learning: newCourses,
  };

  const bookingMatch: Prisma.BookingWhereInput = q
    ? { OR: [{ clientName: { contains: q, mode: "insensitive" } }, { clientEmail: { contains: q, mode: "insensitive" } }, { clientPhone: { contains: q } }, { service: { contains: q, mode: "insensitive" } }] }
    : {};
  const classMatch: Prisma.CoursePurchaseWhereInput = q
    ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { course: { title: { contains: q, mode: "insensitive" } } }] }
    : {};
  const courseMatch: Prisma.PackagePurchaseWhereInput = q
    ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { package: { title: { contains: q, mode: "insensitive" } } }] }
    : {};

  let body: ReactNode;

  if (tab === "all") {
    // Everything, newest first: session bookings, class enrollments and course purchases together.
    const [bookings, classes, courses] = await Promise.all([
      db.booking.findMany({ where: { status: "CONFIRMED", ...bookingMatch }, orderBy: { createdAt: "desc" }, take: 150, include: bookingInclude }),
      db.coursePurchase.findMany({ where: { status: "PAID", ...classMatch }, orderBy: { paidAt: "desc" }, take: 150, include: { course: { select: { id: true, title: true } } } }),
      db.packagePurchase.findMany({ where: { status: "PAID", ...courseMatch }, orderBy: { paidAt: "desc" }, take: 150, include: { package: { select: { id: true, title: true } } } }),
    ]);
    const accounts = await accountsFor(bookings.map((b) => b.clientEmail.toLowerCase()));
    const today = todayIn(BOOKING_TZ);
    type Row = { key: string; at: Date; kind: Exclude<Tab, "all">; isNew: boolean; cells: ReactNode; seen: ReactNode };
    const rows: Row[] = [
      ...bookings.map((b): Row => {
        const isNew = !b.seenAt;
        const when = momentIn(b.startsAt, tz);
        return {
          key: `b-${b.id}`,
          at: b.createdAt,
          kind: areaOf(b),
          isNew,
          cells: (
            <>
              <td className="min-w-[12rem] px-4 py-3">
                <Person userId={b.userId ?? accounts.get(b.clientEmail.toLowerCase())} name={b.clientName} email={b.clientEmail} phone={b.clientPhone} />
              </td>
              <td className="min-w-[13rem] px-4 py-3 text-stone-700">
                <p>{b.service}</p>
                <p className="text-xs text-stone-500">{b.credit ? "From their package" : b.option?.title ?? ""}</p>
                {!b.recorded && (
                  <p className={cn("mt-0.5 text-xs", b.date >= today ? "font-medium text-sage-800" : "text-stone-500")}>
                    {b.date >= today ? "Session" : "Was on"} {when.day}, {when.time}
                  </p>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-stone-700">
                {b.credit ? <span className="text-stone-500">Package</span> : b.amount === 0 ? <span className="font-medium text-amber-700">Free</span> : formatPrice(b.amount, b.currency)}
              </td>
            </>
          ),
          seen: isNew ? <MarkSeenButton kind="sessions" id={b.id} /> : null,
        };
      }),
      ...classes.map((p): Row => ({
        key: `c-${p.id}`,
        at: p.paidAt ?? p.createdAt,
        kind: "courses",
        isNew: !p.seenAt,
        cells: (
          <>
            <td className="min-w-[12rem] px-4 py-3">
              <Person userId={p.userId} name={p.name} email={p.email} phone={p.phone} />
            </td>
            <td className="min-w-[13rem] px-4 py-3">
              <Link href={`/admin/classes/${p.course.id}`} className="text-stone-700 hover:underline">
                {p.course.title}
              </Link>
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-stone-700">{p.amount === 0 ? <span className="font-medium text-amber-700">Free</span> : formatPrice(p.amount, p.currency)}</td>
          </>
        ),
        seen: !p.seenAt ? <MarkSeenButton kind="courses" id={p.id} /> : null,
      })),
      ...courses.map((p): Row => ({
        key: `l-${p.id}`,
        at: p.paidAt ?? p.createdAt,
        kind: "learning",
        isNew: !p.seenAt,
        cells: (
          <>
            <td className="min-w-[12rem] px-4 py-3">
              <Person userId={p.userId} name={p.name} email={p.email} />
            </td>
            <td className="min-w-[13rem] px-4 py-3">
              <Link href={`/admin/courses/${p.package.id}`} className="text-stone-700 hover:underline">
                {p.package.title}
              </Link>
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-stone-700">{p.amount === 0 ? <span className="font-medium text-amber-700">Free</span> : formatPrice(p.amount, p.currency)}</td>
          </>
        ),
        seen: !p.seenAt ? <MarkSeenButton kind="learning" id={p.id} /> : null,
      })),
    ]
      .sort((a, b) => b.at.getTime() - a.at.getTime())
      .slice(0, 200);

    body =
      rows.length === 0 ? (
        <Empty>{q ? `Nothing matches "${q}".` : "Nothing has been booked or bought on the website yet."}</Empty>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-stone-500">Newest first. Open a tab above for more details, cancelled bookings and past sessions.</p>
          <Table head={["Booked / paid", "Type", "Client", "What", "Amount", "Actions"]} minWidth="min-w-[920px]">
            {rows.map((r) => (
              <Tr key={r.key} isNew={r.isNew}>
                <td className="whitespace-nowrap px-4 py-3 text-stone-600">
                  {r.isNew && <NewPill />}
                  <p>{stamp(r.at)}</p>
                </td>
                <td className="px-4 py-3">
                  <KindLabel kind={r.kind} />
                </td>
                {r.cells}
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex justify-end">{r.seen}</div>
                </td>
              </Tr>
            ))}
          </Table>
        </div>
      );
  } else if (tab === "hypnotherapy" || tab === "reiki") {
    const area: Area = tab;
    const today = todayIn(BOOKING_TZ);
    const show = sp.show === "past" || sp.show === "cancelled" ? sp.show : "upcoming";
    // All of this area's bookings that match the search, then split into upcoming / past / cancelled.
    const all = (
      await db.booking.findMany({
        where: { status: { in: ["CONFIRMED", "CANCELLED"] }, ...bookingMatch },
        orderBy: [{ date: "asc" }, { start: "asc" }],
        take: 1000,
        include: bookingInclude,
      })
    ).filter((b) => areaOf(b) === area);
    const groups = {
      upcoming: all.filter((b) => b.status === "CONFIRMED" && b.date >= today),
      past: all.filter((b) => b.status === "CONFIRMED" && b.date < today).reverse(),
      cancelled: all.filter((b) => b.status === "CANCELLED").reverse(),
    };
    const bookings = groups[show].slice(0, 200);
    const accounts = await accountsFor(bookings.map((b) => b.clientEmail.toLowerCase()));
    const areaName = area === "hypnotherapy" ? "hypnotherapy" : "Reiki energy healing";

    body = (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["upcoming", `Upcoming (${groups.upcoming.length})`],
              ["past", `Past (${groups.past.length})`],
              ["cancelled", `Cancelled (${groups.cancelled.length})`],
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
          <Empty>{q ? `No ${show} ${areaName} bookings match "${q}".` : `No ${show} ${areaName} bookings.`}</Empty>
        ) : (
          <Table head={[`When (your time · ${zoneCity(tz)})`, "Client", "Session", "Payment", "Notes", "Actions"]} minWidth="min-w-[880px]">
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
                    {/* Shown on the clock of the device Rangika is using, wherever she is. */}
                    <p className="font-medium text-stone-800">{b.recorded ? longDay(b.date) : momentIn(b.startsAt, tz).day}</p>
                    {b.recorded ? (
                      <p className="text-stone-600">No appointment (bought)</p>
                    ) : (
                      <p className="text-stone-600">
                        {momentIn(b.startsAt, tz).time} – {momentIn(b.endsAt, tz).time}
                      </p>
                    )}
                    {/* The same moment on the client's clock, so it matches what they picked. */}
                    {b.clientTimezone && b.clientTimezone !== tz && isValidTimezone(b.clientTimezone) && !b.recorded && (
                      <p className="text-xs text-stone-500">{clientTime(b.startsAt, b.endsAt, momentIn(b.startsAt, tz).date, b.clientTimezone)}</p>
                    )}
                    {/* In-person sessions happen in Perth: show Perth time too when Rangika is somewhere else. */}
                    {tz !== BOOKING_TZ && b.mode === "IN_PERSON" && !b.recorded && (
                      <p className="text-xs text-stone-500">{time12(b.start)} – {time12(b.end)} Perth time</p>
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
                        <CancelBookingButton id={b.id} name={b.clientName} when={`${momentIn(b.startsAt, tz).day} at ${momentIn(b.startsAt, tz).time} (your time)`} />
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
      where: { status: "PAID", ...classMatch },
      orderBy: { paidAt: "desc" },
      take: 200,
      include: { course: { select: { id: true, title: true } } },
    });
    body =
      purchases.length === 0 ? (
        <Empty>{q ? `No Reiki Training enrollments match "${q}".` : "No one has enrolled on a Reiki Training class through the website yet."}</Empty>
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
      where: { status: "PAID", ...courseMatch },
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

  // "Mark all as seen" for this tab: everything on All; only this area's bookings on Hypnotherapy / Reiki.
  const newHere = counts[tab];
  const markAll =
    tab === "all" ? <MarkSeenButton kind="all" /> : tab === "hypnotherapy" || tab === "reiki" ? <MarkSeenButton kind="sessions" ids={newIds[tab]} /> : <MarkSeenButton kind={tab} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-stone-800">Bookings &amp; sales</h1>
        <p className="text-stone-500">Everything booked or bought on the website. New ones are highlighted until you mark them as seen.</p>
      </div>

      {/* Compact tabs on one row (scrolls sideways on a small screen). */}
      <nav aria-label="Bookings and sales" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {TABS.map((t) => {
          const n = counts[t.id];
          const on = tab === t.id;
          return (
            <Link
              key={t.id}
              href={href({ tab: t.id, q: "" })}
              aria-current={on ? "page" : undefined}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ring-1 transition-colors",
                on ? "bg-sage-600 text-white ring-sage-600" : "bg-white text-stone-700 ring-stone-200 hover:bg-stone-50 hover:text-stone-900",
              )}
            >
              <t.icon className="h-4 w-4 shrink-0" aria-hidden />
              {t.label}
              {n > 0 && (
                <span className={cn("rounded-full px-1.5 text-xs font-semibold leading-5", on ? "bg-white text-sage-700" : "bg-sage-600 text-white")}>
                  {n} new
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-wrap items-center gap-3">
        <form action="/admin/bookings" className="flex min-w-0 flex-1 items-center gap-2">
          {tab !== "all" && <input suppressHydrationWarning type="hidden" name="tab" value={tab} />}
          {(tab === "hypnotherapy" || tab === "reiki") && sp.show && <input suppressHydrationWarning type="hidden" name="show" value={sp.show} />}
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input suppressHydrationWarning
              name="q"
              defaultValue={q}
              placeholder={
                tab === "all"
                  ? "Search by name, email, phone, session, class or course"
                  : tab === "courses"
                    ? "Search by name, email or class"
                    : tab === "learning"
                      ? "Search by name, email or course"
                      : "Search by name, email, phone or session"
              }
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
        {newHere > 0 && markAll}
      </div>

      {body}
    </div>
  );
}
