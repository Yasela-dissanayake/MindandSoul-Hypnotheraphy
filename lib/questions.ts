import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { QuestionRow } from "@/components/admin/questions-list";
import { areaQuestionWhere } from "@/lib/session-areas";

/** Questions for the admin lists: unanswered first, then newest. */
export async function loadQuestions(where: Prisma.QuestionWhereInput, take = 100): Promise<QuestionRow[]> {
  const rows = await db.question.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    take,
    include: { user: { select: { id: true, name: true, email: true } }, plan: { select: { title: true } } },
  });
  return rows
    .map((q) => ({
      id: q.id,
      clientId: q.user.id,
      clientName: q.user.name || q.user.email,
      topic: q.topic,
      planTitle: q.plan?.title ?? null,
      body: q.body,
      answer: q.answer,
      answeredAt: q.answeredAt?.toISOString() ?? null,
      answerSeen: Boolean(q.answerSeenAt),
      createdAt: q.createdAt.toISOString(),
    }))
    .sort((a, b) => Number(Boolean(a.answeredAt)) - Number(Boolean(b.answeredAt)));
}

// Shared per page render (menu badge + Overview), like the other dashboard counts.
export const countWaitingQuestions = cache(() => db.question.count({ where: { answeredAt: null, user: { status: { not: "FINISHED" } } } }));

/** Waiting questions split by area, for the Clinical Hypnotherapy and Reiki Energy Healing menu badges. */
export const countWaitingQuestionsByArea = cache(async () => {
  const waiting = { answeredAt: null, user: { status: { not: "FINISHED" as const } } };
  const [hypnoQuestions, reikiQuestions] = await Promise.all([
    db.question.count({ where: { AND: [areaQuestionWhere("hypnotherapy"), waiting] } }),
    db.question.count({ where: { AND: [areaQuestionWhere("reiki-healing"), waiting] } }),
  ]);
  return { hypnoQuestions, reikiQuestions };
});
