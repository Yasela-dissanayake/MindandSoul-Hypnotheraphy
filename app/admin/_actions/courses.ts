"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { deleteObject } from "@/lib/storage";
import { blank, fail, refreshAll, type ActionResult } from "./common";

// Courses are shared: content added here is seen by every enrolled student.

const courseSchema = z.object({
  title: z.string().trim().min(1, "Please enter a title.").max(150),
  description: z.string().max(3000).optional().nullable(),
});

export async function createCourse(input: z.input<typeof courseSchema>): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = courseSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the details.");
  const count = await db.course.count();
  const c = await db.course.create({ data: { title: parsed.data.title, description: blank(parsed.data.description), order: count + 1 } });
  refreshAll();
  return { ok: true, data: { id: c.id } };
}

export async function updateCourse(id: string, input: z.input<typeof courseSchema>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = courseSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the details.");
  await db.course.update({ where: { id }, data: { title: parsed.data.title, description: blank(parsed.data.description) } });
  refreshAll();
  return { ok: true };
}

/** Archived courses are hidden from students but nothing is deleted. */
export async function setCourseArchived(id: string, archived: boolean): Promise<ActionResult> {
  await requireAdmin();
  await db.course.update({ where: { id }, data: { archived } });
  refreshAll();
  return { ok: true };
}

// --- Modules -----------------------------------------------------------------

export async function saveCourseModule(courseId: string, input: { id?: string; title: string; description?: string | null }): Promise<ActionResult> {
  await requireAdmin();
  const title = input.title.trim();
  if (!title) return fail("Please enter a module title.");
  if (input.id) {
    await db.courseModule.update({ where: { id: input.id, courseId }, data: { title, description: blank(input.description) } });
  } else {
    const count = await db.courseModule.count({ where: { courseId } });
    await db.courseModule.create({ data: { courseId, title, description: blank(input.description), order: count } });
  }
  refreshAll();
  return { ok: true };
}

export async function deleteCourseModule(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.courseModule.delete({ where: { id } });
  refreshAll();
  return { ok: true };
}

export async function moveCourseModule(id: string, dir: -1 | 1): Promise<ActionResult> {
  await requireAdmin();
  const m = await db.courseModule.findUnique({ where: { id } });
  if (!m) return fail("Not found.");
  const rows = await db.courseModule.findMany({ where: { courseId: m.courseId }, orderBy: [{ order: "asc" }, { title: "asc" }] });
  const idx = rows.findIndex((r) => r.id === id);
  const j = idx + dir;
  if (j < 0 || j >= rows.length) return { ok: true };
  [rows[idx], rows[j]] = [rows[j], rows[idx]];
  await Promise.all(rows.map((r, i) => db.courseModule.update({ where: { id: r.id }, data: { order: i } })));
  refreshAll();
  return { ok: true };
}

// --- Material and extras ---------------------------------------------------------

export async function addCourseItems(courseId: string, resourceIds: string[], moduleId: string | null, extra: boolean): Promise<ActionResult> {
  await requireAdmin();
  if (!resourceIds.length) return fail("Choose at least one item.");
  const count = await db.courseItem.count({ where: { courseId } });
  await db.courseItem.createMany({
    data: resourceIds.map((resourceId, i) => ({ courseId, resourceId, moduleId: extra ? null : moduleId, extra, order: count + i })),
    skipDuplicates: true,
  });
  refreshAll();
  return { ok: true };
}

export async function updateCourseItem(id: string, input: { moduleId: string | null; note: string | null; extra: boolean }): Promise<ActionResult> {
  await requireAdmin();
  await db.courseItem.update({
    where: { id },
    data: { moduleId: input.extra ? null : input.moduleId, note: blank(input.note), extra: input.extra },
  });
  refreshAll();
  return { ok: true };
}

export async function removeCourseItem(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.courseItem.delete({ where: { id } });
  refreshAll();
  return { ok: true };
}

export async function moveCourseItem(id: string, dir: -1 | 1): Promise<ActionResult> {
  await requireAdmin();
  const item = await db.courseItem.findUnique({ where: { id } });
  if (!item) return fail("Not found.");
  const rows = await db.courseItem.findMany({ where: { courseId: item.courseId }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  const idx = rows.findIndex((r) => r.id === id);
  const j = idx + dir;
  if (j < 0 || j >= rows.length) return { ok: true };
  [rows[idx], rows[j]] = [rows[j], rows[idx]];
  await Promise.all(rows.map((r, i) => db.courseItem.update({ where: { id: r.id }, data: { order: i } })));
  refreshAll();
  return { ok: true };
}

// --- Students ------------------------------------------------------------------

export async function enrollStudent(userId: string, courseId: string): Promise<ActionResult> {
  await requireAdmin();
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "CLIENT") return fail("Person not found.");
  if (!(await db.course.findUnique({ where: { id: courseId }, select: { id: true } }))) return fail("Course not found.");
  await db.enrollment.upsert({ where: { userId_courseId: { userId, courseId } }, update: {}, create: { userId, courseId } });
  refreshAll();
  return { ok: true };
}

/** Remove a student from a course (their progress and certificate for it are removed too). */
export async function unenrollStudent(enrollmentId: string): Promise<ActionResult> {
  await requireAdmin();
  const e = await db.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!e) return fail("Not found.");
  await db.enrollment.delete({ where: { id: enrollmentId } });
  await deleteObject(e.certificateKey);
  refreshAll();
  return { ok: true };
}

export async function setEnrollmentCompleted(enrollmentId: string, completed: boolean): Promise<ActionResult> {
  await requireAdmin();
  await db.enrollment.update({ where: { id: enrollmentId }, data: { completedAt: completed ? new Date() : null } });
  refreshAll();
  return { ok: true };
}

/** Attach the scanned, signed certificate (uploaded to storage first). */
export async function setCertificate(enrollmentId: string, input: { key: string; name: string; contentType: string }): Promise<ActionResult> {
  await requireAdmin();
  if (!input.key.startsWith("certificates/")) return fail("Upload is not valid.");
  const e = await db.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!e) return fail("Not found.");
  await db.enrollment.update({
    where: { id: enrollmentId },
    data: {
      certificateKey: input.key,
      certificateName: input.name.slice(0, 200),
      certificateType: input.contentType,
      certificateAt: new Date(),
      completedAt: e.completedAt ?? new Date(),
    },
  });
  if (e.certificateKey && e.certificateKey !== input.key) await deleteObject(e.certificateKey);
  refreshAll();
  return { ok: true };
}

export async function removeCertificate(enrollmentId: string): Promise<ActionResult> {
  await requireAdmin();
  const e = await db.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!e) return fail("Not found.");
  await db.enrollment.update({ where: { id: enrollmentId }, data: { certificateKey: null, certificateName: null, certificateType: null, certificateAt: null } });
  await deleteObject(e.certificateKey);
  refreshAll();
  return { ok: true };
}

// --- Client uploads (submissions) ----------------------------------------------------

export async function markSubmissionsSeen(userId: string): Promise<ActionResult> {
  await requireAdmin();
  await db.submission.updateMany({ where: { userId, seenAt: null }, data: { seenAt: new Date() } });
  return { ok: true };
}

export async function deleteSubmission(id: string): Promise<ActionResult> {
  await requireAdmin();
  const s = await db.submission.findUnique({ where: { id } });
  if (!s) return fail("Not found.");
  await db.submission.delete({ where: { id } });
  await deleteObject(s.storageKey);
  refreshAll();
  return { ok: true };
}
