"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { deleteObject } from "@/lib/storage";
import { isSiteImage } from "@/lib/covers";
import { uniqueSlug } from "@/lib/learning";
import { packageCertificateEmail, sendMail } from "@/lib/mail";
import { blank, fail, type ActionResult } from "./common";

const refresh = () => {
  revalidatePath("/admin/courses", "layout");
  revalidatePath("/courses", "layout");
  revalidatePath("/portal", "layout");
};

// ---------- Packages ----------

const packageSchema = z.object({
  title: z.string().trim().min(1, "Please give the course a name.").max(150),
  summary: z.string().max(200).nullable().optional(),
  description: z.string().max(10000).nullable().optional(),
  price: z.number().min(0.5, "The price must be at least AUD 0.50.").max(10000),
  published: z.boolean().default(false),
});

export async function createLearningPackage(input: { title: string; price: number }): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = packageSchema.pick({ title: true, price: true }).safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the details.");
  const count = await db.learningPackage.count();
  const pkg = await db.learningPackage.create({
    data: { title: parsed.data.title, slug: await uniqueSlug(parsed.data.title), price: Math.round(parsed.data.price * 100), order: count },
  });
  refresh();
  return { ok: true, data: { id: pkg.id } };
}

export async function updateLearningPackage(id: string, input: z.input<typeof packageSchema>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = packageSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the details.");
  const d = parsed.data;
  const current = await db.learningPackage.findUnique({ where: { id }, select: { title: true, slug: true, _count: { select: { lessons: true } } } });
  if (!current) return fail("Not found.");
  if (d.published && current._count.lessons === 0) return fail("Add at least one lesson before putting it on the website.");
  await db.learningPackage.update({
    where: { id },
    data: {
      title: d.title,
      summary: blank(d.summary),
      description: blank(d.description),
      price: Math.round(d.price * 100),
      published: d.published,
      // Keep the web address stable once set, unless the name changes.
      ...(d.title !== current.title ? { slug: await uniqueSlug(d.title, id) } : {}),
    },
  });
  refresh();
  return { ok: true };
}

/** Packages people bought are archived (hidden), never deleted, so learners keep their history. */
export async function setLearningPackageArchived(id: string, archived: boolean): Promise<ActionResult> {
  await requireAdmin();
  await db.learningPackage.update({ where: { id }, data: { archived, ...(archived ? { published: false } : {}) } });
  refresh();
  return { ok: true };
}

export async function deleteLearningPackage(id: string): Promise<ActionResult> {
  await requireAdmin();
  const p = await db.learningPackage.findUnique({ where: { id }, select: { imageKey: true, _count: { select: { enrollments: true, purchases: true } } } });
  if (!p) return fail("Not found.");
  if (p._count.enrollments || p._count.purchases) return fail("People have bought this course, so it can't be deleted. Archive it instead.");
  await db.learningPackage.delete({ where: { id } });
  if (p.imageKey && !isSiteImage(p.imageKey)) await deleteObject(p.imageKey);
  refresh();
  return { ok: true };
}

/** Sets (or removes, with null) the cover photo shown on the website. */
export async function setLearningPackageCover(id: string, key: string | null): Promise<ActionResult> {
  await requireAdmin();
  if (key !== null && !/^covers\/[\w.\-\/]+$/.test(key)) return fail("Upload failed. Please try again.");
  const p = await db.learningPackage.findUnique({ where: { id }, select: { imageKey: true } });
  if (!p) return fail("Not found.");
  await db.learningPackage.update({ where: { id }, data: { imageKey: key } });
  if (p.imageKey && p.imageKey !== key && !isSiteImage(p.imageKey)) await deleteObject(p.imageKey);
  refresh();
  return { ok: true };
}

// ---------- Sections ----------

export async function saveLessonSection(packageId: string, input: { id?: string; title: string }): Promise<ActionResult> {
  await requireAdmin();
  const title = input.title.trim().slice(0, 150);
  if (!title) return fail("Please give the section a name.");
  if (input.id) {
    await db.lessonSection.updateMany({ where: { id: input.id, packageId }, data: { title } });
  } else {
    const count = await db.lessonSection.count({ where: { packageId } });
    await db.lessonSection.create({ data: { packageId, title, order: count } });
  }
  refresh();
  return { ok: true };
}

export async function deleteLessonSection(id: string): Promise<ActionResult> {
  await requireAdmin();
  // Its lessons stay, without a section.
  await db.lessonSection.delete({ where: { id } }).catch(() => null);
  refresh();
  return { ok: true };
}

export async function moveLessonSection(id: string, dir: -1 | 1): Promise<ActionResult> {
  await requireAdmin();
  const s = await db.lessonSection.findUnique({ where: { id } });
  if (!s) return fail("Not found.");
  const all = await db.lessonSection.findMany({ where: { packageId: s.packageId }, orderBy: { order: "asc" } });
  const i = all.findIndex((x) => x.id === id);
  const j = i + dir;
  if (j < 0 || j >= all.length) return { ok: true };
  [all[i], all[j]] = [all[j], all[i]];
  await db.$transaction(all.map((x, order) => db.lessonSection.update({ where: { id: x.id }, data: { order } })));
  refresh();
  return { ok: true };
}

// ---------- Lessons ----------

const lessonSchema = z.object({
  title: z.string().trim().min(1, "Please give the lesson a name.").max(150),
  body: z.string().max(20000).nullable().optional(),
  resourceId: z.string().nullable().optional(),
  sectionId: z.string().nullable().optional(),
});

export async function saveLesson(packageId: string, id: string | null, input: z.input<typeof lessonSchema>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = lessonSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the lesson.");
  const d = parsed.data;
  if (d.sectionId && !(await db.lessonSection.findFirst({ where: { id: d.sectionId, packageId } }))) return fail("Unknown section.");
  if (d.resourceId && !(await db.resource.findFirst({ where: { id: d.resourceId, personalForUserId: null } }))) return fail("Unknown library item.");
  const data = { title: d.title, body: blank(d.body), resourceId: d.resourceId || null, sectionId: d.sectionId || null };
  if (id) {
    await db.lesson.updateMany({ where: { id, packageId }, data });
  } else {
    const count = await db.lesson.count({ where: { packageId, sectionId: data.sectionId } });
    await db.lesson.create({ data: { packageId, ...data, order: count } });
  }
  refresh();
  return { ok: true };
}

export async function deleteLesson(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.lesson.delete({ where: { id } }).catch(() => null);
  refresh();
  return { ok: true };
}

/** Move a lesson up or down within its section. */
export async function moveLesson(id: string, dir: -1 | 1): Promise<ActionResult> {
  await requireAdmin();
  const l = await db.lesson.findUnique({ where: { id } });
  if (!l) return fail("Not found.");
  const all = await db.lesson.findMany({ where: { packageId: l.packageId, sectionId: l.sectionId }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  const i = all.findIndex((x) => x.id === id);
  const j = i + dir;
  if (j < 0 || j >= all.length) return { ok: true };
  [all[i], all[j]] = [all[j], all[i]];
  await db.$transaction(all.map((x, order) => db.lesson.update({ where: { id: x.id }, data: { order } })));
  refresh();
  return { ok: true };
}

// ---------- Certificates ----------

export async function setLearningCertificate(enrollmentId: string, input: { key: string; name: string; contentType: string }): Promise<ActionResult> {
  await requireAdmin();
  if (!input.key.startsWith("certificates/")) return fail("Upload is not valid.");
  const e = await db.packageEnrollment.findUnique({ where: { id: enrollmentId }, include: { user: true, package: { select: { id: true, title: true } } } });
  if (!e) return fail("Not found.");
  await db.packageEnrollment.update({
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
  // First certificate: tell the learner it's ready.
  if (!e.certificateKey) {
    await sendMail({ to: e.user.email, ...packageCertificateEmail({ name: e.user.name, packageTitle: e.package.title, packageId: e.package.id }) });
  }
  refresh();
  return { ok: true };
}

export async function removeLearningCertificate(enrollmentId: string): Promise<ActionResult> {
  await requireAdmin();
  const e = await db.packageEnrollment.findUnique({ where: { id: enrollmentId } });
  if (!e) return fail("Not found.");
  await db.packageEnrollment.update({ where: { id: enrollmentId }, data: { certificateKey: null, certificateName: null, certificateType: null, certificateAt: null } });
  await deleteObject(e.certificateKey);
  refresh();
  return { ok: true };
}
