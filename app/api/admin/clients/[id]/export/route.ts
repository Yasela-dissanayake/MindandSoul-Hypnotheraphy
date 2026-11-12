import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";

// "Download their data" for privacy requests: everything stored about one client, as JSON.

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      status: true,
      timezone: true,
      reminderHour: true,
      remindersOn: true,
      consentAt: true,
      invitedAt: true,
      lastActiveAt: true,
      createdAt: true,
      plans: {
        include: {
          modules: true,
          items: { include: { resource: { select: { title: true, kind: true } } } },
          tasks: true,
          prompts: true,
          trackers: { include: { entries: { select: { forDate: true, values: true } } } },
        },
      },
      enrollments: { include: { course: { select: { title: true } }, progress: { include: { module: { select: { title: true } } } } } },
      submissions: { select: { title: true, note: true, originalName: true, createdAt: true } },
      completions: { include: { task: { select: { title: true } } } },
      journal: { select: { createdAt: true, prompt: true, body: true, audioKey: true, audioSeconds: true } },
      notes: true,
      personalFiles: { select: { title: true, kind: true, createdAt: true } },
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const filename = `client-data-${(user.name || user.email).replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.json`;
  return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), ...user }, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
