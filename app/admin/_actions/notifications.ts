"use server";

import { requireAdmin } from "@/lib/authz";
import { db } from "@/lib/db";
import type { PortalNotification } from "@/app/portal/notification-actions";

// Rangika's bell in the dashboard: new bookings and purchases, enquiries, questions, journal entries, uploads…

export async function getAdminNotifications(): Promise<{ unread: number; items: PortalNotification[] }> {
  const user = await requireAdmin();
  const [unread, rows] = await Promise.all([
    db.notification.count({ where: { userId: user.id, readAt: null } }),
    db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 40 }),
  ]);
  return {
    unread,
    items: rows.map((n) => ({ id: n.id, kind: n.kind, title: n.title, body: n.body, href: n.href, read: Boolean(n.readAt), at: n.createdAt.toISOString() })),
  };
}

export async function countAdminUnread(): Promise<number> {
  const user = await requireAdmin();
  return db.notification.count({ where: { userId: user.id, readAt: null } });
}

export async function markAdminNotificationRead(id: string) {
  const user = await requireAdmin();
  await db.notification.updateMany({ where: { id, userId: user.id, readAt: null }, data: { readAt: new Date() } });
}

export async function markAllAdminNotificationsRead() {
  const user = await requireAdmin();
  await db.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
}
