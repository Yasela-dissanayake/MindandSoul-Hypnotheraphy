"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { refreshAll, type ActionResult } from "./common";

export type SaleKind = "sessions" | "courses" | "learning";

/**
 * Clears the "New" marker: on one booking/purchase (an id), on some (a list of ids, e.g. only the
 * Hypnotherapy bookings), on all of one kind (no id), or on everything ("all").
 */
export async function markSalesSeen(kind: SaleKind | "all", id?: string | string[]): Promise<ActionResult> {
  await requireAdmin();
  const now = new Date();
  if (kind === "all") {
    await db.$transaction([
      db.booking.updateMany({ where: { seenAt: null }, data: { seenAt: now } }),
      db.coursePurchase.updateMany({ where: { seenAt: null }, data: { seenAt: now } }),
      db.packagePurchase.updateMany({ where: { seenAt: null }, data: { seenAt: now } }),
    ]);
    refreshAll();
    return { ok: true };
  }
  const ids = Array.isArray(id) ? id.filter((x) => typeof x === "string").slice(0, 1000) : id ? [id] : null;
  const where = { seenAt: null, ...(ids ? { id: { in: ids } } : {}) };
  if (kind === "sessions") await db.booking.updateMany({ where, data: { seenAt: now } });
  else if (kind === "courses") await db.coursePurchase.updateMany({ where, data: { seenAt: now } });
  else await db.packagePurchase.updateMany({ where, data: { seenAt: now } });
  refreshAll();
  return { ok: true };
}
