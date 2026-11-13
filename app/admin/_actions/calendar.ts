"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { BOOKING_TZ, DATE_RE, TIME_RE, busyWhere, fromMin, toMin } from "@/lib/booking";
import { todayIn } from "@/lib/dates";
import { fail, type ActionResult } from "./common";

const refresh = () => revalidatePath("/admin/calendar");

const daySchema = z.object({
  date: z.string().regex(DATE_RE),
  allDay: z.boolean(),
  ranges: z.array(z.object({ start: z.string().regex(TIME_RE, "Please fill in every time."), end: z.string().regex(TIME_RE, "Please fill in every time.") })).max(20),
});

/**
 * Saves the times of one day Rangika is not available (replaces that day's blocks).
 * Overlapping or touching times are joined into one (1–3 pm and 2–4 pm → 1–4 pm).
 */
export async function saveDayBlocks(input: z.input<typeof daySchema>): Promise<ActionResult<{ clashes: number }>> {
  await requireAdmin();
  const parsed = daySchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please choose a day and the times.");
  const { date, allDay } = parsed.data;
  if (date < todayIn(BOOKING_TZ)) return fail("That day has already passed.");

  const ranges: [number, number][] = [];
  if (!allDay) {
    const sorted = parsed.data.ranges.map((r) => [toMin(r.start), toMin(r.end)] as [number, number]).sort((a, b) => a[0] - b[0]);
    for (const [s, e] of sorted) {
      if (e <= s) return fail(`“${fromMin(s)} to ${fromMin(e)}”: the end time must be after the start time.`);
      const last = ranges[ranges.length - 1];
      if (last && s <= last[1]) last[1] = Math.max(last[1], e);
      else ranges.push([s, e]);
    }
  }

  await db.$transaction([
    db.calendarChange.deleteMany({ where: { kind: "BLOCK", fromDate: date, toDate: date } }),
    ...(allDay
      ? [db.calendarChange.create({ data: { kind: "BLOCK", fromDate: date, toDate: date } })]
      : ranges.map(([s, e]) => db.calendarChange.create({ data: { kind: "BLOCK", fromDate: date, toDate: date, start: fromMin(s), end: fromMin(e) } }))),
  ]);

  // Blocking never cancels a paid booking: tell Rangika so she can contact the person.
  const booked = await db.booking.findMany({ where: { date, ...busyWhere() }, select: { start: true, end: true } });
  const clashes = allDay
    ? booked.length
    : booked.filter((b) => ranges.some(([s, e]) => toMin(b.start) < e && s < toMin(b.end))).length;

  refresh();
  return { ok: true, data: { clashes } };
}

export async function cancelBooking(id: string): Promise<ActionResult> {
  await requireAdmin();
  const res = await db.booking.updateMany({ where: { id, status: { not: "CANCELLED" } }, data: { status: "CANCELLED", cancelledAt: new Date() } });
  if (res.count === 0) return fail("That booking was already cancelled.");
  refresh();
  return { ok: true };
}
