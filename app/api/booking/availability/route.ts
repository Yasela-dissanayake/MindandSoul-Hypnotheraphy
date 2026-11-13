import { type NextRequest, NextResponse } from "next/server";
import { BOOKING_TZ, freeSlots, loadCalendar, modeOf } from "@/lib/booking";
import { addDays, todayIn } from "@/lib/dates";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

/** Free booking times for a kind of session, from today to as far ahead as Rangika allows. */
export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") ?? "in-person";
  if (type.length > 50) return NextResponse.json({ error: "Unknown session type" }, { status: 400 });
  const mode = modeOf(type);

  const from = todayIn(BOOKING_TZ);
  const to = addDays(from, (await getSettings()).bookingDaysAhead);
  const data = await loadCalendar(from, to);

  return NextResponse.json(
    { timezone: BOOKING_TZ, mode, days: freeSlots(data, mode, from, to) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
