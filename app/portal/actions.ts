"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireClient } from "@/lib/authz";
import { isValidTimezone, todayIn, dayNumber } from "@/lib/dates";
import { getSettings } from "@/lib/settings";
import { activityEmail, PRACTITIONER_EMAIL, questionEmail, sendMail, taskDoneEmail } from "@/lib/mail";
import { formatTimeOfDay, parseTrackerFields } from "@/lib/catalog";
import { deleteObject } from "@/lib/storage";

export type ActionResult = { ok: true } | { ok: false; error: string };
const fail = (error: string): ActionResult => ({ ok: false, error });

async function currentUser() {
  const s = await requireClient();
  const user = await db.user.findUnique({ where: { id: s.id } });
  if (!user) throw new Error("User not found");
  return user;
}

function refresh() {
  revalidatePath("/portal", "layout");
  revalidatePath("/admin", "layout");
}

/** Tell Rangika a client sent something, if she has these emails turned on. Never blocks the client. */
async function notifyActivity(user: { id: string; name: string | null; email: string }, what: string, tab: string, preview?: string | null) {
  try {
    const settings = await getSettings();
    if (!settings.activityEmails) return;
    const short = preview && preview.length > 400 ? `${preview.slice(0, 400)}…` : preview;
    await sendMail({ to: PRACTITIONER_EMAIL, ...activityEmail({ clientName: user.name || user.email, what, preview: short, clientId: user.id, tab }) });
  } catch (e) {
    console.error("Activity email failed", e);
  }
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export async function completeTask(taskId: string): Promise<ActionResult> {
  const user = await currentUser();
  const task = await db.task.findFirst({
    where: { id: taskId, plan: { userId: user.id } },
    include: { plan: { select: { startDate: true } } },
  });
  if (!task || !task.plan.startDate) return fail("Task not found.");
  const today = todayIn(user.timezone);
  if (dayNumber(task.plan.startDate, today) < task.startDay) return fail("This task hasn't started yet.");

  const existing = await db.taskCompletion.findUnique({ where: { taskId_forDate: { taskId, forDate: today } } });
  if (existing) return { ok: true };

  const settings = await getSettings();
  const completion = await db.taskCompletion.create({ data: { taskId, userId: user.id, forDate: today } });
  await db.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } });

  if (settings.notifyMode === "IMMEDIATE") {
    const when = new Date().toLocaleString("en-AU", {
      timeZone: settings.adminTimezone,
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });
    const res = await sendMail({
      to: PRACTITIONER_EMAIL,
      ...taskDoneEmail({ clientName: user.name || user.email, taskTitle: task.title, when, clientId: user.id }),
    });
    if (res.ok) await db.taskCompletion.update({ where: { id: completion.id }, data: { notifiedAt: new Date() } });
  }
  refresh();
  return { ok: true };
}

export async function undoTask(taskId: string): Promise<ActionResult> {
  const user = await currentUser();
  const today = todayIn(user.timezone);
  await db.taskCompletion.deleteMany({ where: { taskId, userId: user.id, forDate: today } });
  refresh();
  return { ok: true };
}

/** A student marks a course module as done (or not done). */
export async function setModuleComplete(moduleId: string, done: boolean): Promise<ActionResult> {
  const user = await currentUser();
  const mod = await db.courseModule.findUnique({ where: { id: moduleId } });
  if (!mod) return fail("Module not found.");
  const enrollment = await db.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: mod.courseId } } });
  if (!enrollment) return fail("You're not enrolled in this course.");
  if (done) {
    await db.moduleProgress.upsert({
      where: { enrollmentId_moduleId: { enrollmentId: enrollment.id, moduleId } },
      update: {},
      create: { enrollmentId: enrollment.id, moduleId },
    });
  } else {
    await db.moduleProgress.deleteMany({ where: { enrollmentId: enrollment.id, moduleId } });
  }
  await db.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } });
  refresh();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Progress trackers (daily forms)
// ---------------------------------------------------------------------------

export async function saveTrackerEntry(trackerId: string, values: Record<string, string | number | boolean | null>, forDate?: string): Promise<ActionResult> {
  const user = await currentUser();
  const tracker = await db.tracker.findFirst({ where: { id: trackerId, plan: { userId: user.id } } });
  if (!tracker) return fail("Tracker not found.");
  const today = todayIn(user.timezone);
  const date = forDate && /^\d{4}-\d{2}-\d{2}$/.test(forDate) && forDate <= today ? forDate : today;

  const fields = parseTrackerFields(tracker.fields);
  const clean: Record<string, string | number | boolean | null> = {};
  for (const f of fields) {
    const v = values[f.id];
    if (v === undefined || v === null || v === "") {
      clean[f.id] = null;
    } else if (f.type === "number") {
      const n = Number(v);
      if (!Number.isFinite(n)) return fail(`"${f.label}" needs a number.`);
      clean[f.id] = n;
    } else if (f.type === "scale") {
      const n = Number(v);
      if (!Number.isInteger(n) || n < 0 || n > 10) return fail(`"${f.label}" needs a number from 0 to 10.`);
      clean[f.id] = n;
    } else if (f.type === "yesno") {
      clean[f.id] = v === true || v === "yes";
    } else if (f.type === "time") {
      const t = String(v);
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(t)) return fail(`"${f.label}" needs a time, e.g. 8:30 pm.`);
      clean[f.id] = t;
    } else {
      clean[f.id] = String(v).slice(0, 2000);
    }
  }
  if (Object.values(clean).every((v) => v === null)) return fail("Fill in at least one answer.");

  const existing = await db.trackerEntry.findUnique({ where: { trackerId_forDate: { trackerId, forDate: date } }, select: { id: true } });
  await db.trackerEntry.upsert({
    where: { trackerId_forDate: { trackerId, forDate: date } },
    update: { values: clean },
    create: { trackerId, userId: user.id, forDate: date, values: clean },
  });
  await db.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } });
  // Only the first save of the day sends an email (not every small correction).
  if (!existing) {
    const preview = fields
      .filter((f) => clean[f.id] !== null)
      .map((f) => {
        const v = clean[f.id];
        const shown =
          f.type === "yesno" ? (v ? "Yes" : "No") : f.type === "time" ? formatTimeOfDay(String(v)) : f.type === "number" && f.unit ? `${v} ${f.unit}` : String(v);
        return `${f.label}: ${shown}`;
      })
      .join("\n");
    await notifyActivity(user, `filled in "${tracker.title}"`, "trackers", preview);
  }
  refresh();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Work the client sends to Rangika (completed worksheets, recordings, photos)
// ---------------------------------------------------------------------------

const submissionSchema = z.object({
  key: z.string().min(1).max(300),
  title: z.string().trim().min(1, "Give it a short title.").max(150),
  note: z.string().trim().max(2000).optional(),
  planId: z.string().optional().nullable(),
  contentType: z.string().max(150),
  size: z.number().int().positive(),
  originalName: z.string().max(200),
});

export async function createSubmission(input: z.input<typeof submissionSchema>): Promise<ActionResult> {
  const user = await currentUser();
  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the upload.");
  const d = parsed.data;
  if (!d.key.startsWith(`submissions/${user.id}/`)) return fail("Upload is not valid.");
  if (d.planId && !(await db.plan.findFirst({ where: { id: d.planId, userId: user.id }, select: { id: true } }))) return fail("Plan not found.");
  await db.submission.create({
    data: {
      userId: user.id,
      planId: d.planId || null,
      title: d.title,
      note: d.note || null,
      storageKey: d.key,
      contentType: d.contentType,
      sizeBytes: d.size,
      originalName: d.originalName,
    },
  });
  await db.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } });
  await notifyActivity(user, `uploaded "${d.title}"`, "uploads", d.note);
  refresh();
  return { ok: true };
}

/** A client can remove an upload Rangika hasn't opened yet (e.g. sent the wrong file). */
export async function deleteMySubmission(id: string): Promise<ActionResult> {
  const user = await currentUser();
  const sub = await db.submission.findFirst({ where: { id, userId: user.id } });
  if (!sub) return fail("Not found.");
  if (sub.seenAt) return fail("Rangika has already opened this, so it can't be removed.");
  await db.submission.delete({ where: { id } });
  await deleteObject(sub.storageKey);
  refresh();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Journal (type, or record a voice message)
// ---------------------------------------------------------------------------

const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

const journalSchema = z.object({
  body: z.string().trim().max(20000).optional(),
  prompt: z.string().trim().max(1000).optional(),
  audio: z
    .object({
      key: z.string().min(1).max(300),
      type: z.string().max(100),
      seconds: z.number().int().min(0).max(60 * 30),
      bytes: z.number().int().min(0),
    })
    .optional(),
});

export async function saveJournalEntry(input: z.infer<typeof journalSchema>): Promise<ActionResult> {
  const user = await currentUser();
  const parsed = journalSchema.safeParse(input);
  if (!parsed.success) return fail("Please check your entry.");
  const { body, prompt, audio } = parsed.data;
  if (!body && !audio) return fail("Write something or record a voice message first.");
  if (audio && !audio.key.startsWith(`journal/${user.id}/`)) return fail("Voice message upload is not valid.");

  await db.journalEntry.create({
    data: {
      userId: user.id,
      prompt: prompt || null,
      body: body || null,
      audioKey: audio?.key,
      audioType: audio?.type,
      audioSeconds: audio?.seconds,
      audioBytes: audio?.bytes,
    },
  });
  await db.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } });
  await notifyActivity(user, audio && !body ? "sent a voice journal entry" : "wrote in their journal", "journal", [prompt, body].filter(Boolean).join("\n\n"));
  refresh();
  return { ok: true };
}

export async function updateJournalEntry(id: string, body: string): Promise<ActionResult> {
  const user = await currentUser();
  const entry = await db.journalEntry.findFirst({ where: { id, userId: user.id } });
  if (!entry) return fail("Entry not found.");
  if (Date.now() - entry.createdAt.getTime() > EDIT_WINDOW_MS) return fail("Entries can only be edited for 24 hours.");
  const text = body.trim().slice(0, 20000);
  if (!text && !entry.audioKey) return fail("The entry can't be empty.");
  await db.journalEntry.update({ where: { id }, data: { body: text || null, readAt: null } });
  refresh();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Questions to Rangika (typed only)
// ---------------------------------------------------------------------------

const questionSchema = z.object({
  body: z.string().trim().min(1, "Type your question first.").max(3000, "Please keep it shorter."),
  topic: z.string().trim().max(200).optional().nullable(),
  topicHref: z
    .string()
    .max(300)
    .regex(/^\/portal(\/[\w\-/]*)?(#[\w-]+)?$/)
    .optional()
    .nullable(),
  planId: z.string().max(50).optional().nullable(),
});

export async function askQuestion(input: z.input<typeof questionSchema>): Promise<ActionResult> {
  const user = await currentUser();
  const parsed = questionSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check your question.");
  const d = parsed.data;
  let planId: string | null = null;
  if (d.planId) {
    const plan = await db.plan.findFirst({ where: { id: d.planId, userId: user.id }, select: { id: true } });
    if (!plan) return fail("Plan not found.");
    planId = plan.id;
  } else {
    // Link it to their current plan when there's only one.
    const plans = await db.plan.findMany({ where: { userId: user.id, completedAt: null }, select: { id: true }, take: 2 });
    if (plans.length === 1) planId = plans[0].id;
  }
  // A small guard against double-clicks and floods.
  const recent = await db.question.count({ where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } } });
  if (recent >= 20) return fail("You've sent a lot of questions in the last hour. Please wait a little.");

  await db.question.create({ data: { userId: user.id, planId, topic: d.topic || null, topicHref: d.topicHref || null, body: d.body } });
  await db.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } });
  // Questions always email Rangika (they need an answer), whatever the activity setting.
  await sendMail({ to: PRACTITIONER_EMAIL, ...questionEmail({ clientName: user.name || user.email, topic: d.topic, body: d.body }) }).catch(() => undefined);
  refresh();
  return { ok: true };
}

/** A client can take back a question Rangika hasn't answered yet. */
export async function deleteMyQuestion(id: string): Promise<ActionResult> {
  const user = await currentUser();
  const q = await db.question.findFirst({ where: { id, userId: user.id } });
  if (!q) return fail("Not found.");
  if (q.answeredAt) return fail("Rangika has already answered this.");
  await db.question.delete({ where: { id } });
  refresh();
  return { ok: true };
}

/** The client has seen their new answers (clears the dot on the menu). */
export async function markAnswersSeen(): Promise<ActionResult> {
  const user = await currentUser();
  const res = await db.question.updateMany({ where: { userId: user.id, answeredAt: { not: null }, answerSeenAt: null }, data: { answerSeenAt: new Date() } });
  if (res.count) revalidatePath("/portal", "layout");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Welcome / consent and profile
// ---------------------------------------------------------------------------

export async function giveConsent(input: { timezone: string; agreed: boolean }): Promise<ActionResult> {
  const user = await currentUser();
  if (!input.agreed) return fail("Please tick the box to continue.");
  const timezone = isValidTimezone(input.timezone) ? input.timezone : user.timezone;
  await db.user.update({ where: { id: user.id }, data: { consentAt: new Date(), timezone } });
  refresh();
  return { ok: true };
}

const profileSchema = z.object({
  name: z.string().trim().min(1).max(100),
  timezone: z.string().refine(isValidTimezone, "Unknown time zone"),
  reminderHour: z.number().int().min(0).max(23),
  remindersOn: z.boolean(),
  voiceOn: z.boolean(),
});

export async function updateProfile(input: z.infer<typeof profileSchema>): Promise<ActionResult> {
  const user = await currentUser();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check your details.");
  await db.user.update({ where: { id: user.id }, data: parsed.data });
  refresh();
  return { ok: true };
}
