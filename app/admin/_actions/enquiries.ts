"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { refreshAll, type ActionResult } from "./common";

/** Marks an enquiry as contacted (done), or back to open. */
export async function setEnquiryHandled(id: string, handled: boolean): Promise<ActionResult> {
  await requireAdmin();
  await db.enquiry.update({ where: { id }, data: { handledAt: handled ? new Date() : null } });
  refreshAll();
  return { ok: true };
}

export async function deleteEnquiry(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.enquiry.delete({ where: { id } });
  refreshAll();
  return { ok: true };
}
