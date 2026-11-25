"use server";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/authz";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/passwords";
import { cookies } from "next/headers";
import { auth } from "@/lib/authz";
import { isValidTimezone } from "@/lib/dates";
import { forgetSettings } from "@/lib/settings";
import { TZ_COOKIE } from "@/lib/viewer-tz";

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

/**
 * The browser reports its own time zone. Remembered for showing times on pages, and saved on
 * the signed-in person so "today", reminders and Rangika's daily summary follow where they are.
 */
export async function syncMyTimezone(timezone: string): Promise<{ changed: boolean }> {
  if (!isValidTimezone(timezone)) return { changed: false };
  const jar = await cookies();
  let changed = jar.get(TZ_COOKIE)?.value !== timezone;
  if (changed) jar.set(TZ_COOKIE, timezone, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: false });

  const session = await auth();
  const me = session?.user;
  if (me?.id) {
    const res = await db.user.updateMany({ where: { id: me.id, NOT: { timezone } }, data: { timezone } });
    if (res.count) changed = true;
    if (me.role === "ADMIN") {
      const s = await db.settings.updateMany({ where: { id: 1, NOT: { adminTimezone: timezone } }, data: { adminTimezone: timezone } });
      if (s.count) {
        forgetSettings();
        changed = true;
      }
    }
  }
  return { changed };
}

/** Signs out from the website's profile menu and goes back to the home page. */
export async function signOutToHome() {
  const { signOut } = await import("@/auth");
  await signOut({ redirectTo: "/" });
}
