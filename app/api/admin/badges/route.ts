import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { countWaitingQuestionsByArea } from "@/lib/questions";
import { countNewSales } from "@/lib/sales";
import { countOpenEnquiries } from "@/lib/enquiries";

// Numbers for the red badges in the admin menu: unanswered questions,
// new bookings / enrollments, and contact form enquiries waiting for a reply.
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const [questions, sales, enquiries] = await Promise.all([
      countWaitingQuestionsByArea(),
      countNewSales(),
      countOpenEnquiries(),
    ]);
    return NextResponse.json({ ...questions, sales: sales.total, enquiries }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    // Database out of reach for a moment: the menu keeps its last numbers and asks again later.
    return NextResponse.json({ error: "Try again later" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
