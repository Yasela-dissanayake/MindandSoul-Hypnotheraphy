import type { Booking, BookingMode } from "@prisma/client";
import { db } from "@/lib/db";
import { accountForBuyer } from "@/lib/learning";
import { formatPrice } from "@/lib/currency";
import { PRACTITIONER_EMAIL, sendMail, sessionBookedAdminEmail, sessionBookedEmail } from "@/lib/mail";
import { BOOKING_TZ, freeSlots, loadCalendar } from "@/lib/booking";
import { isValidTimezone } from "@/lib/dates";
import { modesFor, optionLabel, sessionTypeOf } from "@/lib/session-catalog";

// One-to-one sessions: every client is looked after individually.
// Paying for a session or package gives them their own account and their own session plan for that
// service (Rangika fills it with exercises and material). A package's remaining sessions are kept
// on that plan, and the client books them from their portal without paying again.

export class NoSessionsLeftError extends Error {}
export class SessionSlotTakenError extends Error {}

/** Sessions on a plan still to be booked: the plan's total minus its confirmed bookings (none for a recorded journey). */
export async function sessionsLeft(plan: { id: string; totalSessions: number | null; selfPaced?: boolean }) {
  if (plan.selfPaced) return 0;
  const used = await db.booking.count({ where: { planId: plan.id, status: "CONFIRMED", recorded: false } });
  return Math.max(0, (plan.totalSessions ?? 0) - used);
}

/** "Friday 21 November 2026, 10:00 am – 11:00 am (Perth time)" in the reader's time zone. */
function whenText(b: { startsAt: Date; endsAt: Date }, timezone?: string | null) {
  const tz = timezone && isValidTimezone(timezone) ? timezone : BOOKING_TZ;
  const date = b.startsAt.toLocaleDateString("en-AU", { timeZone: tz, weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const t = (d: Date) => d.toLocaleTimeString("en-AU", { timeZone: tz, hour: "numeric", minute: "2-digit" });
  return `${date}, ${t(b.startsAt)} – ${t(b.endsAt)} (${tz === BOOKING_TZ ? "Perth time" : `your time, ${tz.replace(/_/g, " ")}`})`;
}

/**
 * After a paid booking is confirmed: their account (created if new), their plan for this service
 * (an open one gets the package's sessions added; otherwise a new plan), and the booking linked to both.
 * Runs once per booking. Returns the login details for a new account.
 */
export async function attachPaidBooking(bookingId: string) {
  const b = await db.booking.findUnique({ where: { id: bookingId }, include: { option: { include: { service: true } } } });
  if (!b?.option || b.userId) return null;
  const service = b.option.service;
  const { user, login } = await accountForBuyer(b.clientName, b.clientEmail);

  // A recorded journey gets its own self-paced plan; live sessions are added to an open live plan.
  const open = await db.plan.findFirst({
    where: { userId: user.id, sessionServiceId: service.id, completedAt: null, selfPaced: b.recorded },
    orderBy: { createdAt: "desc" },
  });
  const plan = open
    ? await db.plan.update({ where: { id: open.id }, data: { totalSessions: (open.totalSessions ?? 0) + b.option.sessions } })
    : await db.plan.create({
        data: {
          userId: user.id,
          title: b.recorded ? `${service.title} · Recorded journey` : service.title,
          service: service.planService ?? "HYPNOTHERAPY",
          sessionServiceId: service.id,
          selfPaced: b.recorded,
          totalSessions: b.option.sessions,
          currentSession: 1,
          startDate: b.date,
        },
      });
  await db.booking.update({ where: { id: b.id }, data: { userId: user.id, planId: plan.id } });
  return { login, userId: user.id, planId: plan.id };
}

/** The confirmation emails for a session booking (to the client and to Rangika). */
export async function sendSessionEmails(bookingId: string, login?: { username: string; password: string } | null) {
  const b = await db.booking.findUnique({ where: { id: bookingId }, include: { option: true, plan: { select: { id: true, totalSessions: true, title: true, selfPaced: true } } } });
  if (!b) return;
  const left = b.plan ? await sessionsLeft(b.plan) : 0;
  const common = {
    name: b.clientName,
    serviceTitle: b.plan?.title ?? b.service,
    optionTitle: b.credit || !b.option ? "" : optionLabel(b.option),
    inPerson: b.mode === "IN_PERSON",
    paid: b.credit ? null : b.amount === 0 ? "Free (promotion)" : formatPrice(b.amount, b.currency),
    sessionsLeft: left,
    recorded: b.recorded,
  };
  const [toClient, toRangika] = await Promise.all([
    sendMail({ to: b.clientEmail, ...sessionBookedEmail({ ...common, when: whenText(b, b.clientTimezone), login }) }),
    sendMail({
      to: PRACTITIONER_EMAIL,
      replyTo: b.clientEmail,
      ...sessionBookedAdminEmail({
        ...common,
        when: whenText(b, BOOKING_TZ),
        email: b.clientEmail,
        phone: b.clientPhone,
        userId: b.userId,
        clientTimezone: b.clientTimezone,
        concerns: b.concerns,
        previousTherapy: b.previousTherapy,
        medicalConditions: b.medicalConditions,
      }),
    }),
  ]);
  if (!toClient.ok || !toRangika.ok) console.error("Session booking emails failed for", b.id);
}

/**
 * A client books one of the sessions left in their package (no payment). The time is checked and the
 * sessions counted inside one locked transaction, so a package can't be over-booked and two people can't
 * get the same time.
 */
export async function bookWithCredit(input: { userId: string; planId: string; mode: BookingMode; date: string; start: string; clientTimezone?: string | null }): Promise<Booking> {
  const plan = await db.plan.findFirst({
    where: { id: input.planId, userId: input.userId, completedAt: null },
    include: { sessionService: true, user: { select: { name: true, email: true } } },
  });
  if (!plan?.sessionService || !plan.user) throw new NoSessionsLeftError("This plan can't be booked online. Please contact Rangika.");
  if (plan.selfPaced) throw new NoSessionsLeftError("This is a self-paced recorded journey, so there are no live sessions to book.");
  const service = plan.sessionService;
  if (!modesFor(service).includes(input.mode)) throw new NoSessionsLeftError("That kind of session isn't available for this service.");

  const booking = await db.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(7340211)`; // the same lock as paid bookings
      const used = await tx.booking.count({ where: { planId: plan.id, status: "CONFIRMED", recorded: false } });
      if (used >= (plan.totalSessions ?? 0)) throw new NoSessionsLeftError("You've booked all the sessions in your package.");
      const data = await loadCalendar(input.date, input.date, tx);
      const slot = (freeSlots(data, input.mode, input.date, input.date, new Date(), service.minutes)[input.date] ?? []).find((s) => s.start === input.start);
      if (!slot) throw new SessionSlotTakenError("Sorry, that time has just been booked. Please choose another time.");
      return tx.booking.create({
        data: {
          status: "CONFIRMED",
          mode: input.mode,
          sessionType: sessionTypeOf(input.mode),
          service: service.title,
          date: input.date,
          start: slot.start,
          end: slot.end,
          startsAt: new Date(slot.startsAt),
          endsAt: new Date(slot.endsAt),
          clientName: plan.user!.name || plan.user!.email,
          clientEmail: plan.user!.email,
          clientTimezone: input.clientTimezone && isValidTimezone(input.clientTimezone) ? input.clientTimezone : null,
          amount: 0,
          currency: "aud",
          credit: true,
          userId: input.userId,
          planId: plan.id,
          emailedAt: new Date(),
        },
      });
    },
    { timeout: 20_000, maxWait: 10_000 },
  );
  await sendSessionEmails(booking.id);
  return booking;
}
