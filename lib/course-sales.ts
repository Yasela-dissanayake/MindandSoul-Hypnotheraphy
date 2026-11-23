import { db } from "@/lib/db";
import { PRACTITIONER_EMAIL, courseEnrolledEmail, courseSoldEmail, sendMail } from "@/lib/mail";
import { stripe } from "@/lib/booking-payments";
import { PurchaseError, accountForBuyer, money, settleOpenPayments, slugify } from "@/lib/learning";
import { classPrice, type Currency } from "@/lib/currency";
import { classesFor, enrollInClass } from "@/lib/class-enroll";
import { promoFor } from "@/lib/promotions";
import { classHref } from "@/lib/site-routes";
import { classDatesInclude, formatClassTime, timeZoneName, upcomingClassTimes } from "@/lib/class-dates";
import { isValidTimezone } from "@/lib/dates";

const tzOf = (tz?: string | null) => (tz && isValidTimezone(tz) ? tz : null);

/** The class days for the enrollment email, in the buyer's own time zone (Perth if we don't know it). */
function classDaysForEmail(c: Parameters<typeof upcomingClassTimes>[0], timezone: string | null) {
  const days = upcomingClassTimes(c);
  if (!days.length) return null;
  const tz = tzOf(timezone) ?? "Australia/Perth";
  return {
    zone: timeZoneName(tz),
    lines: days.map((d) => `${d.label ? `${d.label}: ` : ""}${formatClassTime(d, tz, { year: true })}`),
  };
}

// Taught courses (Reiki Level 1, 2, 3 ...) sold on the website at /courses.
// Paying enrolls the person on the course straight away; Rangika then teaches the class.

export async function uniqueCourseSlug(title: string, excludeId?: string) {
  const base = slugify(title);
  for (let i = 0; i < 50; i++) {
    const slug = i === 0 ? base : `${base}-${i + 1}`;
    const taken = await db.course.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } });
    if (!taken) return slug;
  }
  return `${base}-${Date.now() % 100000}`;
}

/** Courses shown on the website: published, not hidden, with a price. */
export const onSaleWhere = { published: true, archived: false, price: { gte: 50 }, slug: { not: null } } as const;

/**
 * Starts a card payment for a place. The price always comes from the database, never from the browser;
 * `currency` only picks which of the class's prices (AUD or AED) they pay, as shown to them on the page.
 */
export async function startCoursePurchase(input: {
  itemId: string;
  name: string;
  email: string;
  phone?: string;
  currency?: Currency;
  prerequisiteDone?: boolean;
  timezone?: string;
}) {
  const course = await db.course.findFirst({ where: { id: input.itemId, ...onSaleWhere } });
  if (!course) throw new PurchaseError("This class is not open for enrollment any more.");
  if (course.seats !== null && course.seats <= 0) throw new PurchaseError("Sorry, this class is full. Please contact Rangika to join the waiting list.");
  if (course.prerequisite && !input.prerequisiteDone) {
    throw new PurchaseError(`This class is for people who have completed ${course.prerequisite}. Please tick the box to confirm.`);
  }
  const email = input.email.trim().toLowerCase();

  const wanted = await classesFor(course.id);

  // An unfinished payment for another class that overlaps this one (e.g. the Level 1 & 2 bundle in another tab):
  // if it went through, enroll them first so the checks below see it; if it's still going through, wait;
  // otherwise cancel it, so they can't end up paying for the same class twice.
  const others = await db.coursePurchase.findMany({
    where: { email, status: "PENDING", courseId: { not: course.id } },
    select: { id: true, courseId: true, paymentIntentId: true },
  });
  for (const o of others) {
    if (!(await classesFor(o.courseId)).some((id) => wanted.includes(id))) continue;
    const markFailed = () => db.coursePurchase.updateMany({ where: { id: o.id, status: "PENDING" }, data: { status: "FAILED" } });
    if (!o.paymentIntentId) {
      await markFailed();
      continue;
    }
    const pi = await stripe().paymentIntents.retrieve(o.paymentIntentId);
    if (pi.status === "succeeded") await fulfilCoursePurchase(pi.id);
    else if (pi.status === "processing") {
      throw new PurchaseError("Your payment for a class in this one is still going through. Please wait a minute, then sign in or check your email.", { owned: true });
    } else {
      if (pi.status !== "canceled") await stripe().paymentIntents.cancel(pi.id).catch(() => {});
      await markFailed();
    }
  }

  // What they already have of it (for a bundle: of each class in it).
  const mine = await db.user.findUnique({
    where: { email },
    select: { enrollments: { where: { courseId: { in: wanted } }, select: { courseId: true, completedAt: true, course: { select: { title: true } } } } },
  });
  const have = mine?.enrollments ?? [];
  // Already enrolled (and not finished) in all of it: no need to pay twice.
  if (have.filter((e) => !e.completedAt).length >= wanted.length) {
    throw new PurchaseError("You're already enrolled in this class. Please sign in to see it.", { owned: true });
  }
  // A bundle that includes classes they already have: they'd pay again for those. Point them to only what's missing.
  if (wanted.length > 1 && have.length > 0) {
    const haveIds = new Set(have.map((e) => e.courseId));
    const missing = await db.course.findMany({
      where: { id: { in: wanted.filter((id) => !haveIds.has(id)) } },
      orderBy: [{ order: "asc" }, { title: "asc" }],
      select: { title: true, slug: true, published: true, archived: true },
    });
    const list = (t: string[]) => (t.length <= 1 ? t.join("") : `${t.slice(0, -1).join(", ")} and ${t[t.length - 1]}`);
    const owned = list(have.map((e) => e.course.title));
    if (missing.length === 0) {
      throw new PurchaseError(`You already have every class in this bundle (${owned}). Please sign in to see them.`, { owned: true });
    }
    const need = list(missing.map((m) => m.title));
    throw new PurchaseError(
      `You already have ${owned}, so this bundle would charge you for ${have.length === 1 ? "it" : "them"} again. You only need ${need}.`,
      {
        owned: true,
        suggest: missing.filter((m) => m.slug && m.published && !m.archived).map((m) => ({ title: m.title, href: classHref(m) })),
      },
    );
  }
  await settleOpenPayments(
    await db.coursePurchase.findMany({ where: { courseId: course.id, email, status: "PENDING" }, select: { id: true, paymentIntentId: true } }),
    fulfilCoursePurchase,
    (id) => db.coursePurchase.updateMany({ where: { id, status: "PENDING" }, data: { status: "FAILED" } }),
    "You've already paid for this class and your place is booked. Please sign in to see it (your login details were emailed to you).",
  );

  const price = classPrice(course, input.currency ?? "aud");

  // Free while a promotion runs: no card. Same checks as above, then they're enrolled straight away.
  if ((await promoFor("class", course.id)).free) {
    const purchase = await db.coursePurchase.create({
      data: { courseId: course.id, name: input.name.trim(), email, phone: input.phone?.trim() || null, amount: 0, currency: price.currency, timezone: tzOf(input.timezone) },
    });
    const done = await completeCoursePurchase(purchase.id);
    return { free: true as const, newAccount: Boolean(done?.newAccount) };
  }

  const purchase = await db.coursePurchase.create({
    data: { courseId: course.id, name: input.name.trim(), email, phone: input.phone?.trim() || null, amount: price.amount, currency: price.currency, timezone: tzOf(input.timezone) },
  });
  try {
    const pi = await stripe().paymentIntents.create({
      amount: price.amount,
      currency: price.currency,
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      description: `Class: ${course.title}`,
      metadata: { kind: "course", purchase_id: purchase.id, course: course.title, client_email: email },
    });
    await db.coursePurchase.update({ where: { id: purchase.id }, data: { paymentIntentId: pi.id } });
    return { free: false as const, clientSecret: pi.client_secret!, paymentIntentId: pi.id };
  } catch (e) {
    await db.coursePurchase.update({ where: { id: purchase.id }, data: { status: "FAILED" } });
    throw e;
  }
}

/**
 * After Stripe says the payment went through: create the account if needed, enroll them,
 * take one place off, and send the emails. Runs once, whether the browser or the webhook calls it.
 */
export async function fulfilCoursePurchase(paymentIntentId: string) {
  const purchase = await db.coursePurchase.findUnique({ where: { paymentIntentId }, include: { course: true } });
  if (!purchase) return null;
  if (purchase.status === "PAID") return purchase;

  const pi = await stripe().paymentIntents.retrieve(paymentIntentId);
  if (pi.status !== "succeeded" || pi.amount_received < purchase.amount) return null;
  return completeCoursePurchase(purchase.id);
}

/**
 * Paid (or free under a promotion): create the account if needed, enroll them, take one place off,
 * and send the emails. Only the first caller does it.
 */
async function completeCoursePurchase(purchaseId: string) {
  const purchase = await db.coursePurchase.findUnique({ where: { id: purchaseId }, include: { course: { include: classDatesInclude } } });
  if (!purchase) return null;
  const claimed = await db.coursePurchase.updateMany({ where: { id: purchase.id, status: "PENDING" }, data: { status: "PAID", paidAt: new Date() } });
  if (claimed.count === 0) return db.coursePurchase.findUnique({ where: { id: purchase.id } });

  const { user, login } = await accountForBuyer(purchase.name, purchase.email);

  // A bundle enrolls them in each class it includes.
  await enrollInClass(user.id, purchase.courseId, { reopen: true });
  await db.coursePurchase.update({ where: { id: purchase.id }, data: { userId: user.id, newAccount: Boolean(login) } });
  await db.course.updateMany({ where: { id: purchase.courseId, seats: { gt: 0 } }, data: { seats: { decrement: 1 } } });
  const seatsLeft = (await db.course.findUnique({ where: { id: purchase.courseId }, select: { seats: true } }))?.seats ?? null;

  const c = purchase.course;
  const [toStudent, toRangika] = await Promise.all([
    sendMail({
      to: purchase.email,
      ...courseEnrolledEmail({ name: purchase.name, courseTitle: c.title, schedule: c.schedule, format: c.format, login, classDays: classDaysForEmail(c, purchase.timezone) }),
    }),
    sendMail({
      to: PRACTITIONER_EMAIL,
      replyTo: purchase.email,
      ...courseSoldEmail({ name: purchase.name, email: purchase.email, phone: purchase.phone, courseTitle: c.title, amount: purchase.amount === 0 ? "Free (promotion)" : money(purchase.amount, purchase.currency), seatsLeft }),
    }),
  ]);
  if (!toStudent.ok || !toRangika.ok) console.error("Course enrollment emails failed for", purchase.id);

  return db.coursePurchase.findUnique({ where: { id: purchase.id } });
}

export async function markCoursePurchaseFailed(paymentIntentId: string) {
  await db.coursePurchase.updateMany({ where: { paymentIntentId, status: "PENDING" }, data: { status: "FAILED" } });
}
