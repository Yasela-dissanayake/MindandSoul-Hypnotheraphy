"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/authz";
import { db } from "@/lib/db";
import { DATE_RE, TIME_RE } from "@/lib/booking";
import { NoSessionsLeftError, SessionSlotTakenError, bookWithCredit } from "@/lib/session-sales";
import { notify } from "@/lib/notifications";
import { isValidTimezone, momentIn, timeRange } from "@/lib/dates";

const schema = z.object({
  planId: z.string().min(1).max(50),
  mode: z.enum(["IN_PERSON", "DISTANCE"]),
  date: z.string().regex(DATE_RE),
  start: z.string().regex(TIME_RE),
});

/**
 * Rangika books one of the sessions left on a client's plan for them (no payment), the same way the client
 * would from their portal. The client gets the usual confirmation email.
 */
export async function bookSessionForClient(input: z.input<typeof schema>): Promise<{ ok: true } | { ok: false; error: string; slotTaken?: boolean }> {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please choose a time." };
  const plan = await db.plan.findUnique({ where: { id: parsed.data.planId }, select: { userId: true, title: true, user: { select: { timezone: true } } } });
  if (!plan?.userId) return { ok: false, error: "This plan doesn't belong to a client." };
  try {
    const b = await bookWithCredit({ userId: plan.userId, ...parsed.data, clientTimezone: plan.user?.timezone ?? null, byAdmin: true });
    const tz = plan.user?.timezone && isValidTimezone(plan.user.timezone) ? plan.user.timezone : "Australia/Perth";
    const m = momentIn(b.startsAt, tz);
    await notify(plan.userId, { kind: "SESSION_BOOKED", title: "Rangika booked a session for you", body: `${plan.title} · ${m.day}, ${timeRange(b.startsAt, b.endsAt, tz)}`, href: "/portal/sessions" });
  } catch (e) {
    if (e instanceof SessionSlotTakenError) return { ok: false, error: e.message, slotTaken: true };
    if (e instanceof NoSessionsLeftError) return { ok: false, error: e.message.replace("You've booked", "They've booked").replace("your package", "their package") };
    console.error("Admin session booking failed:", e);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
  return { ok: true };
}
