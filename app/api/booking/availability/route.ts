import { type NextRequest, NextResponse } from "next/server";
import type { BookingMode } from "@prisma/client";
import { BOOKING_TZ, freeSlots, loadCalendar, modeOf } from "@/lib/booking";
import { addDays, todayIn } from "@/lib/dates";
import { getSettings } from "@/lib/settings";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Free booking times from today to as far ahead as Rangika allows.
 * ?service=<slug>&mode=in-person|distance  → slots as long as that service's sessions
 * ?type=in-person|distance                 → the calendar's normal session length
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const type = sp.get("mode") ?? sp.get("type") ?? "in-person";
  if (type.length > 50) return NextResponse.json({ error: "Unknown session type" }, { status: 400 });
  const mode: BookingMode = modeOf(type);

  let minutes: number | null = null;
  const slug = sp.get("service");
  if (slug) {
    const service = await db.sessionService.findFirst({ where: { slug, published: true, enquiryOnly: false }, select: { minutes: true, inPerson: true, online: true } });
    if (!service) return NextResponse.json({ error: "Unknown service" }, { status: 404 });
    if ((mode === "IN_PERSON" && !service.inPerson) || (mode === "DISTANCE" && !service.online)) {
      return NextResponse.json({ timezone: BOOKING_TZ, mode, days: {} }, { headers: { "Cache-Control": "no-store" } });
    }
    minutes = service.minutes;
  }

  const from = todayIn(BOOKING_TZ);
  const to = addDays(from, (await getSettings()).bookingDaysAhead);
  const data = await loadCalendar(from, to);

  return NextResponse.json(
    { timezone: BOOKING_TZ, mode, days: freeSlots(data, mode, from, to, new Date(), minutes) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
