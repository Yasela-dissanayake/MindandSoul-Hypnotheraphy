import type { Prisma } from "@prisma/client";

// The days of a live Reiki Training class. Rangika enters them in Perth time (Perth has no daylight saving);
// each one is also stored as a real moment (startsAt/endsAt), so visitors see it in their own time zone,
// with daylight saving in Sydney, Melbourne, Adelaide etc. worked out by the browser.

/** One class day, ready to send to the browser. `label` names the class it belongs to (for a bundle). */
export type ClassTime = { startsAt: string; endsAt: string; label?: string };

/** Load a class's days and, for a bundle, the days of the classes it includes. */
export const classDatesInclude = {
  dates: { orderBy: { startsAt: "asc" } },
  includes: { select: { title: true, dates: { orderBy: { startsAt: "asc" } } }, orderBy: { order: "asc" } },
} satisfies Prisma.CourseInclude;

type DateRow = { startsAt: Date; endsAt: Date };
type WithDates = { dates: DateRow[]; includes?: { title: string; dates: DateRow[] }[] };

/** The class days still to come (a bundle: its own days, or else those of the classes it includes), soonest first. */
export function upcomingClassTimes(c: WithDates, now = new Date()): ClassTime[] {
  const own = c.dates.map((d) => ({ startsAt: d.startsAt, endsAt: d.endsAt, label: undefined as string | undefined }));
  const fromParts =
    own.length === 0 && c.includes?.length
      ? c.includes.flatMap((p) => p.dates.map((d) => ({ startsAt: d.startsAt, endsAt: d.endsAt, label: p.title })))
      : [];
  return [...own, ...fromParts]
    .filter((d) => d.endsAt > now)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .map((d) => ({ startsAt: d.startsAt.toISOString(), endsAt: d.endsAt.toISOString(), ...(d.label ? { label: d.label } : {}) }));
}

/** "Sat 14 Dec 2026, 6:00 – 9:00 pm" in the given time zone. */
export function formatClassTime(t: { startsAt: string | Date; endsAt: string | Date }, tz: string, opts: { year?: boolean } = {}) {
  const s = new Date(t.startsAt);
  const e = new Date(t.endsAt);
  // The year only when asked for, or when the day isn't in the current year ("Sat, 12 June 2027").
  const yearOf = (d: Date) => d.toLocaleDateString("en-AU", { timeZone: tz, year: "numeric" });
  const withYear = opts.year ?? yearOf(s) !== yearOf(new Date());
  const day = s.toLocaleDateString("en-AU", { timeZone: tz, weekday: "short", day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}) });
  const time = (d: Date) => d.toLocaleTimeString("en-AU", { timeZone: tz, hour: "numeric", minute: "2-digit" }).replace(/\s/g, " ");
  const [sh, eh] = [time(s), time(e)];
  // "6:00 pm – 9:00 pm" → "6:00 – 9:00 pm" when both are am or both pm
  const sameHalf = sh.slice(-2) === eh.slice(-2);
  return `${day}, ${sameHalf ? sh.slice(0, -3) : sh} – ${eh}`;
}

/** How to name a time zone to a visitor: "Perth time", or "your time (Australia/Sydney)". */
export function timeZoneName(tz: string) {
  return tz === "Australia/Perth" ? "Perth time" : tz.replace(/_/g, " ");
}
