import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { DATE_RE, TIME_RE } from "@/lib/booking";
import { SlotTakenError, holdSlot, releaseHold, stripe } from "@/lib/booking-payments";

const text = (max: number) => z.string().trim().max(max).optional().default("");

const schema = z.object({
  amount: z.number().int().min(50).max(1_000_000),
  currency: z.string().trim().toLowerCase().default("aud"),
  booking_data: z.object({
    service: z.string().trim().min(1).max(200),
    date: z.string().regex(DATE_RE),
    start: z.string().regex(TIME_RE),
    session_type: z.string().trim().min(1).max(50),
    timezone: z.string().trim().max(64).optional().default(""),
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(200),
    phone: text(50),
    concerns: text(5000),
    previousTherapy: text(5000),
    medicalConditions: text(5000),
  }),
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your booking details and try again." }, { status: 400 });
  }
  const { amount, currency, booking_data: b } = parsed.data;
  const clientName = `${b.firstName} ${b.lastName}`;

  // 1. Keep the time for this person while they pay.
  let booking;
  try {
    booking = await holdSlot({
      sessionType: b.session_type,
      service: b.service,
      date: b.date,
      start: b.start,
      clientName,
      clientEmail: b.email,
      clientPhone: b.phone,
      clientTimezone: b.timezone,
      concerns: b.concerns,
      previousTherapy: b.previousTherapy,
      medicalConditions: b.medicalConditions,
      amount,
      currency,
    });
  } catch (e) {
    if (e instanceof SlotTakenError) {
      return NextResponse.json(
        { error: "Sorry, that time has just been booked or is no longer available. Please choose another time.", code: "SLOT_TAKEN" },
        { status: 409 },
      );
    }
    console.error("Could not hold booking time:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  // 2. Start the card payment.
  try {
    const paymentIntent = await stripe().paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        booking_id: booking.id,
        service: b.service,
        date: b.date,
        time: `${booking.start}-${booking.end} (Perth)`,
        session_type: b.session_type,
        client_name: clientName,
        client_email: b.email,
        client_phone: b.phone,
      },
      description: `Hypnotherapy Session: ${b.service}`,
      receipt_email: b.email,
    });
    await db.booking.update({ where: { id: booking.id }, data: { paymentIntentId: paymentIntent.id } });
    return NextResponse.json({ client_secret: paymentIntent.client_secret, payment_intent_id: paymentIntent.id });
  } catch (error: unknown) {
    await db.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED", cancelledAt: new Date() } });
    console.error("Error creating payment intent:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** The person gave up or the card was declined: free the time straight away. */
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("payment_intent_id");
  if (id && /^pi_[A-Za-z0-9_]+$/.test(id)) await releaseHold(id);
  return NextResponse.json({ ok: true });
}
