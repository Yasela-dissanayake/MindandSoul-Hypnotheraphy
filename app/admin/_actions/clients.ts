"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { isValidTimezone, todayIn } from "@/lib/dates";
import { getSettings } from "@/lib/settings";
import { loginDetailsEmail, sendMail } from "@/lib/mail";
import { accessSchema, availableUsername, giveAccess, usernameTaken } from "@/lib/accounts";
import {
  generatePassword,
  hashPassword,
  normaliseUsername,
  openForAdmin,
  passwordProblem,
  sealForAdmin,
  usernameProblem,
} from "@/lib/passwords";
import { deleteObject } from "@/lib/storage";
import { fail, refreshAll, type ActionResult } from "./common";

const createSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email."),
  name: z.string().trim().min(1, "Please enter a name.").max(100),
  username: z.string().trim().max(40).optional(),
  password: z.string().max(200).optional(),
  access: accessSchema,
  timezone: z.string().optional(),
});

export type CreatedAccount = { id: string; username: string; password: string; email: string; name: string };

/** Create a client/student account with a username and password the admin can share. */
export async function createClientAccount(input: z.input<typeof createSchema>): Promise<ActionResult<CreatedAccount>> {
  await requireAdmin();
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the details.");
  const { email, name, access } = parsed.data;

  if (await db.user.findUnique({ where: { email } })) return fail("Someone with this email already exists.");

  let username: string;
  if (parsed.data.username) {
    username = normaliseUsername(parsed.data.username);
    const problem = usernameProblem(username);
    if (problem) return fail(problem);
    if (await usernameTaken(username)) return fail("That username is already taken.");
  } else {
    username = await availableUsername(name);
  }

  const password = parsed.data.password?.trim() || generatePassword();
  const pwProblem = passwordProblem(password);
  if (pwProblem) return fail(pwProblem);

  const settings = await getSettings();
  const timezone = parsed.data.timezone && isValidTimezone(parsed.data.timezone) ? parsed.data.timezone : settings.adminTimezone;

  const user = await db.user.create({
    data: {
      email,
      name,
      username,
      role: "CLIENT",
      status: "INVITED",
      invitedAt: new Date(),
      timezone,
      reminderHour: settings.defaultReminderHour,
      passwordHash: await hashPassword(password),
      passwordView: sealForAdmin(password),
      passwordChangedAt: new Date(),
    },
  });
  await giveAccess(user.id, access, todayIn(timezone));
  refreshAll();
  return { ok: true, data: { id: user.id, username, password, email, name } };
}

export type LoginDetails = {
  username: string | null;
  email: string;
  password: string | null; // null = not viewable
  passwordState: "viewable" | "changed-by-client" | "none" | "unreadable";
  passwordChangedAt: string | null;
  google: boolean;
  lockedUntil: string | null;
};

/** What the admin sees in "Login details". */
export async function getLoginDetails(userId: string): Promise<ActionResult<LoginDetails>> {
  await requireAdmin();
  const u = await db.user.findUnique({ where: { id: userId }, include: { accounts: { select: { provider: true } } } });
  if (!u || u.role !== "CLIENT") return fail("Not found.");
  const viewable = openForAdmin(u.passwordView);
  const passwordState: LoginDetails["passwordState"] = !u.passwordHash
    ? "none"
    : viewable
      ? "viewable"
      : u.passwordView
        ? "unreadable"
        : "changed-by-client";
  return {
    ok: true,
    data: {
      username: u.username,
      email: u.email,
      password: viewable,
      passwordState,
      passwordChangedAt: u.passwordChangedAt?.toISOString() ?? null,
      google: u.accounts.some((a) => a.provider === "google"),
      lockedUntil: u.lockedUntil && u.lockedUntil > new Date() ? u.lockedUntil.toISOString() : null,
    },
  };
}

/** Set a new password (generated, or typed by the admin). Signs the person out of every device. */
export async function resetClientPassword(userId: string, custom?: string): Promise<ActionResult<{ password: string }>> {
  await requireAdmin();
  const u = await db.user.findUnique({ where: { id: userId } });
  if (!u || u.role !== "CLIENT") return fail("Not found.");
  const password = custom?.trim() || generatePassword();
  const problem = passwordProblem(password);
  if (problem) return fail(problem);
  await db.user.update({
    where: { id: userId },
    data: {
      passwordHash: await hashPassword(password),
      passwordView: sealForAdmin(password),
      passwordChangedAt: new Date(),
      sessionVersion: { increment: 1 },
      failedLogins: 0,
      lockedUntil: null,
      username: u.username ?? (await availableUsername(u.name || u.email.split("@")[0], u.id)),
    },
  });
  refreshAll();
  return { ok: true, data: { password } };
}

export async function updateUsername(userId: string, wanted: string): Promise<ActionResult> {
  await requireAdmin();
  const username = normaliseUsername(wanted);
  const problem = usernameProblem(username);
  if (problem) return fail(problem);
  if (await usernameTaken(username, userId)) return fail("That username is already taken.");
  await db.user.update({ where: { id: userId, role: "CLIENT" }, data: { username } });
  refreshAll();
  return { ok: true };
}

export async function unlockAccount(userId: string): Promise<ActionResult> {
  await requireAdmin();
  await db.user.update({ where: { id: userId, role: "CLIENT" }, data: { failedLogins: 0, lockedUntil: null } });
  refreshAll();
  return { ok: true };
}

/** Email the username and (viewable) password to the person. */
export async function emailLoginDetails(userId: string): Promise<ActionResult> {
  await requireAdmin();
  const u = await db.user.findUnique({ where: { id: userId } });
  if (!u || u.role !== "CLIENT") return fail("Not found.");
  const password = openForAdmin(u.passwordView);
  if (!u.username || !password) return fail("Reset the password first, so there are details to send.");
  const settings = await getSettings();
  const res = await sendMail({
    to: u.email,
    ...loginDetailsEmail({ name: u.name, username: u.username, password, customText: settings.inviteEmailText }),
  });
  if (!res.ok) return fail(`The email could not be sent: ${res.error ?? "unknown error"}`);
  return { ok: true };
}

const updateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email(),
  timezone: z.string().refine(isValidTimezone, "Unknown time zone"),
  reminderHour: z.number().int().min(0).max(23),
  remindersOn: z.boolean(),
});

export async function updateClient(userId: string, input: z.input<typeof updateSchema>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the details.");
  const clash = await db.user.findFirst({ where: { email: parsed.data.email, id: { not: userId } } });
  if (clash) return fail("Another person already uses this email.");
  await db.user.update({ where: { id: userId, role: "CLIENT" }, data: parsed.data });
  refreshAll();
  return { ok: true };
}

/** Mark as finished (can't sign in, history kept) or reactivate. */
export async function setClientFinished(userId: string, finished: boolean): Promise<ActionResult> {
  await requireAdmin();
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "CLIENT") return fail("Not found.");
  // A finished account is signed out on its next request (the session check sees FINISHED).
  await db.user.update({
    where: { id: userId },
    data: { status: finished ? "FINISHED" : user.lastActiveAt ? "ACTIVE" : "INVITED" },
  });
  refreshAll();
  return { ok: true };
}

/**
 * Remove completely: the account and everything about this person, so nothing is left in the admin panel.
 * - Linked to the account (deleted with it): plans, progress, journal, notes, uploads, class/course access, Google sign-in link.
 * - Kept under their email (deleted here): session bookings, class and course purchases, enquiries.
 * - Their files in storage: journal voice messages, personal recordings, uploads.
 * Payments stay in Stripe (that's the payment record; refunds are done there).
 */
export async function deleteClient(userId: string, confirmEmail: string): Promise<ActionResult> {
  await requireAdmin();
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      journal: { select: { audioKey: true } },
      personalFiles: { select: { storageKey: true } },
      submissions: { select: { storageKey: true } },
    },
  });
  if (!user || user.role !== "CLIENT") return fail("Not found.");
  if (confirmEmail.trim().toLowerCase() !== user.email) return fail("Type the person's email exactly to confirm.");
  const keys = [
    ...user.journal.map((j) => j.audioKey),
    ...user.personalFiles.map((f) => f.storageKey),
    ...user.submissions.map((s) => s.storageKey),
  ].filter((k): k is string => Boolean(k));

  // Records saved under their email (bookings and purchases can be made before the account exists).
  const email = { equals: user.email, mode: "insensitive" as const };
  await db.$transaction([
    db.booking.deleteMany({ where: { OR: [{ userId }, { clientEmail: email }] } }),
    db.coursePurchase.deleteMany({ where: { OR: [{ userId }, { email }] } }),
    db.packagePurchase.deleteMany({ where: { OR: [{ userId }, { email }] } }),
    db.enquiry.deleteMany({ where: { email } }),
    db.user.delete({ where: { id: userId } }),
  ]);
  await Promise.all(keys.map((k) => deleteObject(k).catch(() => {})));
  refreshAll();
  return { ok: true };
}

export async function addPrivateNote(userId: string, body: string): Promise<ActionResult> {
  await requireAdmin();
  const text = body.trim();
  if (!text) return fail("The note is empty.");
  await db.privateNote.create({ data: { userId, body: text.slice(0, 20000) } });
  refreshAll();
  return { ok: true };
}

export async function deletePrivateNote(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.privateNote.delete({ where: { id } });
  refreshAll();
  return { ok: true };
}

export async function markJournalRead(userId: string): Promise<ActionResult> {
  await requireAdmin();
  await db.journalEntry.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
  // No refresh here on purpose: "New" highlights stay visible until Rangika leaves the page.
  return { ok: true };
}
