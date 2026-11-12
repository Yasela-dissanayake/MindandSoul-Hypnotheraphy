import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { parseTrackerFields } from "@/lib/catalog";

const include = {
  modules: { orderBy: [{ order: "asc" }, { title: "asc" }] },
  items: { orderBy: { order: "asc" }, include: { resource: { select: { id: true, title: true, kind: true } } } },
  tasks: { orderBy: [{ order: "asc" }, { createdAt: "asc" }], include: { resource: { select: { id: true, title: true, kind: true } } } },
  prompts: { orderBy: { day: "asc" } },
  trackers: { orderBy: [{ order: "asc" }, { createdAt: "asc" }], include: { _count: { select: { entries: true } } } },
} satisfies Prisma.PlanInclude;

/** Session plans (a client's or ready-made packages) with everything the editor needs, as plain objects. */
export async function loadPlansForEditor(where: Prisma.PlanWhereInput) {
  const plans = await db.plan.findMany({ where, include, orderBy: [{ completedAt: "asc" }, { createdAt: "asc" }] });
  return plans.map((p) => ({
    id: p.id,
    userId: p.userId,
    title: p.title,
    description: p.description,
    service: p.service,
    totalSessions: p.totalSessions,
    currentSession: p.currentSession,
    startDate: p.startDate,
    clientNote: p.clientNote,
    meetingLink: p.meetingLink,
    completed: Boolean(p.completedAt),
    modules: p.modules.map((m) => ({ id: m.id, title: m.title, description: m.description })),
    items: p.items.map((i) => ({ id: i.id, moduleId: i.moduleId, note: i.note, resource: i.resource })),
    tasks: p.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      instructions: t.instructions,
      moduleId: t.moduleId,
      resourceId: t.resourceId,
      resource: t.resource,
      recurrence: t.recurrence,
      startDay: t.startDay,
      endDay: t.endDay,
      paused: t.paused,
    })),
    prompts: p.prompts.map((x) => ({ id: x.id, day: x.day, text: x.text })),
    trackers: p.trackers.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      fields: parseTrackerFields(t.fields),
      active: t.active,
      entries: t._count.entries,
    })),
  }));
}

export type EditorPlan = Awaited<ReturnType<typeof loadPlansForEditor>>[number];

/** Library items for pickers. Personal files only for their owner. */
export async function loadLibraryOptions(forUserId?: string) {
  return db.resource.findMany({
    where: forUserId ? { OR: [{ personalForUserId: null }, { personalForUserId: forUserId }] } : { personalForUserId: null },
    select: { id: true, title: true, kind: true, tag: true, personalForUserId: true },
    orderBy: [{ kind: "asc" }, { title: "asc" }],
  });
}

export type LibraryOption = Awaited<ReturnType<typeof loadLibraryOptions>>[number];

/** Courses with modules and items for the course editor. */
export async function loadCourseForEditor(courseId: string) {
  const c = await db.course.findUnique({
    where: { id: courseId },
    include: {
      modules: { orderBy: [{ order: "asc" }, { title: "asc" }] },
      items: { orderBy: [{ order: "asc" }, { createdAt: "asc" }], include: { resource: { select: { id: true, title: true, kind: true } } } },
    },
  });
  if (!c) return null;
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    archived: c.archived,
    modules: c.modules.map((m) => ({ id: m.id, title: m.title, description: m.description })),
    items: c.items.map((i) => ({ id: i.id, moduleId: i.moduleId, note: i.note, extra: i.extra, resource: i.resource, createdAt: i.createdAt.toISOString() })),
  };
}

export type EditorCourse = NonNullable<Awaited<ReturnType<typeof loadCourseForEditor>>>;
