import type { Lesson, LessonSection } from "@prisma/client";
import { classPrice } from "@/lib/currency";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { availableUsername } from "@/lib/accounts";
import { generatePassword, hashPassword, sealForAdmin } from "@/lib/passwords";
import { PRACTITIONER_EMAIL, packagePurchasedEmail, packageSoldEmail, sendMail } from "@/lib/mail";
import { notifyAdmins } from "@/lib/notifications";
import { resourceSelect } from "@/lib/material";
import { stripe } from "@/lib/booking-payments";
import { promoFor } from "@/lib/promotions";

/** "AUD 149.00" */
export function money(cents: number, currency = "aud") {
  return `${currency.toUpperCase()} ${(cents / 100).toFixed(2)}`;
}

/** "Reiki for Beginners!" → "reiki-for-beginners" */
export function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "course"
  );
}

export async function uniqueSlug(title: string, excludeId?: string) {
  const base = slugify(title);
  for (let i = 0; i < 50; i++) {
    const slug = i === 0 ? base : `${base}-${i + 1}`;
    const taken = await db.learningPackage.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } });
    if (!taken) return slug;
  }
  return `${base}-${Date.now() % 100000}`;
}

/** Lessons in the order learners take them: section by section, then lessons without a section at the end. */
export function orderLessons<L extends Pick<Lesson, "id" | "sectionId" | "order" | "createdAt">>(sections: Pick<LessonSection, "id" | "order">[], lessons: L[]): L[] {
  const byOrder = (a: L, b: L) => a.order - b.order || a.createdAt.getTime() - b.createdAt.getTime();
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  return [
    ...sorted.flatMap((s) => lessons.filter((l) => l.sectionId === s.id).sort(byOrder)),
    ...lessons.filter((l) => !l.sectionId || !sections.some((s) => s.id === l.sectionId)).sort(byOrder),
  ];
}

/** A learner's package: lessons in order, which are done, and which are open (one after another). */
export async function getLearnerPackage(userId: string, packageId: string) {
  const e = await db.packageEnrollment.findUnique({
    where: { userId_packageId: { userId, packageId } },
    include: {
      progress: { select: { lessonId: true } },
      package: {
        include: {
          sections: { orderBy: { order: "asc" } },
          lessons: { include: { resource: { select: resourceSelect } } },
        },
      },
    },
  });
  if (!e || e.package.archived) return null;
  const done = new Set(e.progress.map((p) => p.lessonId));
  const lessons = orderLessons(e.package.sections, e.package.lessons);
  // A lesson opens once every lesson before it is done.
  const firstNotDone = lessons.findIndex((l) => !done.has(l.id));
  const openUpTo = firstNotDone === -1 ? lessons.length - 1 : firstNotDone;
  return {
    enrollment: e,
    pkg: e.package,
    lessons: lessons.map((l, i) => ({ ...l, number: i + 1, done: done.has(l.id), open: i <= openUpTo })),
    doneCount: lessons.filter((l) => done.has(l.id)).length,
    nextLessonId: firstNotDone === -1 ? null : lessons[firstNotDone].id,
  };
}

export async function getLearnerPackages(userId: string) {
  const list = await db.packageEnrollment.findMany({
    where: { userId, package: { archived: false } },
    orderBy: { startedAt: "desc" },
    include: { package: { select: { id: true, title: true, summary: true, _count: { select: { lessons: true } } } }, _count: { select: { progress: true } } },
  });
  return list.map((e) => ({
    id: e.package.id,
    title: e.package.title,
    summary: e.package.summary,
    total: e.package._count.lessons,
    done: e._count.progress,
    completedAt: e.completedAt,
    hasCertificate: Boolean(e.certificateKey),
  }));
}

// ---------- Buying on the website ----------

export class PurchaseError extends Error {
  /**
   * owned = they already have it (or already paid for it): the website offers "Sign in" instead of "Try again".
   * suggest = what to buy instead (e.g. only the class missing from a bundle), shown as buttons.
   */
  constructor(message: string, readonly opts: { owned?: boolean; suggest?: { title: string; href: string }[] } = {}) {
    super(message);
  }
}

/**
 * Before a new payment starts, look at this person's earlier unfinished payments for the same item:
 * - already paid (but the setup never finished, e.g. the page was closed): finish the setup now and
 *   tell them they already have it, so they are never charged twice;
 * - still going through: ask them to wait;
 * - not paid: cancel it, so an old checkout left open in another tab can't be paid as well.
 */
export async function settleOpenPayments(open: { id: string; paymentIntentId: string | null }[], fulfil: (paymentIntentId: string) => Promise<unknown>, markFailed: (id: string) => Promise<unknown>, alreadyMessage: string) {
  for (const p of open) {
    if (!p.paymentIntentId) {
      await markFailed(p.id);
      continue;
    }
    const pi = await stripe().paymentIntents.retrieve(p.paymentIntentId);
    if (pi.status === "succeeded") {
      await fulfil(pi.id);
      throw new PurchaseError(alreadyMessage, { owned: true });
    }
    if (pi.status === "processing") throw new PurchaseError("Your earlier payment is still going through. Please wait a minute, then sign in or check your email.", { owned: true });
    if (pi.status !== "canceled") {
      try {
        await stripe().paymentIntents.cancel(pi.id);
      } catch {
        // It was paid at this very moment: check once more.
        const again = await stripe().paymentIntents.retrieve(pi.id);
        if (again.status === "succeeded" || again.status === "processing") {
          if (again.status === "succeeded") await fulfil(pi.id);
          throw new PurchaseError(alreadyMessage, { owned: true });
        }
      }
    }
    await markFailed(p.id);
  }
}

/** Starts a card payment. The price always comes from the database, never from the browser. */
export async function startPurchase(input: { packageId: string; name: string; email: string; currency?: "aud" | "aed" }) {
  const pkg = await db.learningPackage.findFirst({ where: { id: input.packageId, published: true, archived: false } });
  if (!pkg) throw new PurchaseError("This course is not available any more.");
  if (pkg.price < 50 && !(await promoFor("course", pkg.id)).free) throw new PurchaseError("This course has no price yet.");
  const email = input.email.trim().toLowerCase();

  // Already has it: no need to pay twice.
  const existing = await db.user.findUnique({ where: { email }, select: { learningEnrollments: { where: { packageId: pkg.id }, select: { id: true } } } });
  if (existing?.learningEnrollments.length) throw new PurchaseError("You already have this course. Please sign in to continue it.", { owned: true });
  await settleOpenPayments(
    await db.packagePurchase.findMany({ where: { packageId: pkg.id, email, status: "PENDING" }, select: { id: true, paymentIntentId: true } }),
    fulfilPurchase,
    (id) => db.packagePurchase.updateMany({ where: { id, status: "PENDING" }, data: { status: "FAILED" } }),
    "You've already paid for this course. Please sign in to continue it (your login details were emailed to you).",
  );

  // The price they saw: AED for visitors in the UAE (when the course has one), otherwise AUD.
  const price = classPrice(pkg, input.currency ?? "aud");

  // Free while a promotion runs: no card, they get the course straight away.
  if ((await promoFor("course", pkg.id)).free) {
    const purchase = await db.packagePurchase.create({
      data: { packageId: pkg.id, name: input.name.trim(), email, amount: 0, currency: pkg.currency },
    });
    const done = await completePurchase(purchase.id);
    return { free: true as const, newAccount: Boolean(done?.newAccount) };
  }

  const purchase = await db.packagePurchase.create({
    data: { packageId: pkg.id, name: input.name.trim(), email, amount: price.amount, currency: price.currency },
  });
  try {
    const pi = await stripe().paymentIntents.create({
      amount: price.amount,
      currency: price.currency,
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      description: `Online course: ${pkg.title}`,
      metadata: { kind: "learning_package", purchase_id: purchase.id, package: pkg.title, client_email: email },
    });
    await db.packagePurchase.update({ where: { id: purchase.id }, data: { paymentIntentId: pi.id } });
    return { free: false as const, clientSecret: pi.client_secret!, paymentIntentId: pi.id };
  } catch (e) {
    await db.packagePurchase.update({ where: { id: purchase.id }, data: { status: "FAILED" } });
    throw e;
  }
}

/**
 * The account a website buyer gets access on: their existing account, or a new one with a
 * generated password (returned so it can be emailed to them once).
 */
export async function accountForBuyer(name: string, email: string) {
  let user = await db.user.findUnique({ where: { email } });
  let login: { username: string; password: string } | null = null;
  if (!user) {
    const settings = await getSettings();
    const username = await availableUsername(name || email.split("@")[0]);
    const password = generatePassword();
    user = await db.user.create({
      data: {
        email,
        name,
        username,
        role: "CLIENT",
        status: "INVITED",
        invitedAt: new Date(),
        timezone: settings.adminTimezone,
        reminderHour: settings.defaultReminderHour,
        passwordHash: await hashPassword(password),
        passwordView: sealForAdmin(password),
        passwordChangedAt: new Date(),
      },
    });
    login = { username, password };
  } else if (user.status === "FINISHED") {
    // A past client buying again: open their account again.
    user = await db.user.update({ where: { id: user.id }, data: { status: "ACTIVE" } });
  }
  return { user, login };
}

/**
 * After Stripe says the payment went through: create the account if needed, give access,
 * and send the emails. Runs once per purchase, whether the browser or the Stripe webhook calls it.
 */
export async function fulfilPurchase(paymentIntentId: string) {
  const purchase = await db.packagePurchase.findUnique({ where: { paymentIntentId }, include: { package: true } });
  if (!purchase) return null;
  if (purchase.status === "PAID") return purchase;

  const pi = await stripe().paymentIntents.retrieve(paymentIntentId);
  if (pi.status !== "succeeded" || pi.amount_received < purchase.amount) return null;
  return completePurchase(purchase.id);
}

/** Paid (or free under a promotion): create the account if needed, give access, send the emails. Only the first caller does it. */
async function completePurchase(purchaseId: string) {
  const purchase = await db.packagePurchase.findUnique({ where: { id: purchaseId }, include: { package: true } });
  if (!purchase) return null;
  const claimed = await db.packagePurchase.updateMany({ where: { id: purchase.id, status: "PENDING" }, data: { status: "PAID", paidAt: new Date() } });
  if (claimed.count === 0) return db.packagePurchase.findUnique({ where: { id: purchase.id } });

  const { user, login } = await accountForBuyer(purchase.name, purchase.email);

  await db.packageEnrollment.upsert({
    where: { userId_packageId: { userId: user.id, packageId: purchase.packageId } },
    update: {},
    create: { userId: user.id, packageId: purchase.packageId },
  });
  await db.packagePurchase.update({ where: { id: purchase.id }, data: { userId: user.id, newAccount: Boolean(login) } });

  await notifyAdmins({
    kind: "COURSE_SALE",
    title: `Course bought: ${purchase.name}`,
    body: `${purchase.package.title} · ${purchase.amount === 0 ? "Free (promotion)" : money(purchase.amount, purchase.currency)}`,
    href: "/admin/bookings?tab=learning",
  });
  const [toLearner, toRangika] = await Promise.all([
    sendMail({ to: purchase.email, ...packagePurchasedEmail({ name: purchase.name, packageTitle: purchase.package.title, login }) }),
    sendMail({
      to: PRACTITIONER_EMAIL,
      ...packageSoldEmail({ name: purchase.name, email: purchase.email, packageTitle: purchase.package.title, amount: purchase.amount === 0 ? "Free (promotion)" : money(purchase.amount, purchase.currency), userId: user.id }),
    }),
  ]);
  if (!toLearner.ok || !toRangika.ok) console.error("Course purchase emails failed for", purchase.id);

  return db.packagePurchase.findUnique({ where: { id: purchase.id } });
}

export async function markPurchaseFailed(paymentIntentId: string) {
  await db.packagePurchase.updateMany({ where: { paymentIntentId, status: "PENDING" }, data: { status: "FAILED" } });
}
