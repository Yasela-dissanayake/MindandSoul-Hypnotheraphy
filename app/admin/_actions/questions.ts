"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { answerEmail, sendMail } from "@/lib/mail";
import { fail, refreshAll, type ActionResult } from "./common";

// Clients type questions about their work; Rangika answers them here.
// The client is emailed the answer and sees it on their sessions page.

const answerSchema = z.string().trim().min(1, "Type your answer first.").max(5000, "Please keep the answer shorter.");

export async function answerQuestion(id: string, answer: string, opts: { email?: boolean } = {}): Promise<ActionResult<{ emailed: boolean }>> {
  await requireAdmin();
  const parsed = answerSchema.safeParse(answer);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the answer.");
  const q = await db.question.findUnique({ where: { id }, include: { user: { select: { name: true, email: true, status: true } } } });
  if (!q) return fail("Question not found.");
  const firstAnswer = !q.answeredAt;
  await db.question.update({
    where: { id },
    // A changed answer shows as new to the client again.
    data: { answer: parsed.data, answeredAt: q.answeredAt ?? new Date(), answerSeenAt: null },
  });
  let emailed = false;
  if ((opts.email ?? firstAnswer) && q.user.status !== "FINISHED") {
    const res = await sendMail({ to: q.user.email, ...answerEmail({ name: q.user.name, topic: q.topic, question: q.body, answer: parsed.data }) });
    emailed = res.ok;
    if (!res.ok) console.error("Answer email failed for question", id);
  }
  refreshAll();
  return { ok: true, data: { emailed } };
}

export async function deleteQuestion(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.question.deleteMany({ where: { id } });
  refreshAll();
  return { ok: true };
}
