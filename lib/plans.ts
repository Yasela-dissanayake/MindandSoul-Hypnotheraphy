import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { dayNumber, todayIn } from "@/lib/dates";
import { parseTrackerFields } from "@/lib/catalog";

type TaskLike = { recurrence: "ONCE" | "DAILY"; startDay: number; endDay: number | null; paused: boolean };

/**
 * Is a task due on plan day `day`?
 * - DAILY: every day from startDay to endDay (or forever).
 * - ONCE: from startDay until it's done (it stays visible on the day it was done).
 */
export function isDue(task: TaskLike, day: number, opts: { doneToday: boolean; doneEver: boolean }) {
  if (task.paused || day < task.startDay) return false;
  if (task.recurrence === "DAILY") return task.endDay == null || day <= task.endDay;
  return !opts.doneEver || opts.doneToday;
}

/** Week number of a plan day (day 1-7 = week 1). */
export const weekOfDay = (day: number) => Math.floor((day - 1) / 7) + 1;
export const firstDayOfWeek = (week: number) => (week - 1) * 7 + 1;
export const lastDayOfWeek = (week: number) => week * 7;

const resourceSelect = { id: true, title: true, kind: true, url: true } satisfies Prisma.ResourceSelect;
const taskInclude = {
  resource: { select: resourceSelect },
  module: { select: { id: true, title: true } },
} satisfies Prisma.TaskInclude;

export type TodayTask = Prisma.TaskGetPayload<{ include: typeof taskInclude }> & {
  planTitle: string;
  done: boolean;
};

export type TodayTracker = { id: string; title: string; planTitle: string; done: boolean };

/** Everything the Today screen needs for one client (session work only). */
export async function getToday(userId: string, timezone: string) {
  const today = todayIn(timezone);
  const activePlan = { userId, completedAt: null, startDate: { not: null } };
  // Everything in one go (one database trip instead of four in a row).
  const [plans, completions, entriesToday, firstAudio] = await Promise.all([
    db.plan.findMany({
      where: activePlan,
      include: {
        tasks: { include: taskInclude, orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
        prompts: { orderBy: { day: "asc" } },
        trackers: { where: { active: true }, orderBy: { order: "asc" }, select: { id: true, title: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    db.taskCompletion.findMany({ where: { userId, task: { plan: activePlan } }, select: { taskId: true, forDate: true } }),
    db.trackerEntry.findMany({ where: { userId, forDate: today }, select: { trackerId: true } }),
    db.planItem.findFirst({
      where: { plan: activePlan, resource: { kind: "AUDIO" } },
      orderBy: { order: "asc" },
      include: { resource: { select: resourceSelect } },
    }),
  ]);

  const doneToday = new Set(completions.filter((c) => c.forDate === today).map((c) => c.taskId));
  const doneEver = new Set(completions.map((c) => c.taskId));
  const filledToday = new Set(entriesToday.map((e) => e.trackerId));

  const tasks: TodayTask[] = [];
  const trackers: TodayTracker[] = [];
  let prompt: string | null = null;
  const upcoming: { title: string; startDate: string }[] = [];
  for (const plan of plans) {
    const day = dayNumber(plan.startDate!, today);
    if (day < 1) {
      // Plan hasn't started yet: its daily work appears from the start date.
      upcoming.push({ title: plan.title, startDate: plan.startDate! });
      continue;
    }
    for (const t of plan.tasks) {
      if (isDue(t, day, { doneToday: doneToday.has(t.id), doneEver: doneEver.has(t.id) })) {
        tasks.push({ ...t, planTitle: plan.title, done: doneToday.has(t.id) });
      }
    }
    for (const tr of plan.trackers) trackers.push({ ...tr, planTitle: plan.title, done: filledToday.has(tr.id) });
    // The prompt for today is the latest one whose day has arrived.
    const p = [...plan.prompts].reverse().find((x) => x.day <= day);
    if (p && !prompt) prompt = p.text;
  }

  const audioTask = tasks.find((t) => t.resource?.kind === "AUDIO");
  const tonightAudio = audioTask?.resource ?? firstAudio?.resource ?? null;

  return { today, tasks, trackers, prompt, tonightAudio, upcoming, hasPlans: plans.length > 0 };
}

/** What a person has: session plans, course enrolments and/or online courses (for navigation). */
export async function getAreas(userId: string) {
  const [plans, courses, learning] = await Promise.all([
    db.plan.count({ where: { userId } }),
    db.enrollment.count({ where: { userId } }),
    db.packageEnrollment.count({ where: { userId, package: { archived: false } } }),
  ]);
  return { hasSessions: plans > 0, hasCourses: courses > 0, hasLearning: learning > 0 };
}

/** Can this person open this library item? Their personal file, a session plan item/task, or a course they're enrolled in. */
export async function clientCanAccessResource(userId: string, resourceId: string) {
  const resource = await db.resource.findUnique({ where: { id: resourceId }, select: { personalForUserId: true } });
  if (!resource) return false;
  if (resource.personalForUserId === userId) return true;
  const [viaPlan, viaTask, viaCourse, viaLesson] = await Promise.all([
    db.planItem.findFirst({ where: { resourceId, plan: { userId } }, select: { id: true } }),
    db.task.findFirst({ where: { resourceId, plan: { userId } }, select: { id: true } }),
    db.courseItem.findFirst({ where: { resourceId, course: { enrollments: { some: { userId } } } }, select: { id: true } }),
    // A lesson in an online course they bought.
    db.lesson.findFirst({ where: { resourceId, package: { enrollments: { some: { userId } } } }, select: { id: true } }),
  ]);
  return Boolean(viaPlan || viaTask || viaCourse || viaLesson);
}

/** Copy a ready-made session package to a client, including weeks, material, tasks, prompts and trackers. */
export async function copyTemplateToUser(templateId: string, userId: string, startDate: string) {
  const tpl = await db.plan.findUnique({
    where: { id: templateId },
    include: { modules: true, items: true, tasks: true, prompts: true, trackers: true },
  });
  if (!tpl || tpl.userId) throw new Error("Package not found");

  return db.$transaction(async (tx) => {
    const plan = await tx.plan.create({
      data: {
        userId,
        templateId: tpl.id,
        title: tpl.title,
        description: tpl.description,
        service: tpl.service,
        totalSessions: tpl.totalSessions,
        currentSession: tpl.totalSessions ? 1 : null,
        startDate,
      },
    });
    const moduleMap = new Map<string, string>();
    for (const m of tpl.modules) {
      const created = await tx.planModule.create({
        data: { planId: plan.id, title: m.title, description: m.description, order: m.order },
      });
      moduleMap.set(m.id, created.id);
    }
    const mod = (id: string | null) => (id ? (moduleMap.get(id) ?? null) : null);
    if (tpl.items.length) {
      await tx.planItem.createMany({
        data: tpl.items.map((i) => ({ planId: plan.id, moduleId: mod(i.moduleId), resourceId: i.resourceId, note: i.note, order: i.order })),
      });
    }
    if (tpl.tasks.length) {
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
    }
    if (tpl.prompts.length) {
      await tx.prompt.createMany({ data: tpl.prompts.map((p) => ({ planId: plan.id, day: p.day, text: p.text })) });
    }
    for (const t of tpl.trackers) {
      await tx.tracker.create({
        data: { planId: plan.id, title: t.title, description: t.description, fields: parseTrackerFields(t.fields), active: t.active, order: t.order },
      });
    }
    return plan;
  });
}
