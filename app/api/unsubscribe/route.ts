import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { unsubscribeToken } from "@/lib/mail";

// One-click "turn off reminder emails" link from the reminder email.

function page(message: string) {
  return new NextResponse(
    `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reminders</title></head>
<body style="font-family:Georgia,serif;background:#f6f7f6;color:#292524;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:16px">
<div style="background:#fff;padding:32px;border-radius:12px;max-width:420px;text-align:center"><h1 style="font-size:22px;color:#485a48">Mind &amp; Soul Works</h1><p>${message}</p>
<p><a href="/portal/profile" style="color:#485a48">Change this in your settings</a></p></div></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get("u") ?? "";
  const t = req.nextUrl.searchParams.get("t") ?? "";
  const expected = unsubscribeToken(u);
  const valid = t.length === expected.length && timingSafeEqual(Buffer.from(t), Buffer.from(expected));
  if (!u || !valid) return page("This link isn't valid any more.");
  await db.user.updateMany({ where: { id: u }, data: { remindersOn: false } });
  return page("Reminder emails are now turned off.");
}
