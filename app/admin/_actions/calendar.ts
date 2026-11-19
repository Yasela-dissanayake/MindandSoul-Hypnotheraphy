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
  ranges: z
    .array(
      z.object({
        start: z.string().regex(TIME_RE, "Please fill in every time."),
        end: z.string().regex(TIME_RE, "Please fill in every time."),
        // which kind of session the block is for; empty = both
        mode: z.enum(["IN_PERSON", "DISTANCE"]).nullable().optional(),
      }),
    )
    .max(40),
});

/**
 * Saves the times of one day Rangika is not available (replaces that day's blocks).
 * Each block is for in-person or online sessions (or both). Overlapping or touching times of the
 * same kind are joined into one (1–3 pm and 2–4 pm → 1–4 pm).
 */
export async function saveDayBlocks(input: z.input<typeof daySchema>): Promise<ActionResult<{ clashes: number }>> {
  await requireAdmin();
  const parsed = daySchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please choose a day and the times.");
  const { date, allDay } = parsed.data;
  if (date < todayIn(BOOKING_TZ)) return fail("That day has already passed.");

  type Mode = "IN_PERSON" | "DISTANCE" | null;
  const ranges: [number, number, Mode][] = [];
  if (!allDay) {
    const sorted = parsed.data.ranges
      .map((r) => [toMin(r.start), toMin(r.end), r.mode ?? null] as [number, number, Mode])
      .sort((a, b) => String(a[2]).localeCompare(String(b[2])) || a[0] - b[0]);
    for (const [s, e, m] of sorted) {
      if (e <= s) return fail(`“${fromMin(s)} to ${fromMin(e)}”: the end time must be after the start time.`);
      const last = ranges[ranges.length - 1];
      if (last && last[2] === m && s <= last[1]) last[1] = Math.max(last[1], e);
      else ranges.push([s, e, m]);
    }
  }

  await db.$transaction([
    db.calendarChange.deleteMany({ where: { kind: "BLOCK", fromDate: date, toDate: date } }),
    ...(allDay
      ? [db.calendarChange.create({ data: { kind: "BLOCK", fromDate: date, toDate: date } })]
      : ranges.map(([s, e, m]) => db.calendarChange.create({ data: { kind: "BLOCK", fromDate: date, toDate: date, start: fromMin(s), end: fromMin(e), mode: m } }))),
  ]);

  // Blocking never cancels a paid booking: tell Rangika so she can contact the person.
  const booked = await db.booking.findMany({ where: { date, ...busyWhere() }, select: { start: true, end: true, mode: true } });
  const clashes = allDay
    ? booked.length
    : booked.filter((b) => ranges.some(([s, e, m]) => (!m || m === b.mode) && toMin(b.start) < e && s < toMin(b.end))).length;

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
