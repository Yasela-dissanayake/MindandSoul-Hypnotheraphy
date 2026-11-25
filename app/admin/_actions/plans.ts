"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { daysBetween, todayIn } from "@/lib/dates";
import { getSettings } from "@/lib/settings";
import { copyTemplateToUser } from "@/lib/plans";
import { parseTrackerFields, TRACKER_FIELD_TYPES } from "@/lib/catalog";
import { notify, planOwner } from "@/lib/notifications";
import { blank, fail, refreshAll, type ActionResult } from "./common";

// Session plans are either ready-made packages (userId = null) or one client's copy.
// The same actions edit both.

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a date.");

const SERVICE = z.enum(["REIKI_HEALING", "ANIMAL_REIKI", "HYPNOTHERAPY"]);

const planSchema = z.object({
  title: z.string().trim().min(1, "Please enter a title.").max(150),
  description: z.string().max(5000).optional().nullable(),
  service: SERVICE,
  totalSessions: z.number().int().min(1).max(100).nullable().optional(),
  currentSession: z.number().int().min(0).max(100).nullable().optional(),
  startDate: date.nullable().optional(),
  clientNote: z.string().max(5000).optional().nullable(),
  meetingLink: z.string().trim().url("The Zoom link should start with https://").max(500).optional().nullable().or(z.literal("")),
});

/**
 * A new session plan. With `sessionServiceId` (a session service from Session services & prices) the plan
 * takes that service's kind and, with `bookOnline`, lets the client book its sessions from their portal.
 */
export async function createPlan(
  input: z.input<typeof planSchema> & { userId?: string | null; sessionServiceId?: string | null; bookOnline?: boolean },
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = planSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the details.");
  const d = parsed.data;
  const service = input.sessionServiceId
    ? await db.sessionService.findUnique({ where: { id: input.sessionServiceId }, select: { id: true, planService: true } })
    : null;
  if (input.sessionServiceId && !service) return fail("That session no longer exists. Please refresh the page.");
  let startDate = d.startDate ?? null;
  if (input.userId && !startDate) {
    const user = await db.user.findUnique({ where: { id: input.userId }, select: { timezone: true } });
    startDate = todayIn(user?.timezone ?? (await getSettings()).adminTimezone);
  }
  const plan = await db.plan.create({
    data: {
      userId: input.userId ?? null,
      title: d.title,
      description: blank(d.description),
      service: service?.planService ?? d.service,
      sessionServiceId: service && input.userId && input.bookOnline !== false ? service.id : null,
      totalSessions: d.totalSessions ?? null,
      currentSession: d.totalSessions ? (d.currentSession ?? 1) : null,
      startDate: input.userId ? startDate : null,
      clientNote: blank(d.clientNote),
      meetingLink: blank(d.meetingLink),
    },
  });
  if (plan.userId) {
    await notify(plan.userId, { kind: "PLAN", title: `Your ${plan.title} space is ready`, body: "Rangika will add your material, exercises and check-ins here.", href: "/portal/sessions" });
  }
  refreshAll();
  return { ok: true, data: { id: plan.id } };
}

export async function updatePlan(
  planId: string,
  input: z.input<typeof planSchema> & { sessionServiceId?: string | null; bookOnline?: boolean },
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = planSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the details.");
  const d = parsed.data;
  const plan = await db.plan.findUnique({ where: { id: planId } });
  if (!plan) return fail("Plan not found.");
  // The session it's for (from Session services & prices); its kind decides the plan's service.
  const service =
    input.sessionServiceId === undefined || input.sessionServiceId === null
      ? null
      : await db.sessionService.findUnique({ where: { id: input.sessionServiceId }, select: { id: true, planService: true } });
  if (input.sessionServiceId && !service) return fail("That session no longer exists. Please refresh the page.");
  const link =
    input.sessionServiceId === undefined || !plan.userId
      ? {}
      : { sessionServiceId: service && input.bookOnline !== false ? service.id : null };
  await db.plan.update({
    where: { id: planId },
    data: {
      title: d.title,
      description: blank(d.description),
      service: service?.planService ?? d.service,
      ...link,
      totalSessions: d.totalSessions ?? null,
      currentSession: d.totalSessions ? (d.currentSession ?? null) : null,
      startDate: plan.userId ? (d.startDate ?? plan.startDate) : null,
      clientNote: blank(d.clientNote),
      meetingLink: blank(d.meetingLink),
    },
  });
  const zoom = blank(d.meetingLink);
  if (plan.userId && zoom && zoom !== plan.meetingLink) {
    await notify(plan.userId, {
      kind: "ZOOM_LINK",
      title: plan.meetingLink ? "Your session link has changed" : "Your session link is ready",
      body: `For ${d.title}. Open My sessions to join.`,
      href: "/portal/sessions",
    });
  }
  refreshAll();
  return { ok: true };
}

const zoomSchema = z.string().trim().max(500).refine((v) => v === "" || /^https:\/\/\S+$/i.test(v), "The Zoom link should start with https://");

/** Sets, changes or removes the Zoom link on a client's plan (shown on their My sessions page). */
export async function setMeetingLink(planId: string, link: string): Promise<ActionResult> {
  await requireAdmin();
  const parsed = zoomSchema.safeParse(link);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the link.");
  const plan = await db.plan.findUnique({ where: { id: planId }, select: { userId: true, title: true, meetingLink: true } });
  if (!plan) return fail("Plan not found.");
  const next = parsed.data || null;
  if (next === plan.meetingLink) return { ok: true };
  await db.plan.update({ where: { id: planId }, data: { meetingLink: next } });
  if (plan.userId && next) {
    await notify(plan.userId, {
      kind: "ZOOM_LINK",
      title: plan.meetingLink ? "Your session link has changed" : "Your session link is ready",
      body: `For ${plan.title}. Open My sessions to join.`,
      href: "/portal/sessions",
    });
  }
  refreshAll();
  return { ok: true };
}

export async function setPlanCompleted(planId: string, completed: boolean): Promise<ActionResult> {
  await requireAdmin();
  await db.plan.update({ where: { id: planId }, data: { completedAt: completed ? new Date() : null } });
  refreshAll();
  return { ok: true };
}

export async function deletePlan(planId: string): Promise<ActionResult> {
  await requireAdmin();
  await db.plan.delete({ where: { id: planId } });
  refreshAll();
  return { ok: true };
}

export async function assignTemplate(userId: string, templateId: string, startDate: string): Promise<ActionResult> {
  await requireAdmin();
  if (!date.safeParse(startDate).success) return fail("Please choose a start date.");
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "CLIENT") return fail("Person not found.");
  await copyTemplateToUser(templateId, userId, startDate);
  const t = await db.plan.findUnique({ where: { id: templateId }, select: { title: true } });
  await notify(userId, { kind: "PLAN", title: `Your ${t?.title ?? "new"} plan is ready`, body: "Your material, exercises and check-ins are in My sessions.", href: "/portal/sessions" });
  refreshAll();
  return { ok: true };
}

export async function duplicateTemplate(templateId: string): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const tpl = await db.plan.findUnique({ where: { id: templateId }, include: { modules: true, items: true, tasks: true, prompts: true, trackers: true } });
  if (!tpl || tpl.userId) return fail("Template not found.");
  const copy = await db.$transaction(async (tx) => {
    const plan = await tx.plan.create({
      data: {
        title: `${tpl.title} (copy)`,
        description: tpl.description,
        service: tpl.service,
        totalSessions: tpl.totalSessions,
      },
    });
    const map = new Map<string, string>();
    for (const m of tpl.modules) {
      const c = await tx.planModule.create({ data: { planId: plan.id, title: m.title, description: m.description, order: m.order } });
      map.set(m.id, c.id);
    }
    const mod = (id: string | null) => (id ? (map.get(id) ?? null) : null);
    await tx.planItem.createMany({ data: tpl.items.map((i) => ({ planId: plan.id, moduleId: mod(i.moduleId), resourceId: i.resourceId, note: i.note, order: i.order })) });
    await tx.task.createMany({
      data: tpl.tasks.map((t) => ({
        planId: plan.id,
        moduleId: mod(t.moduleId),
        title: t.title,
        instructions: t.instructions,
        resourceId: t.resourceId,
        recurrence: t.recurrence,
        startDay: t.startDay,
        endDay: t.endDay,
        paused: t.paused,
        order: t.order,
      })),
    });
    await tx.prompt.createMany({ data: tpl.prompts.map((p) => ({ planId: plan.id, day: p.day, text: p.text })) });
    for (const t of tpl.trackers) {
      await tx.tracker.create({
        data: { planId: plan.id, title: t.title, description: t.description, fields: parseTrackerFields(t.fields), active: t.active, order: t.order },
      });
    }
    return plan;
  });
  refreshAll();
  return { ok: true, data: { id: copy.id } };
}

// ---------------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------------

export async function saveModule(planId: string, input: { id?: string; title: string; description?: string | null }): Promise<ActionResult> {
  await requireAdmin();
  const title = input.title.trim();
  if (!title) return fail("Please enter a module title.");
  if (input.id) {
    await db.planModule.update({ where: { id: input.id, planId }, data: { title, description: blank(input.description) } });
  } else {
    const count = await db.planModule.count({ where: { planId } });
    await db.planModule.create({ data: { planId, title, description: blank(input.description), order: count } });
  }
  refreshAll();
  return { ok: true };
}

export async function deleteModule(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.planModule.delete({ where: { id } });
  refreshAll();
  return { ok: true };
}

async function normaliseAndSwap<T extends { id: string }>(
  rows: T[],
  id: string,
  dir: -1 | 1,
  update: (id: string, order: number) => Promise<unknown>,
) {
  const idx = rows.findIndex((r) => r.id === id);
  const j = idx + dir;
  if (idx < 0 || j < 0 || j >= rows.length) return;
  const list = [...rows];
  [list[idx], list[j]] = [list[j], list[idx]];
  await Promise.all(list.map((r, i) => update(r.id, i)));
}

export async function moveModule(id: string, dir: -1 | 1): Promise<ActionResult> {
  await requireAdmin();
  const m = await db.planModule.findUnique({ where: { id } });
  if (!m) return fail("Not found.");
  const rows = await db.planModule.findMany({ where: { planId: m.planId }, orderBy: [{ order: "asc" }, { title: "asc" }] });
  await normaliseAndSwap(rows, id, dir, (rid, order) => db.planModule.update({ where: { id: rid }, data: { order } }));
  refreshAll();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Material (library items in a plan)
// ---------------------------------------------------------------------------

export async function addPlanItems(planId: string, resourceIds: string[], moduleId: string | null): Promise<ActionResult> {
  await requireAdmin();
  if (!resourceIds.length) return fail("Choose at least one item.");
  const count = await db.planItem.count({ where: { planId } });
  await db.planItem.createMany({
    data: resourceIds.map((resourceId, i) => ({ planId, resourceId, moduleId, order: count + i })),
    skipDuplicates: true,
  });
  const owner = await planOwner(planId);
  if (owner) {
    const items = await db.resource.findMany({ where: { id: { in: resourceIds } }, select: { title: true } });
    for (const r of items) {
      await notify(owner.userId, { kind: "MATERIAL", title: "New material from Rangika", body: r.title, href: "/portal/sessions", merge: { many: (n) => `${n} new items from Rangika` } });
    }
  }
  refreshAll();
  return { ok: true };
}

export async function updatePlanItem(id: string, input: { moduleId: string | null; note: string | null }): Promise<ActionResult> {
  await requireAdmin();
  await db.planItem.update({ where: { id }, data: { moduleId: input.moduleId, note: blank(input.note) } });
  refreshAll();
  return { ok: true };
}

export async function removePlanItem(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.planItem.delete({ where: { id } });
  refreshAll();
  return { ok: true };
}

export async function movePlanItem(id: string, dir: -1 | 1): Promise<ActionResult> {
  await requireAdmin();
  const item = await db.planItem.findUnique({ where: { id } });
  if (!item) return fail("Not found.");
  const rows = await db.planItem.findMany({ where: { planId: item.planId }, orderBy: { order: "asc" } });
  await normaliseAndSwap(rows, id, dir, (rid, order) => db.planItem.update({ where: { id: rid }, data: { order } }));
  refreshAll();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

const taskSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().trim().min(1, "Please enter a task.").max(200),
    instructions: z.string().max(5000).optional().nullable(),
    resourceId: z.string().nullable().optional(),
    moduleId: z.string().nullable().optional(),
    recurrence: z.enum(["ONCE", "DAILY"]),
    startDay: z.number().int().min(1).max(3650),
    endDay: z.number().int().min(1).max(3650).nullable().optional(),
    paused: z.boolean().optional(),
    // A client's plan: the real dates (YYYY-MM-DD). They replace startDay / endDay.
    startDate: date.optional(),
    endDate: date.nullable().optional(),
  })
  .refine((t) => t.endDay == null || t.endDay >= t.startDay, { message: "The last day must be on or after the first day." })
  .refine((t) => !t.startDate || !t.endDate || t.endDate >= t.startDate, { message: "The last day must be on or after the first day." });

/**
 * Moves a client's plan to start earlier (e.g. Rangika gives an exercise before the first session).
 * Tasks and journal prompts are counted in days from the start, so they're moved too and keep their dates.
 */
async function startPlanEarlier(planId: string, oldStart: string | null, newStart: string) {
  const shift = oldStart ? daysBetween(newStart, oldStart) : 0;
  await db.$transaction([
    db.plan.update({ where: { id: planId }, data: { startDate: newStart } }),
    ...(shift > 0
      ? [
          db.task.updateMany({ where: { planId }, data: { startDay: { increment: shift } } }),
          db.task.updateMany({ where: { planId, endDay: { not: null } }, data: { endDay: { increment: shift } } }),
          db.prompt.updateMany({ where: { planId }, data: { day: { increment: shift } } }),
        ]
      : []),
  ]);
}

export async function saveTask(planId: string, input: z.input<typeof taskSchema>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the task.");
  const t = parsed.data;
  // A client's plan: turn the chosen dates into plan days (moving the plan's start earlier when needed).
  if (t.startDate) {
    const plan = await db.plan.findUnique({ where: { id: planId }, select: { userId: true, startDate: true } });
    if (!plan?.userId) return fail("Dates are only for a client's plan.");
    let start = plan.startDate;
    if (!start || t.startDate < start) {
      await startPlanEarlier(planId, start, t.startDate);
      start = t.startDate;
    }
    t.startDay = daysBetween(start, t.startDate) + 1;
    t.endDay = t.recurrence === "DAILY" && t.endDate ? daysBetween(start, t.endDate) + 1 : null;
  }
  const data = {
    title: t.title,
    instructions: blank(t.instructions),
    resourceId: t.resourceId || null,
    moduleId: t.moduleId || null,
    recurrence: t.recurrence,
    startDay: t.startDay,
    endDay: t.recurrence === "DAILY" ? (t.endDay ?? null) : null,
    paused: t.paused ?? false,
  };
  if (t.id) await db.task.update({ where: { id: t.id, planId }, data });
  else {
    const count = await db.task.count({ where: { planId } });
    await db.task.create({ data: { ...data, planId, order: count } });
    const owner = await planOwner(planId);
    if (owner && !data.paused) {
      await notify(owner.userId, {
        kind: "TASK",
        title: "New exercise from Rangika",
        body: data.title,
        href: "/portal",
        merge: { many: (n) => `${n} new exercises from Rangika` },
      });
    }
  }
  refreshAll();
  return { ok: true };
}

export async function setTaskPaused(id: string, paused: boolean): Promise<ActionResult> {
  await requireAdmin();
  await db.task.update({ where: { id }, data: { paused } });
  refreshAll();
  return { ok: true };
}

export async function deleteTask(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.task.delete({ where: { id } });
  refreshAll();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Journal prompts
// ---------------------------------------------------------------------------

export async function savePrompt(planId: string, input: { id?: string; day: number; text: string }): Promise<ActionResult> {
  await requireAdmin();
  const text = input.text.trim();
  if (!text) return fail("Please write the prompt.");
  if (!Number.isInteger(input.day) || input.day < 1) return fail("Day must be 1 or more.");
  if (input.id) await db.prompt.update({ where: { id: input.id, planId }, data: { day: input.day, text } });
  else {
    await db.prompt.create({ data: { planId, day: input.day, text } });
    const owner = await planOwner(planId);
    if (owner) {
      await notify(owner.userId, {
        kind: "PROMPT",
        title: "New journal prompt from Rangika",
        body: text.length > 90 ? `${text.slice(0, 87)}…` : text,
        href: "/portal/journal",
        merge: { many: (n) => `${n} new journal prompts from Rangika` },
      });
    }
  }
  refreshAll();
  return { ok: true };
}

export async function deletePrompt(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.prompt.delete({ where: { id } });
  refreshAll();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Progress trackers (daily forms)
// ---------------------------------------------------------------------------

const fieldSchema = z.object({
  id: z.string().min(1).max(40),
  label: z.string().trim().min(1, "Every question needs a label.").max(120),
  type: z.enum(TRACKER_FIELD_TYPES),
  unit: z.string().trim().max(20).optional(),
});

const trackerSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Please name the tracker.").max(100),
  description: z.string().trim().max(500).optional().nullable(),
  fields: z.array(fieldSchema).min(1, "Add at least one question.").max(15),
  active: z.boolean().optional(),
});

export async function saveTracker(planId: string, input: z.input<typeof trackerSchema>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = trackerSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the tracker.");
  const t = parsed.data;
  const fields = t.fields.map((f) => ({ id: f.id, label: f.label, type: f.type, ...(f.unit ? { unit: f.unit } : {}) }));
  if (t.id) {
    await db.tracker.update({ where: { id: t.id, planId }, data: { title: t.title, description: blank(t.description), fields, active: t.active ?? true } });
  } else {
    const count = await db.tracker.count({ where: { planId } });
    const created = await db.tracker.create({ data: { planId, title: t.title, description: blank(t.description), fields, order: count } });
    const owner = await planOwner(planId);
    if (owner) await notify(owner.userId, { kind: "TRACKER", title: "New check-in to fill in", body: t.title, href: `/portal/trackers/${created.id}` });
  }
  refreshAll();
  return { ok: true };
}

export async function setTrackerActive(id: string, active: boolean): Promise<ActionResult> {
  await requireAdmin();
  await db.tracker.update({ where: { id }, data: { active } });
  refreshAll();
  return { ok: true };
}

export async function deleteTracker(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.tracker.delete({ where: { id } });
  refreshAll();
  return { ok: true };
}
