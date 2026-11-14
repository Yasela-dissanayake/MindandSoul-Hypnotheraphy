import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { countWaitingQuestions } from "@/lib/questions";

// Numbers for the red badges in the admin menu: waiting access requests and unanswered questions.
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const [requests, questions] = await Promise.all([db.accessRequest.count({ where: { status: "PENDING" } }), countWaitingQuestions()]);
    return NextResponse.json({ requests, questions }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    // Database out of reach for a moment: the menu keeps its last numbers and asks again later.
    return NextResponse.json({ error: "Try again later" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
