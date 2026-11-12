"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { todayIn } from "@/lib/dates";
import { getSettings } from "@/lib/settings";
import { accessSchema, availableUsername, giveAccess } from "@/lib/accounts";
import { accessApprovedEmail, sendMail } from "@/lib/mail";
import { fail, refreshAll, type ActionResult } from "./common";

// Someone signed in with Google but has no account: approve (creates their account with
// sessions and/or courses) or decline (they keep seeing "not approved").

const approveSchema = z.object({
  name: z.string().trim().min(1, "Please enter a name.").max(100),
  access: accessSchema,
});

export async function approveAccessRequest(requestId: string, input: z.input<typeof approveSchema>): Promise<ActionResult<{ userId: string }>> {
  await requireAdmin();
  const parsed = approveSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the details.");
  const request = await db.accessRequest.findUnique({ where: { id: requestId } });
  if (!request) return fail("Request not found.");
  if (await db.user.findUnique({ where: { email: request.email } })) {
    await db.accessRequest.update({ where: { id: requestId }, data: { status: "APPROVED", decidedAt: new Date() } });
    refreshAll();
    return fail("This person already has an account. The request is marked as approved.");
  }

  const settings = await getSettings();
  const { name, access } = parsed.data;
  const user = await db.user.create({
    data: {
      email: request.email,
      name,
      image: request.image,
      username: await availableUsername(name),
      role: "CLIENT",
      status: "INVITED",
      invitedAt: new Date(),
      timezone: settings.adminTimezone,
      reminderHour: settings.defaultReminderHour,
    },
  });
  await giveAccess(user.id, access, todayIn(settings.adminTimezone));
  await db.accessRequest.update({ where: { id: requestId }, data: { status: "APPROVED", decidedAt: new Date() } });
  await sendMail({ to: request.email, ...accessApprovedEmail({ name }) });
  refreshAll();
  return { ok: true, data: { userId: user.id } };
}

export async function declineAccessRequest(requestId: string): Promise<ActionResult> {
  await requireAdmin();
  await db.accessRequest.update({ where: { id: requestId }, data: { status: "DECLINED", decidedAt: new Date() } });
  refreshAll();
  return { ok: true };
}

/** Forget a request completely (they can ask again by signing in with Google). */
export async function deleteAccessRequest(requestId: string): Promise<ActionResult> {
  await requireAdmin();
  await db.accessRequest.delete({ where: { id: requestId } });
  refreshAll();
  return { ok: true };
}
