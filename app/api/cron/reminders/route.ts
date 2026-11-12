import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hourIn, todayIn } from "@/lib/dates";
import { getToday } from "@/lib/plans";
import { forgetSettings, getSettings } from "@/lib/settings";
import { digestEmail, PRACTITIONER_EMAIL, reminderEmail, sendMail } from "@/lib/mail";

// Runs every hour (vercel.json). Vercel sends "Authorization: Bearer $CRON_SECRET".
// 1. Daily reminders: clients whose local time = their reminder hour and who have unfinished tasks.
// 2. Daily digest to Rangika (when "one summary per day" is chosen), at 9 pm her time.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DIGEST_HOUR = 21;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorized = secret
    ? req.headers.get("authorization") === `Bearer ${secret}`
    : process.env.NODE_ENV !== "production";
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const settings = await getSettings();
  let reminders = 0;

  const clients = await db.user.findMany({
    where: { role: "CLIENT", status: "ACTIVE", remindersOn: true },
    select: { id: true, name: true, email: true, timezone: true, reminderHour: true },
  });

  for (const c of clients) {
    if (hourIn(c.timezone, now) !== c.reminderHour) continue;
    const today = todayIn(c.timezone, now);
    const already = await db.reminderLog.findUnique({ where: { userId_forDate: { userId: c.id, forDate: today } } });
    if (already) continue;
    const { tasks, trackers } = await getToday(c.id, c.timezone);
    const pending = [
      ...tasks.filter((t) => !t.done).map((t) => t.title),
      ...trackers.filter((t) => !t.done).map((t) => `Fill in: ${t.title}`),
    ];
    if (!pending.length) continue;
    const mail = reminderEmail({ name: c.name, tasks: pending, userId: c.id, customText: settings.reminderEmailText });
    const res = await sendMail({ to: c.email, ...mail });
    if (res.ok) {
      await db.reminderLog.create({ data: { userId: c.id, forDate: today } });
      reminders++;
    }
  }

  let digest = 0;
  const adminToday = todayIn(settings.adminTimezone, now);
  if (
    settings.notifyMode === "DAILY_DIGEST" &&
    hourIn(settings.adminTimezone, now) === DIGEST_HOUR &&
    settings.lastDigestDate !== adminToday
  ) {
    const rows = await db.taskCompletion.findMany({
      where: { notifiedAt: null },
      include: { task: { select: { title: true } }, user: { select: { name: true, email: true } } },
      orderBy: { doneAt: "asc" },
    });
    if (rows.length) {
      const res = await sendMail({
        to: PRACTITIONER_EMAIL,
        ...digestEmail(
          rows.map((r) => ({
            clientName: r.user.name || r.user.email,
            taskTitle: r.task.title,
            when: r.doneAt.toLocaleTimeString("en-AU", { timeZone: settings.adminTimezone, hour: "numeric", minute: "2-digit" }),
          })),
        ),
      });
      if (res.ok) {
        await db.taskCompletion.updateMany({ where: { id: { in: rows.map((r) => r.id) } }, data: { notifiedAt: now } });
        digest = rows.length;
      }
    }
    await db.settings.update({ where: { id: 1 }, data: { lastDigestDate: adminToday } });
    forgetSettings();
  }

  return NextResponse.json({ ok: true, reminders, digest });
}
