import { type NextRequest, NextResponse } from "next/server";
import { confirmBookingPayment } from "@/lib/booking-payments";

/**
 * Called by the booking page right after the card payment succeeds.
 * Stripe is asked directly whether the payment went through, so nothing the browser
 * sends is trusted. The Stripe webhook does the same thing as a backup.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const id = typeof body?.paymentIntentId === "string" ? body.paymentIntentId : "";
  if (!/^pi_[A-Za-z0-9_]+$/.test(id)) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const booking = await confirmBookingPayment(id);
    if (!booking || booking.status !== "CONFIRMED") return NextResponse.json({ ok: false }, { status: 409 });
    return NextResponse.json({ ok: true, date: booking.date, start: booking.start, end: booking.end });
  } catch (e) {
    console.error("Booking confirmation failed:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
