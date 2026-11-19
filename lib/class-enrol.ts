import { db } from "@/lib/db";

// Enrolling someone in a class. A bundle (e.g. "Reiki Level 1 & 2") has no content of its own:
// it enrols them in each class it includes instead, so they see each level's material.
// Used by website payments, the admin "Enrol" buttons and approved access requests.

/** The classes a person actually gets when given this class (the bundle's classes, or the class itself). */
export async function classesFor(courseId: string): Promise<string[]> {
  const c = await db.course.findUnique({ where: { id: courseId }, select: { includes: { select: { id: true } } } });
  return c?.includes.length ? c.includes.map((x) => x.id) : [courseId];
}

/**
 * Enrols them. `reopen` (a new payment) also re-opens a class they had finished before.
 * Returns the ids of the classes they're now enrolled in.
 */
export async function enrolInClass(userId: string, courseId: string, { reopen = false } = {}) {
  const ids = await classesFor(courseId);
  for (const id of ids) {
    await db.enrollment.upsert({
      where: { userId_courseId: { userId, courseId: id } },
      update: reopen ? { completedAt: null } : {},
      create: { userId, courseId: id },
    });
  }
  return ids;
}
