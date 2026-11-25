"use server";

import { requireClient } from "@/lib/authz";
import { db } from "@/lib/db";

export type PortalNotification = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  href: string | null;
  read: boolean;
  at: string; // ISO time it arrived (or last had something merged in)
};

/** The bell: how many unread, and the latest notifications. */
export async function getMyNotifications(): Promise<{ unread: number; items: PortalNotification[] }> {
  const user = await requireClient();
  const [unread, rows] = await Promise.all([
    db.notification.count({ where: { userId: user.id, readAt: null } }),
    db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 }),
  ]);
  return {
    unread,
    items: rows.map((n) => ({ id: n.id, kind: n.kind, title: n.title, body: n.body, href: n.href, read: Boolean(n.readAt), at: n.createdAt.toISOString() })),
  };
}

/** Just the number (for keeping the bell up to date). */
export async function countMyUnread(): Promise<number> {
  const user = await requireClient();
  return db.notification.count({ where: { userId: user.id, readAt: null } });
}

export async function markNotificationRead(id: string) {
  const user = await requireClient();
  await db.notification.updateMany({ where: { id, userId: user.id, readAt: null }, data: { readAt: new Date() } });
}

export async function markAllNotificationsRead() {
  const user = await requireClient();
  await db.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
}
