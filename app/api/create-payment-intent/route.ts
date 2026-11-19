import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { DATE_RE, TIME_RE } from "@/lib/booking";
import { SlotTakenError, holdSlot, releaseHold, stripe } from "@/lib/booking-payments";
import { classPrice } from "@/lib/currency";
import { modesFor, optionLabel, sessionTypeOf } from "@/lib/session-catalog";

const text = (max: number) => z.string().trim().max(max).optional().default("");

// The browser only says WHAT was chosen. The price always comes from the session services in the
// database (never from the browser), in AUD or, for visitors who saw AED, in AED.
const schema = z.object({
  optionId: z.string().min(1).max(50),
  mode: z.enum(["IN_PERSON", "DISTANCE"]),
  currency: z.enum(["aud", "aed"]).default("aud"),
  date: z.string().regex(DATE_RE),
  start: z.string().regex(TIME_RE),
  timezone: z.string().trim().max(64).optional().default(""),
  firstName: z.string().trim().min(1, "Please enter your first name.").max(100),
  lastName: z.string().trim().min(1, "Please enter your last name.").max(100),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  phone: text(50),
  concerns: text(5000),
  previousTherapy: text(5000),
  medicalConditions: text(5000),
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check your booking details and try again." }, { status: 400 });
  }
  const b = parsed.data;

  const option = await db.sessionOption.findUnique({ where: { id: b.optionId }, include: { service: true } });
  const service = option?.service;
  if (!option || !service || !service.published || service.enquiryOnly) {
    return NextResponse.json({ error: "This session can't be booked online any more. Please refresh the page." }, { status: 409 });
  }
  if (!modesFor(service, option).includes(b.mode)) {
    return NextResponse.json({ error: "That kind of session isn't available for this service." }, { status: 400 });
  }
  const price = classPrice(option, b.currency);
  if (price.amount < 50) return NextResponse.json({ error: "This session has no price yet. Please contact Rangika." }, { status: 409 });
  const clientName = `${b.firstName} ${b.lastName}`;

  // 1. Keep the time for this person while they pay.
  let booking;
  try {
    booking = await holdSlot({
      sessionType: sessionTypeOf(b.mode),
      service: service.title,
      date: b.date,
      start: b.start,
      clientName,
      clientEmail: b.email,
      clientPhone: b.phone,
      clientTimezone: b.timezone,
      concerns: b.concerns,
      previousTherapy: b.previousTherapy,
      medicalConditions: b.medicalConditions,
      amount: price.amount,
      currency: price.currency,
      optionId: option.id,
      minutes: service.minutes,
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
      amount: price.amount,
      currency: price.currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        booking_id: booking.id,
        service: service.title,
        option: optionLabel(option),
        date: b.date,
        time: `${booking.start}-${booking.end} (Perth)`,
        session_type: sessionTypeOf(b.mode),
        client_name: clientName,
        client_email: b.email,
        client_phone: b.phone,
      },
      description: `${service.title} · ${optionLabel(option)}`,
      receipt_email: b.email,
    });
    await db.booking.update({ where: { id: booking.id }, data: { paymentIntentId: paymentIntent.id } });
    return NextResponse.json({ client_secret: paymentIntent.client_secret, payment_intent_id: paymentIntent.id });
  } catch (error: unknown) {
    await db.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED", cancelledAt: new Date() } });
    console.error("Error creating payment intent:", error);
    return NextResponse.json({ error: "The payment couldn't be started. Please try again." }, { status: 500 });
  }
}

/** The person gave up or the card was declined: free the time straight away. */
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("payment_intent_id");
  if (id && /^pi_[A-Za-z0-9_]+$/.test(id)) await releaseHold(id);
  return NextResponse.json({ ok: true });
}
