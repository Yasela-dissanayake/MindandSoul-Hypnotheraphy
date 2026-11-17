"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { refreshAll, type ActionResult } from "./common";

export type SaleKind = "sessions" | "courses" | "learning";

/** Clears the "New" marker on one booking/purchase, or on all of one kind when no id is given. */
export async function markSalesSeen(kind: SaleKind, id?: string): Promise<ActionResult> {
  await requireAdmin();
  const now = new Date();
  const where = { seenAt: null, ...(id ? { id } : {}) };
  if (kind === "sessions") await db.booking.updateMany({ where, data: { seenAt: now } });
  else if (kind === "courses") await db.coursePurchase.updateMany({ where, data: { seenAt: now } });
  else await db.packagePurchase.updateMany({ where, data: { seenAt: now } });
  refreshAll();
  return { ok: true };
}
