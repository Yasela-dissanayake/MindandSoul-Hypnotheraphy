import { db } from "@/lib/db";

/**
 * Notifications: the bell at the top of the client portal and of Rangika's dashboard.
 *
 * - Clients: Rangika's actions in the dashboard call `notify` (adding material, a task, answering a question,
 *   booking or cancelling a session…).
 * - Rangika: what clients and visitors do calls `notifyAdmins` (a booking or purchase on the website, an enquiry,
 *   a question, a journal entry, an upload…).
 *
 * Several of the same kind for the same place within a few hours are merged into one
 * ("Rangika added 3 new items"), so a busy afternoon of editing doesn't flood the client.
 * Notifying never fails the action that caused it.
 */

export type NotificationKind =
  | "MATERIAL"
  | "TASK"
  | "TRACKER"
  | "PROMPT"
  | "ANSWER"
  | "JOURNAL_REPLY"
  | "SESSION_BOOKED"
  | "SESSION_CANCELLED"
  | "ZOOM_LINK"
  | "PLAN"
  | "CLASS"
  | "CLASS_MATERIAL"
  | "CERTIFICATE"
  | "COURSE"
  | "LESSON"
  // For Rangika (admin)
  | "NEW_BOOKING"
  | "CLASS_SALE"
  | "COURSE_SALE"
  | "ENQUIRY"
  | "QUESTION"
  | "UPLOAD"
  | "JOURNAL"
  | "COURSE_FINISHED";

export type NewNotification = {
  kind: NotificationKind;
  /** Shown in bold, e.g. "New material from Rangika". */
  title: string;
  /** One line under it, e.g. the item's name. */
  body?: string | null;
  /** Where it opens in the portal. */
  href?: string | null;
  /**
   * Merge with an unread one of the same kind and place from the last few hours. `many(n)` gives the title
   * for n merged items (e.g. "3 new items from Rangika"); bodies are joined.
   */
  merge?: { many: (n: number) => string };
};

const MERGE_WINDOW_MS = 6 * 60 * 60 * 1000;
const KEEP_DAYS = 120;

/** Who can be notified: active clients only (not admins, not people Rangika has marked as finished). */
async function reachable(userIds: string[]) {
  if (!userIds.length) return [];
  const users = await db.user.findMany({ where: { id: { in: [...new Set(userIds)] }, role: "CLIENT", status: { not: "FINISHED" } }, select: { id: true } });
  return users.map((u) => u.id);
}

const joinBodies = (a: string | null, b: string | null | undefined) => {
  if (!b) return a;
  if (!a) return b;
  const parts = a.split(", ");
  if (parts.includes(b)) return a;
  const all = [...parts, b];
  return (all.length > 3 ? [...all.slice(0, 3), `and ${all.length - 3} more`] : all).join(", ").slice(0, 300);
};

/** Adds a notification for one or more clients. Never throws. */
export async function notify(userIds: string | string[] | null | undefined, n: NewNotification) {
  try {
    const ids = await reachable(([] as (string | null | undefined)[]).concat(userIds).filter((x): x is string => Boolean(x)));
    await deliver(ids, n);
  } catch (e) {
    console.error("Notification failed:", n.kind, e);
  }
}

/** Adds a notification for Rangika (every admin account). Never throws. */
export async function notifyAdmins(n: NewNotification) {
  try {
    const admins = await db.user.findMany({ where: { role: "ADMIN", status: { not: "FINISHED" } }, select: { id: true } });
    await deliver(
      admins.map((a) => a.id),
      n,
    );
  } catch (e) {
    console.error("Admin notification failed:", n.kind, e);
  }
}

async function deliver(ids: string[], n: NewNotification) {
  {
    const since = new Date(Date.now() - MERGE_WINDOW_MS);
    await Promise.all(
      ids.map(async (userId) => {
        if (n.merge) {
          const open = await db.notification.findFirst({
            where: { userId, kind: n.kind, href: n.href ?? null, readAt: null, createdAt: { gte: since } },
            orderBy: { createdAt: "desc" },
          });
          if (open) {
            const count = open.count + 1;
            await db.notification.update({
              where: { id: open.id },
              data: { count, title: n.merge.many(count), body: joinBodies(open.body, n.body), createdAt: new Date() }, // moves to the top as new
            });
            return;
          }
        }
        await db.notification.create({ data: { userId, kind: n.kind, title: n.title, body: n.body ?? null, href: n.href ?? null } });
      }),
    );
    // Tidy: old notifications are removed after a while.
    if (Math.random() < 0.05) {
      await db.notification.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - KEEP_DAYS * 86_400_000) } } });
    }
  }
}

/** The client of a session plan (none for a ready-made package). */
export async function planOwner(planId: string) {
  const plan = await db.plan.findUnique({ where: { id: planId }, select: { userId: true, title: true } });
  return plan?.userId ? { userId: plan.userId, title: plan.title } : null;
}

/** Everyone enrolled in a Reiki Training class. */
export async function classStudents(courseId: string) {
  const rows = await db.enrollment.findMany({ where: { courseId }, select: { userId: true } });
  return rows.map((r) => r.userId);
}

/** Everyone who has a self-paced course. */
export async function courseLearners(packageId: string) {
  const rows = await db.packageEnrollment.findMany({ where: { packageId }, select: { userId: true } });
  return rows.map((r) => r.userId);
}
