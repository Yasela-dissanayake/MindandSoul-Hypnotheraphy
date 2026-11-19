import Stripe from "stripe";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { sendClientBookingConfirmation, sendPractitionerBookingNotification } from "@/lib/email";
import { BOOKING_TZ, freeSlots, loadCalendar, modeOf, time12 } from "@/lib/booking";
import { isValidTimezone } from "@/lib/dates";
import { attachPaidBooking, sendSessionEmails } from "@/lib/session-sales";

const HOLD_MINUTES = 15;

let stripeClient: Stripe | null = null;
export function stripe(): Stripe {
  stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" as Stripe.LatestApiVersion });
  return stripeClient;
}

export type HoldInput = {
  sessionType: string;
  service: string;
  date: string;
  start: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientTimezone?: string;
  concerns?: string;
  previousTherapy?: string;
  medicalConditions?: string;
  amount: number; // cents
  currency: string;
  optionId?: string; // the session or package bought (from the session services)
  minutes?: number | null; // the service's session length; default = the calendar's
};

export class SlotTakenError extends Error {}

/**
 * Keeps the chosen time for this person while they pay, so nobody else can take it.
 * Checks and saves inside one locked transaction, so two people paying at the same moment
 * can't both get the same time.
 */
export async function holdSlot(input: HoldInput) {
  const mode = modeOf(input.sessionType);
  const email = input.clientEmail.trim().toLowerCase();
  await getSettings(); // makes sure the settings row exists before the transaction reads it
  return db.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(7340211)`;
      // Their own earlier attempt for this time (e.g. a declined card) shouldn't block them.
      await tx.booking.updateMany({
        where: { status: "HELD", clientEmail: email, date: input.date, start: input.start },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      });
      const data = await loadCalendar(input.date, input.date, tx);
      const slot = (freeSlots(data, mode, input.date, input.date, new Date(), input.minutes)[input.date] ?? []).find((s) => s.start === input.start);
      if (!slot) throw new SlotTakenError();
      return tx.booking.create({
        data: {
          status: "HELD",
          heldUntil: new Date(Date.now() + HOLD_MINUTES * 60_000),
          mode,
          sessionType: input.sessionType,
          service: input.service,
          date: input.date,
          start: slot.start,
          end: slot.end,
          startsAt: new Date(slot.startsAt),
          endsAt: new Date(slot.endsAt),
          clientName: input.clientName,
          clientEmail: email,
          clientPhone: input.clientPhone || null,
          clientTimezone: input.clientTimezone && isValidTimezone(input.clientTimezone) ? input.clientTimezone : null,
          concerns: input.concerns || null,
          previousTherapy: input.previousTherapy || null,
          medicalConditions: input.medicalConditions || null,
          amount: input.amount,
          currency: input.currency,
          optionId: input.optionId ?? null,
        },
      });
    },
    { timeout: 20_000, maxWait: 10_000 },
  );
}

export function bookingTimeLabel(b: { start: string; end: string }) {
  return `${time12(b.start)} – ${time12(b.end)} (Perth time)`;
}

/** The booking's date and time in the client's own time zone, for their confirmation email. */
function clientTime(b: { startsAt: Date; endsAt: Date; clientTimezone: string | null }) {
  const tz = b.clientTimezone && isValidTimezone(b.clientTimezone) ? b.clientTimezone : BOOKING_TZ;
  const t = (d: Date) => d.toLocaleTimeString("en-AU", { timeZone: tz, hour: "numeric", minute: "2-digit" });
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(b.startsAt);
  return { date, time: `${t(b.startsAt)} – ${t(b.endsAt)} (${tz === BOOKING_TZ ? "Perth time" : `your time, ${tz.replace(/_/g, " ")}`})` };
}

/**
 * Marks the booking paid once Stripe says the payment went through, then sends the
 * confirmation emails exactly once. Safe to call from both the browser and the Stripe webhook.
 */
export async function confirmBookingPayment(paymentIntentId: string) {
  const booking = await db.booking.findUnique({ where: { paymentIntentId } });
  if (!booking) return null;
  if (booking.status !== "CONFIRMED") {
    const pi = await stripe().paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== "succeeded") return null;
    // A cancelled booking stays cancelled (Rangika cancelled it, or it was replaced).
    await db.booking.updateMany({ where: { id: booking.id, status: "HELD" }, data: { status: "CONFIRMED", heldUntil: null } });
  }
  const fresh = await db.booking.findUniqueOrThrow({ where: { id: booking.id } });
  if (fresh.status !== "CONFIRMED") return fresh;

  // Only the first caller sends the emails.
  const claimed = await db.booking.updateMany({ where: { id: fresh.id, emailedAt: null }, data: { emailedAt: new Date() } });
  if (claimed.count === 1 && fresh.optionId) {
    // Booked from a session service: give them their account and their own session plan, then email both of them.
    const attached = await attachPaidBooking(fresh.id);
    await sendSessionEmails(fresh.id, attached?.login);
    return db.booking.findUniqueOrThrow({ where: { id: fresh.id } });
  }
  if (claimed.count === 1) {
    const common = {
      clientName: fresh.clientName,
      clientEmail: fresh.clientEmail,
      service: fresh.service,
      date: fresh.date,
      time: bookingTimeLabel(fresh),
      sessionType: fresh.sessionType,
      amount: fresh.amount / 100,
      currency: fresh.currency,
      paymentIntentId,
      concerns: fresh.concerns ?? "",
    };
    const [client, practitioner] = await Promise.all([
      // The client sees their own date and time; Rangika sees Perth time.
      sendClientBookingConfirmation({ ...common, ...clientTime(fresh) }),
      sendPractitionerBookingNotification({
        ...common,
        time: fresh.clientTimezone && fresh.clientTimezone !== BOOKING_TZ ? `${common.time} · client is in ${fresh.clientTimezone.replace(/_/g, " ")}` : common.time,
        clientPhone: fresh.clientPhone ?? "",
        previousTherapy: fresh.previousTherapy ?? undefined,
        medicalConditions: fresh.medicalConditions ?? undefined,
      }),
    ]);
    if (!client.success || !practitioner.success) console.error("Booking emails failed for", fresh.id, { client, practitioner });
  }
  return fresh;
}

/** Payment failed: let the time go straight away instead of waiting for the hold to run out. */
export async function releaseHold(paymentIntentId: string) {
  await db.booking.updateMany({ where: { paymentIntentId, status: "HELD" }, data: { status: "CANCELLED", cancelledAt: new Date() } });
}
