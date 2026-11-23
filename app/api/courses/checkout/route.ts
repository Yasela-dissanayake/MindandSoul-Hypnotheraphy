import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PurchaseError } from "@/lib/learning";
import { startCoursePurchase } from "@/lib/course-sales";

const schema = z.object({
  itemId: z.string().min(1).max(50),
  name: z.string().trim().min(1, "Please enter your name.").max(100),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  phone: z.string().trim().max(40).optional(),
  // Which of the class's prices they saw (AUD, or AED in the UAE). The amount still comes from the database.
  currency: z.enum(["aud", "aed"]).optional(),
  // "I have completed Reiki Level 1" for classes with a prerequisite.
  prerequisiteDone: z.boolean().optional(),
});

/** Starts paying for a place on a taught course. The price comes from the database, not from the browser. */
export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check your details." }, { status: 400 });
  try {
    const r = await startCoursePurchase(parsed.data);
    // Free under a promotion: already enrolled, nothing to pay.
    if (r.free) return NextResponse.json({ free: true, newAccount: r.newAccount });
    return NextResponse.json({ client_secret: r.clientSecret, payment_intent_id: r.paymentIntentId });
  } catch (e) {
    if (e instanceof PurchaseError) return NextResponse.json({ error: e.message, owned: Boolean(e.opts.owned), suggest: e.opts.suggest ?? [] }, { status: 409 });
    console.error("Course enrollment checkout failed:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
