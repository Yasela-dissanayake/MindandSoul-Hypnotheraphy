import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const resourceSelect = { id: true, title: true, description: true, kind: true, url: true } satisfies Prisma.ResourceSelect;

/** A session client's plans with weeks, material, tasks and trackers, plus personal files not in any plan. */
export async function getSessionMaterial(userId: string) {
  const plans = await db.plan.findMany({
    where: { userId },
    orderBy: [{ completedAt: "asc" }, { createdAt: "asc" }],
    include: {
      modules: { orderBy: [{ order: "asc" }, { title: "asc" }] },
      items: { orderBy: { order: "asc" }, include: { resource: { select: resourceSelect } } },
      tasks: { where: { paused: false }, select: { id: true, moduleId: true, title: true, instructions: true, recurrence: true, startDay: true, endDay: true } },
      trackers: { where: { active: true }, orderBy: { order: "asc" }, select: { id: true, title: true, description: true } },
    },
  });
  const inPlans = new Set(plans.flatMap((p) => p.items.map((i) => i.resourceId)));
  const personal = await db.resource.findMany({
    where: { personalForUserId: userId, id: { notIn: [...inPlans] } },
    select: resourceSelect,
    orderBy: { createdAt: "desc" },
  });
  return { plans, personal };
}

/** A student's courses with modules, material, their progress and certificate. */
export async function getStudentCourses(userId: string) {
  const enrollments = await db.enrollment.findMany({
    where: { userId, course: { archived: false } },
    orderBy: { startedAt: "asc" },
    include: {
      progress: { select: { moduleId: true } },
      course: {
        include: {
          modules: { orderBy: [{ order: "asc" }, { title: "asc" }] },
          items: { orderBy: [{ order: "asc" }, { createdAt: "asc" }], include: { resource: { select: resourceSelect } } },
        },
      },
    },
  });
  return enrollments.map((e) => {
    const done = new Set(e.progress.map((p) => p.moduleId));
    return {
      enrollmentId: e.id,
      course: e.course,
      completedAt: e.completedAt,
      certificate: e.certificateKey ? { name: e.certificateName ?? "Certificate", at: e.certificateAt } : null,
      doneModules: done,
      modulesDone: e.course.modules.filter((m) => done.has(m.id)).length,
    };
  });
}
