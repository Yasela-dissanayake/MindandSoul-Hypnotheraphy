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
