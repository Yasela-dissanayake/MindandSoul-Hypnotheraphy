"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireClient } from "@/lib/authz";
import { getLearnerPackage } from "@/lib/learning";
import { PRACTITIONER_EMAIL, packageFinishedEmail, sendMail } from "@/lib/mail";
import { notifyAdmins } from "@/lib/notifications";

type Result = { ok: true; data?: { nextLessonId: string | null; finished: boolean } } | { ok: false; error: string };

/** Marks a lesson done. Lessons open one after another, so only the next open lesson can be ticked. */
export async function completeLesson(packageId: string, lessonId: string): Promise<Result> {
  const user = await requireClient();
  const lp = await getLearnerPackage(user.id, packageId);
  if (!lp) return { ok: false, error: "You don't have this course." };
  const lesson = lp.lessons.find((l) => l.id === lessonId);
  if (!lesson) return { ok: false, error: "Lesson not found." };
  if (!lesson.open) return { ok: false, error: "Please finish the lessons before this one first." };

  if (!lesson.done) {
    await db.lessonProgress.upsert({
      where: { enrollmentId_lessonId: { enrollmentId: lp.enrollment.id, lessonId } },
      update: {},
      create: { enrollmentId: lp.enrollment.id, lessonId },
    });
  }

  const after = await getLearnerPackage(user.id, packageId);
  const finished = !!after && after.lessons.length > 0 && after.doneCount === after.lessons.length;
  if (finished) {
    // First time everything is done: mark it and let Rangika know a certificate is needed.
    const marked = await db.packageEnrollment.updateMany({ where: { id: lp.enrollment.id, completedAt: null }, data: { completedAt: new Date() } });
    if (marked.count === 1) {
      await notifyAdmins({
        kind: "COURSE_FINISHED",
        title: `${user.name || user.email} finished ${lp.pkg.title}`,
        body: "Upload their certificate when it's ready.",
        href: `/admin/clients/${user.id}?tab=learning`,
      });
      await sendMail({ to: PRACTITIONER_EMAIL, ...packageFinishedEmail({ name: user.name || user.email || "A learner", packageTitle: lp.pkg.title }) });
    }
  }
  revalidatePath("/portal", "layout");
  revalidatePath("/admin/courses");
  return { ok: true, data: { nextLessonId: after?.nextLessonId ?? null, finished } };
}
