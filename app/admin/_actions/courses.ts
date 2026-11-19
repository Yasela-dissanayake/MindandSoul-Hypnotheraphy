"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { deleteObject } from "@/lib/storage";
import { isSiteImage } from "@/lib/covers";
import { uniqueCourseSlug } from "@/lib/course-sales";
import { enrolInClass } from "@/lib/class-enrol";
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

// --- On the website ----------------------------------------------------------

const websiteSchema = z.object({
  summary: z.string().max(200).optional().nullable(),
  details: z.string().max(10000).optional().nullable(),
  format: z.string().max(120).optional().nullable(),
  schedule: z.string().max(200).optional().nullable(),
  price: z.number().min(0, "The price can't be negative.").max(100000),
  // Shown (and paid) in the UAE; empty = they see the AUD price.
  priceAed: z.number().min(0, "The price can't be negative.").max(500000).nullable().optional(),
  prerequisite: z.string().max(120).optional().nullable(),
  highlights: z.string().max(5000).optional().nullable(),
  // For a bundle: the classes it includes (empty = an ordinary class).
  includeIds: z.array(z.string().min(1).max(50)).max(20).optional(),
  seats: z.number().int().min(0).max(10000).nullable(),
  published: z.boolean(),
});

/** Price, dates and text for the public /classes page, and whether it is on the website. */
export async function updateCourseWebsite(id: string, input: z.input<typeof websiteSchema>): Promise<ActionResult<{ slug: string }>> {
  await requireAdmin();
  const parsed = websiteSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the details.");
  const d = parsed.data;
  const course = await db.course.findUnique({
    where: { id },
    select: { title: true, slug: true, archived: true, _count: { select: { enrollments: true, includedIn: true } } },
  });
  if (!course) return fail("Class not found.");
  const price = Math.round(d.price * 100);
  const priceAed = d.priceAed ? Math.round(d.priceAed * 100) : null;
  if (priceAed !== null && priceAed < 200) return fail("The AED price is too low. Leave it empty to show the AUD price instead.");

  // Bundle checks: only ordinary classes can go in a bundle, and a bundle has no students of its own.
  const includeIds = [...new Set((d.includeIds ?? []).filter((x) => x !== id))];
  if (includeIds.length) {
    if (includeIds.length < 2) return fail("A bundle needs at least two classes.");
    if (course._count.includedIn) return fail("This class is part of a bundle, so it can't be a bundle itself.");
    if (course._count.enrollments) return fail("Students are enrolled in this class directly, so it can't become a bundle. Create a new class for the bundle.");
    const parts = await db.course.findMany({ where: { id: { in: includeIds } }, select: { id: true, _count: { select: { includes: true } } } });
    if (parts.length !== includeIds.length) return fail("One of the chosen classes no longer exists.");
    if (parts.some((p) => p._count.includes)) return fail("A bundle can't include another bundle.");
  }
  if (d.published && price < 50) return fail("Add a price before putting the class on the website.");
  if (d.published && course.archived) return fail("This class is hidden. Show it to students again first.");
  const slug = course.slug ?? (await uniqueCourseSlug(course.title, id));
  await db.course.update({
    where: { id },
    data: {
      slug,
      summary: blank(d.summary),
      details: blank(d.details),
      format: blank(d.format),
      schedule: blank(d.schedule),
      price,
      priceAed,
      prerequisite: blank(d.prerequisite),
      highlights: blank(d.highlights),
      seats: d.seats,
      published: d.published,
      ...(d.includeIds ? { includes: { set: includeIds.map((x) => ({ id: x })) } } : {}),
    },
  });
  refreshAll();
  revalidatePath("/classes", "layout");
  return { ok: true, data: { slug } };
}

/** Only courses with no students and no payments can be deleted; others are hidden instead. */
export async function deleteCourse(id: string): Promise<ActionResult> {
  await requireAdmin();
  const c = await db.course.findUnique({ where: { id }, select: { imageKey: true, _count: { select: { enrollments: true, purchases: true } } } });
  if (!c) return fail("Class not found.");
  if (c._count.enrollments || c._count.purchases) return fail("This class has students or payments, so it can't be deleted. Hide it instead.");
  await db.course.delete({ where: { id } });
  if (c.imageKey && !isSiteImage(c.imageKey)) await deleteObject(c.imageKey);
  refreshAll();
  revalidatePath("/classes", "layout");
  return { ok: true };
}

/** Sets (or removes, with null) the cover photo shown on the website. */
export async function setCourseCover(id: string, key: string | null): Promise<ActionResult> {
  await requireAdmin();
  if (key !== null && !/^covers\/[\w.\-\/]+$/.test(key)) return fail("Upload failed. Please try again.");
  const c = await db.course.findUnique({ where: { id }, select: { imageKey: true } });
  if (!c) return fail("Class not found.");
  await db.course.update({ where: { id }, data: { imageKey: key } });
  if (c.imageKey && c.imageKey !== key && !isSiteImage(c.imageKey)) await deleteObject(c.imageKey);
  refreshAll();
  revalidatePath("/classes", "layout");
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
  if (!(await db.course.findUnique({ where: { id: courseId }, select: { id: true } }))) return fail("Class not found.");
  await enrolInClass(userId, courseId); // a bundle enrols them in each of its classes
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
