import { db } from "@/lib/db";
import type { PromoChoices } from "@/components/admin/promotion-editor";

// Admin → Promotion: what a promotion can link to, and how its link and dates are shown.

export async function promotionChoices(): Promise<PromoChoices> {
  const [sessions, classes, courses] = await Promise.all([
    db.sessionService.findMany({ where: { enquiryOnly: false }, orderBy: [{ order: "asc" }, { title: "asc" }], select: { id: true, title: true, published: true } }),
    db.course.findMany({ where: { archived: false }, orderBy: [{ order: "asc" }, { title: "asc" }], select: { id: true, title: true, published: true } }),
    db.learningPackage.findMany({ where: { archived: false }, orderBy: [{ order: "asc" }, { createdAt: "asc" }], select: { id: true, title: true, published: true } }),
  ]);
  const hidden = (p: boolean) => (p ? "" : " (not on the website)");
  return {
    sessions: sessions.map((s) => ({ value: `session:${s.id}`, title: s.title + hidden(s.published) })),
    classes: classes.map((c) => ({ value: `class:${c.id}`, title: c.title + hidden(c.published) })),
    courses: courses.map((c) => ({ value: `course:${c.id}`, title: c.title + hidden(c.published) })),
  };
}

export const promotionInclude = {
  sessionService: { select: { title: true } },
  course: { select: { title: true } },
  package: { select: { title: true } },
} as const;

type WithLink = {
  sessionServiceId: string | null;
  courseId: string | null;
  packageId: string | null;
  sessionService: { title: string } | null;
  course: { title: string } | null;
  package: { title: string } | null;
};

/** The form's "link" value, e.g. "class:abc". */
export const linkValue = (p: WithLink) =>
  p.sessionServiceId ? `session:${p.sessionServiceId}` : p.courseId ? `class:${p.courseId}` : p.packageId ? `course:${p.packageId}` : "";

/** e.g. "Class: Reiki Level 1 – Shoden" */
export const linkText = (p: WithLink) =>
  p.sessionService ? `Session: ${p.sessionService.title}` : p.course ? `Class: ${p.course.title}` : p.package ? `Course: ${p.package.title}` : null;

export const isRunning = (p: { startsAt: Date; endsAt: Date }, now = new Date()) => p.startsAt <= now && p.endsAt > now;

export function shortDate(d: Date, timeZone: string) {
  return d.toLocaleDateString("en-AU", { timeZone, day: "numeric", month: "short", year: "numeric" });
}

/** "5 days left", "ends today" */
export function timeLeft(endsAt: Date, now = new Date()) {
  const days = Math.ceil((endsAt.getTime() - now.getTime()) / 86_400_000);
  return days <= 1 ? "ends within a day" : `${days} days left`;
}
