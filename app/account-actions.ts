"use server";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/authz";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/passwords";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** The signed-in person changes their own password (clients and admin). */
export async function changeMyPassword(input: { current: string; next: string; confirm: string }): Promise<ActionResult> {
  const s = await requireUser();
  const user = await db.user.findUnique({ where: { id: s.id } });
  if (!user) return { ok: false, error: "Please sign in again." };

  if (user.passwordHash && !(await verifyPassword(input.current, user.passwordHash))) {
    return { ok: false, error: "Your current password isn't right." };
  }
  if (input.next !== input.confirm) return { ok: false, error: "The new passwords don't match." };
  const problem = passwordProblem(input.next);
  if (problem) return { ok: false, error: problem };

  await db.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(input.next),
      passwordView: null, // the admin can no longer see it
      passwordChangedAt: new Date(),
      failedLogins: 0,
      lockedUntil: null,
    },
  });
  return { ok: true };
}
