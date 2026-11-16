import { type NextRequest, NextResponse } from "next/server";
import { fulfilPurchase } from "@/lib/learning";

/**
 * Called by the course page right after the card payment succeeds. Stripe is asked directly
 * whether it went through; the Stripe webhook does the same as a backup.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const id = typeof body?.paymentIntentId === "string" ? body.paymentIntentId : "";
  if (!/^pi_[A-Za-z0-9_]+$/.test(id)) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const p = await fulfilPurchase(id);
    if (!p || p.status !== "PAID") return NextResponse.json({ ok: false }, { status: 409 });
    return NextResponse.json({ ok: true, newAccount: p.newAccount });
  } catch (e) {
    console.error("Course purchase confirmation failed:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
