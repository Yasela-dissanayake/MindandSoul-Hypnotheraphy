"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireClient } from "@/lib/authz";
import { DATE_RE, TIME_RE } from "@/lib/booking";
import { NoSessionsLeftError, SessionSlotTakenError, bookWithCredit } from "@/lib/session-sales";

const schema = z.object({
  planId: z.string().min(1).max(50),
  mode: z.enum(["IN_PERSON", "DISTANCE"]),
  date: z.string().regex(DATE_RE),
  start: z.string().regex(TIME_RE),
  timezone: z.string().max(64).optional(),
});

/** A client books one of the sessions left in their package (already paid: no payment here). */
export async function bookPackageSession(input: z.input<typeof schema>): Promise<{ ok: true } | { ok: false; error: string; slotTaken?: boolean }> {
  const user = await requireClient();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please choose a time." };
  try {
    await bookWithCredit({ userId: user.id, ...parsed.data, clientTimezone: parsed.data.timezone });
  } catch (e) {
    if (e instanceof SessionSlotTakenError) return { ok: false, error: e.message, slotTaken: true };
    if (e instanceof NoSessionsLeftError) return { ok: false, error: e.message };
    console.error("Package session booking failed:", e);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
  revalidatePath("/portal", "layout");
  revalidatePath("/admin", "layout");
  return { ok: true };
}
