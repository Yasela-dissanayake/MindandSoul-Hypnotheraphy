import { z } from "zod";
import { db } from "@/lib/db";
import { enrollInClass } from "@/lib/class-enroll";
import { copyTemplateToUser } from "@/lib/plans";
import { serviceLabel } from "@/lib/catalog";
import { normaliseUsername, usernameFromName, usernameProblem } from "@/lib/passwords";

/** A free username based on `wanted` (or the person's name), adding a number if it's taken. */
export async function availableUsername(wanted: string, excludeUserId?: string): Promise<string> {
  let base = normaliseUsername(wanted);
  if (usernameProblem(base)) base = usernameFromName(wanted);
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}${i + 1}`;
    const taken = await db.user.findFirst({
      where: { OR: [{ username: candidate }, { email: candidate }], ...(excludeUserId ? { id: { not: excludeUserId } } : {}) },
      select: { id: true },
    });
    if (!taken) return candidate;
  }
  return `${base}${Date.now() % 100000}`;
}

/** Is this username free for this user? */
export async function usernameTaken(username: string, excludeUserId?: string) {
  const taken = await db.user.findFirst({
    where: { username, ...(excludeUserId ? { id: { not: excludeUserId } } : {}) },
    select: { id: true },
  });
  return Boolean(taken);
}

/** What a person gets access to: a session plan and/or courses. */
export const accessSchema = z
  .object({
    sessions: z
      .object({
        service: z.enum(["REIKI_HEALING", "ANIMAL_REIKI", "HYPNOTHERAPY"]),
        // The session service it's for (Session services & prices). Linked plans let the client book
        // their package sessions online, just like buying on the website.
        sessionServiceId: z.string().max(50).nullable().optional(),
        bookOnline: z.boolean().optional(),
        title: z.string().trim().max(150).nullable().optional(),
        templateId: z.string().nullable().optional(),
        totalSessions: z.number().int().min(1).max(100).nullable().optional(),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
      })
      .nullable()
      .optional(),
    courseIds: z.array(z.string()).max(20).default([]),
  })
  .refine((a) => a.sessions || a.courseIds.length > 0, { message: "Choose sessions, a class, or both." });

export type AccessInput = z.input<typeof accessSchema>;

/** Create their session plan (from a ready-made package or blank) and course enrollments. */
export async function giveAccess(userId: string, access: z.output<typeof accessSchema>, startDate: string) {
  if (access.sessions) {
    const s = access.sessions;
    const start = s.startDate || startDate;
    const service = s.sessionServiceId
      ? await db.sessionService.findUnique({ where: { id: s.sessionServiceId }, select: { id: true, title: true, planService: true } })
      : null;
    if (service) {
      await db.plan.create({
        data: {
          userId,
          title: s.title?.trim() || service.title,
          service: service.planService ?? s.service,
          totalSessions: s.totalSessions ?? null,
          currentSession: s.totalSessions ? 1 : null,
          startDate: start,
          sessionServiceId: s.bookOnline === false ? null : service.id,
        },
      });
    } else if (s.templateId) {
      await copyTemplateToUser(s.templateId, userId, start);
    } else {
      await db.plan.create({
        data: {
          userId,
          title: serviceLabel(s.service),
          service: s.service,
          totalSessions: s.totalSessions ?? null,
          currentSession: s.totalSessions ? 1 : null,
          startDate: start,
        },
      });
    }
  }
  // A bundle enrolls them in each of its classes.
  for (const courseId of access.courseIds) await enrollInClass(userId, courseId);
}
