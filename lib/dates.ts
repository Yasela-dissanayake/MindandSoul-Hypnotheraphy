// Dates are stored as "YYYY-MM-DD" strings in the client's own time zone, so a
// task done at 11 pm in Dubai counts for that Dubai day.

export const DEFAULT_TZ = "Australia/Brisbane";

export function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function parts(date: Date, tz: string) {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: isValidTimezone(tz) ? tz : DEFAULT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  });
  const p = Object.fromEntries(f.formatToParts(date).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) };
}

/** Today's date ("YYYY-MM-DD") in the given time zone. */
export function todayIn(tz: string, now = new Date()): string {
  return parts(now, tz).date;
}

/** Current hour (0-23) in the given time zone. */
export function hourIn(tz: string, now = new Date()): number {
  return parts(now, tz).hour;
}

function toUTC(d: string): number {
  const [y, m, day] = d.split("-").map(Number);
  return Date.UTC(y, m - 1, day);
}

export function addDays(d: string, n: number): string {
  return new Date(toUTC(d) + n * 86400000).toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((toUTC(to) - toUTC(from)) / 86400000);
}

/** Day number of a plan: the start date is day 1. */
export function dayNumber(startDate: string, today: string): number {
  return daysBetween(startDate, today) + 1;
}

/** Date of a given plan day. */
export function dateOfDay(startDate: string, day: number): string {
  return addDays(startDate, day - 1);
}

/** "Colombo" from "Asia/Colombo", "Perth" from "Australia/Perth". */
export const zoneCity = (tz: string) => tz.split("/").pop()!.replace(/_/g, " ");

/** A moment on the clock of a time zone: its date ("YYYY-MM-DD"), a short day ("Thu, 26 Nov 2026") and time ("9:00 am"). */
export function momentIn(d: Date, tz: string) {
  return {
    date: d.toLocaleDateString("en-CA", { timeZone: tz }),
    day: d.toLocaleDateString("en-AU", { timeZone: tz, weekday: "short", day: "numeric", month: "short", year: "numeric" }),
    longDay: d.toLocaleDateString("en-AU", { timeZone: tz, weekday: "long", day: "numeric", month: "long" }),
    time: d.toLocaleTimeString("en-AU", { timeZone: tz, hour: "numeric", minute: "2-digit" }),
  };
}

/** How many hours `tz` is ahead of `base` right now (negative = behind), e.g. Perth vs Colombo = 2.5. */
export function hoursAhead(tz: string, base: string, at = new Date()) {
  const offset = (zone: string) => {
    const p = new Intl.DateTimeFormat("en-US", { timeZone: zone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(at);
    const v = (t: string) => Number(p.find((x) => x.type === t)?.value);
    return (Date.UTC(v("year"), v("month") - 1, v("day"), v("hour"), v("minute")) - Math.floor(at.getTime() / 60000) * 60000) / 3600000;
  };
  return Math.round((offset(tz) - offset(base)) * 4) / 4;
}

export function formatDate(d: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }): string {
  return new Date(toUTC(d)).toLocaleDateString("en-AU", { ...opts, timeZone: "UTC" });
}

export function greeting(tz: string): string {
  const h = hourIn(tz);
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function formatHour(h: number): string {
  const suffix = h < 12 ? "am" : "pm";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr} ${suffix}`;
}

export const COMMON_TIMEZONES = [
  "Australia/Brisbane",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Adelaide",
  "Australia/Perth",
  "Australia/Darwin",
  "Australia/Hobart",
  "Asia/Dubai",
  "Asia/Colombo",
  "Asia/Singapore",
  "Asia/Kolkata",
  "Europe/London",
  "Pacific/Auckland",
  "America/New_York",
  "America/Los_Angeles",
];
