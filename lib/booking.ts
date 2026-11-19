import type { BookingMode, CalendarChange, Prisma, PrismaClient, WorkingHours } from "@prisma/client";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { addDays, todayIn } from "@/lib/dates";

// Rangika works from Perth, so the whole booking calendar is in Perth time.
// Clients see the times converted to their own time zone on the booking page.
export const BOOKING_TZ = "Australia/Perth";

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const MODE_LABEL: Record<BookingMode, string> = { IN_PERSON: "In-person", DISTANCE: "Distance / online" };
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** "in-person" and "pet-parent-in-person" happen at the clinic; everything else is distance. */
export function modeOf(sessionType: string): BookingMode {
  return sessionType.includes("in-person") ? "IN_PERSON" : "DISTANCE";
}

export const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
export const fromMin = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) => aStart < bEnd && bStart < aEnd;

/** "14:30" → "2:30 pm" */
export function time12(t: string): string {
  const m = toMin(t);
  const h = Math.floor(m / 60);
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}

/** Offset (minutes) of a time zone from UTC at a moment. */
function tzOffsetMin(at: number, tz: string): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
      .formatToParts(new Date(at))
      .map((x) => [x.type, x.value]),
  );
  const asUTC = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute));
  return Math.round((asUTC - Math.floor(at / 60000) * 60000) / 60000);
}

/** A Perth date + "HH:MM" as a real moment in time. */
export function perthMoment(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, 0, toMin(time));
  return new Date(guess - tzOffsetMin(guess, BOOKING_TZ) * 60000);
}

export function weekdayOf(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export type Slot = { start: string; end: string; startsAt: string; endsAt: string };

type Rules = {
  bookingInPersonMinutes: number;
  bookingInPersonBreak: number;
  bookingDistanceMinutes: number;
  bookingDistanceBreak: number;
  bookingNoticeHours: number;
  bookingDaysAhead: number;
};
type BusyBooking = { date: string; start: string; end: string };

export type CalendarData = {
  rules: Rules;
  hours: WorkingHours[];
  changes: CalendarChange[];
  bookings: BusyBooking[];
  today: string;
};

type Client = PrismaClient | Prisma.TransactionClient;

/** Bookings that take up time: confirmed ones, and payments still in progress. */
export const busyWhere = (now = new Date()): Prisma.BookingWhereInput => ({
  OR: [{ status: "CONFIRMED" }, { status: "HELD", heldUntil: { gt: now } }],
});

/** Everything needed to work out free times between two Perth dates. */
export async function loadCalendar(from: string, to: string, client: Client = db): Promise<CalendarData> {
  const [rules, hours, changes, bookings] = await Promise.all([
    client === db ? getSettings() : client.settings.findUniqueOrThrow({ where: { id: 1 } }),
    client.workingHours.findMany({ orderBy: [{ weekday: "asc" }, { start: "asc" }] }),
    client.calendarChange.findMany({ where: { fromDate: { lte: to }, toDate: { gte: from } }, orderBy: [{ fromDate: "asc" }, { start: "asc" }] }),
    client.booking.findMany({ where: { date: { gte: from, lte: to }, ...busyWhere() }, select: { date: true, start: true, end: true } }),
  ]);
  return { rules, hours, changes, bookings, today: todayIn(BOOKING_TZ) };
}

export function sessionShape(rules: Rules, mode: BookingMode) {
  return mode === "IN_PERSON"
    ? { length: rules.bookingInPersonMinutes, gap: rules.bookingInPersonBreak }
    : { length: rules.bookingDistanceMinutes, gap: rules.bookingDistanceBreak };
}

/** The open hours for one day, before blocks and bookings are taken out. */
export function windowsFor(data: CalendarData, mode: BookingMode, date: string): { start: string; end: string; extra: boolean }[] {
  const wd = weekdayOf(date);
  const weekly = data.hours.filter((h) => h.mode === mode && h.weekday === wd).map((h) => ({ start: h.start, end: h.end, extra: false }));
  const extra = data.changes
    .filter((c) => c.kind === "EXTRA" && c.fromDate <= date && c.toDate >= date && (!c.mode || c.mode === mode) && c.start && c.end)
    .map((c) => ({ start: c.start!, end: c.end!, extra: true }));
  return [...weekly, ...extra];
}

export function blocksOn(data: CalendarData, date: string) {
  return data.changes.filter((c) => c.kind === "BLOCK" && c.fromDate <= date && c.toDate >= date);
}

/**
 * Free start times for one kind of session, per Perth date.
 * `minutes` is the service's own length (e.g. 90 for a regression); without it the calendar's
 * normal in-person / online length is used. The break after a session stays the calendar's.
 */
export function freeSlots(data: CalendarData, mode: BookingMode, from: string, to: string, now = new Date(), minutes?: number | null): Record<string, Slot[]> {
  const shape = sessionShape(data.rules, mode);
  const length = minutes && minutes >= 15 && minutes <= 480 ? minutes : shape.length;
  const gap = shape.gap;
  const earliest = now.getTime() + data.rules.bookingNoticeHours * 3600_000;
  const last = addDays(data.today, data.rules.bookingDaysAhead);
  const out: Record<string, Slot[]> = {};

  for (let date = from; date <= to && date <= last; date = addDays(date, 1)) {
    // Blocks for this kind of session (in-person / online), plus older blocks that cover both.
    const blocks = blocksOn(data, date).filter((b) => !b.mode || b.mode === mode);
    if (blocks.some((b) => !b.start)) continue; // blocked all day
    const busy = data.bookings.filter((b) => b.date === date).map((b) => [toMin(b.start), toMin(b.end)] as const);
    const blocked = blocks.map((b) => [toMin(b.start!), toMin(b.end!)] as const);
    const seen = new Set<number>();
    const slots: Slot[] = [];

    for (const w of windowsFor(data, mode, date)) {
      for (let s = toMin(w.start); s + length <= toMin(w.end); s += length + gap) {
        const e = s + length;
        if (seen.has(s)) continue;
        if (blocked.some(([bs, be]) => overlaps(s, e, bs, be))) continue;
        if (busy.some(([bs, be]) => overlaps(s, e, bs, be))) continue;
        const startsAt = perthMoment(date, fromMin(s));
        if (startsAt.getTime() < earliest) continue;
        seen.add(s);
        slots.push({ start: fromMin(s), end: fromMin(e), startsAt: startsAt.toISOString(), endsAt: perthMoment(date, fromMin(e)).toISOString() });
      }
    }
    if (slots.length) out[date] = slots.sort((a, b) => a.start.localeCompare(b.start));
  }
  return out;
}

/** Every session time on a day from her hours, before blocks, bookings and notice are taken out. */
export function daySlots(data: CalendarData, mode: BookingMode, date: string): { start: string; end: string }[] {
  const { length, gap } = sessionShape(data.rules, mode);
  const seen = new Set<number>();
  const out: { start: string; end: string }[] = [];
  for (const w of windowsFor(data, mode, date)) {
    for (let s = toMin(w.start); s + length <= toMin(w.end); s += length + gap) {
      if (seen.has(s)) continue;
      seen.add(s);
      out.push({ start: fromMin(s), end: fromMin(s + length) });
    }
  }
  return out.sort((a, b) => a.start.localeCompare(b.start));
}
