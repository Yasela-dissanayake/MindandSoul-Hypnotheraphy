import { db } from "@/lib/db";
import { PRACTITIONER_EMAIL, courseEnrolledEmail, courseSoldEmail, sendMail } from "@/lib/mail";
import { stripe } from "@/lib/booking-payments";
import { PurchaseError, accountForBuyer, money, settleOpenPayments, slugify } from "@/lib/learning";
import { classPrice, type Currency } from "@/lib/currency";
import { classesFor, enrolInClass } from "@/lib/class-enrol";

// Taught courses (Reiki Level 1, 2, 3 ...) sold on the website at /courses.
// Paying enrols the person on the course straight away; Rangika then teaches the class.

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
}) {
  const course = await db.course.findFirst({ where: { id: input.itemId, ...onSaleWhere } });
  if (!course) throw new PurchaseError("This class is not open for enrolment any more.");
  if (course.seats !== null && course.seats <= 0) throw new PurchaseError("Sorry, this class is full. Please contact Rangika to join the waiting list.");
  if (course.prerequisite && !input.prerequisiteDone) {
    throw new PurchaseError(`This class is for people who have completed ${course.prerequisite}. Please tick the box to confirm.`);
  }
  const email = input.email.trim().toLowerCase();

  // Already has it (for a bundle: every class in it) and hasn't finished: no need to pay twice.
  const wanted = await classesFor(course.id);
  const existing = await db.user.findUnique({ where: { email }, select: { enrollments: { where: { courseId: { in: wanted }, completedAt: null }, select: { id: true } } } });
  if (existing && existing.enrollments.length >= wanted.length) {
    throw new PurchaseError("You're already enrolled in this class. Please sign in to see it.", { owned: true });
  }
  await settleOpenPayments(
    await db.coursePurchase.findMany({ where: { courseId: course.id, email, status: "PENDING" }, select: { id: true, paymentIntentId: true } }),
    fulfilCoursePurchase,
    (id) => db.coursePurchase.updateMany({ where: { id, status: "PENDING" }, data: { status: "FAILED" } }),
    "You've already paid for this class and your place is booked. Please sign in to see it (your login details were emailed to you).",
  );

  const price = classPrice(course, input.currency ?? "aud");
  const purchase = await db.coursePurchase.create({
    data: { courseId: course.id, name: input.name.trim(), email, phone: input.phone?.trim() || null, amount: price.amount, currency: price.currency },
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
    return { clientSecret: pi.client_secret!, paymentIntentId: pi.id };
  } catch (e) {
    await db.coursePurchase.update({ where: { id: purchase.id }, data: { status: "FAILED" } });
    throw e;
  }
}

/**
 * After Stripe says the payment went through: create the account if needed, enrol them,
 * take one place off, and send the emails. Runs once, whether the browser or the webhook calls it.
 */
export async function fulfilCoursePurchase(paymentIntentId: string) {
  const purchase = await db.coursePurchase.findUnique({ where: { paymentIntentId }, include: { course: true } });
  if (!purchase) return null;
  if (purchase.status === "PAID") return purchase;

  const pi = await stripe().paymentIntents.retrieve(paymentIntentId);
  if (pi.status !== "succeeded" || pi.amount_received < purchase.amount) return null;

  // Only the first caller sets everything up.
  const claimed = await db.coursePurchase.updateMany({ where: { id: purchase.id, status: "PENDING" }, data: { status: "PAID", paidAt: new Date() } });
  if (claimed.count === 0) return db.coursePurchase.findUnique({ where: { id: purchase.id } });

  const { user, login } = await accountForBuyer(purchase.name, purchase.email);

  // A bundle enrols them in each class it includes.
  await enrolInClass(user.id, purchase.courseId, { reopen: true });
  await db.coursePurchase.update({ where: { id: purchase.id }, data: { userId: user.id, newAccount: Boolean(login) } });
  await db.course.updateMany({ where: { id: purchase.courseId, seats: { gt: 0 } }, data: { seats: { decrement: 1 } } });
  const seatsLeft = (await db.course.findUnique({ where: { id: purchase.courseId }, select: { seats: true } }))?.seats ?? null;

  const c = purchase.course;
  const [toStudent, toRangika] = await Promise.all([
    sendMail({ to: purchase.email, ...courseEnrolledEmail({ name: purchase.name, courseTitle: c.title, schedule: c.schedule, format: c.format, login }) }),
    sendMail({
      to: PRACTITIONER_EMAIL,
      replyTo: purchase.email,
      ...courseSoldEmail({ name: purchase.name, email: purchase.email, phone: purchase.phone, courseTitle: c.title, amount: money(purchase.amount, purchase.currency), seatsLeft }),
    }),
  ]);
  if (!toStudent.ok || !toRangika.ok) console.error("Course enrolment emails failed for", purchase.id);

  return db.coursePurchase.findUnique({ where: { id: purchase.id } });
}

export async function markCoursePurchaseFailed(paymentIntentId: string) {
  await db.coursePurchase.updateMany({ where: { paymentIntentId, status: "PENDING" }, data: { status: "FAILED" } });
}
