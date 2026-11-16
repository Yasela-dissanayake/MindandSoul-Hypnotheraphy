import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PurchaseError, startPurchase } from "@/lib/learning";

const schema = z.object({
  packageId: z.string().min(1).max(50),
  name: z.string().trim().min(1, "Please enter your name.").max(100),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
});

/** Starts paying for an online course. The price comes from the database, not from the browser. */
export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check your details." }, { status: 400 });
  try {
    const { clientSecret, paymentIntentId } = await startPurchase(parsed.data);
    return NextResponse.json({ client_secret: clientSecret, payment_intent_id: paymentIntentId });
  } catch (e) {
    if (e instanceof PurchaseError) return NextResponse.json({ error: e.message }, { status: 409 });
    console.error("Course checkout failed:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
