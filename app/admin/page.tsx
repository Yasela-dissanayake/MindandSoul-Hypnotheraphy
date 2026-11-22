import Link from "next/link";
import { CheckCircle2, NotebookPen, Upload, UserPlus } from "lucide-react";
import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { countWaitingQuestions } from "@/lib/questions";
import { countNewSales } from "@/lib/sales";
import { countOpenEnquiries } from "@/lib/enquiries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { viewerTimezone } from "@/lib/viewer-tz";
import { JournalReadButton } from "@/components/admin/journal-read-button";

const DAY = 86400000;

export default async function AdminOverview() {
  const tz = await viewerTimezone();
  await requireAdminPage();
  const since = new Date(Date.now() - DAY);
  // All at once: one database trip instead of three in a row.
  const [settings, waitingQuestions, counts, recent, unread, unreadCount, sales, openEnquiries] = await Promise.all([
    getSettings(),
    countWaitingQuestions(),
    Promise.all([
      db.user.count({ where: { role: "CLIENT", status: { in: ["ACTIVE", "INVITED"] }, plans: { some: { completedAt: null } } } }),
      db.user.count({ where: { role: "CLIENT", status: { in: ["ACTIVE", "INVITED"] }, enrollments: { some: { completedAt: null } } } }),
      db.submission.count({ where: { seenAt: null } }),
    ]),
    db.taskCompletion.findMany({
      where: { doneAt: { gte: since } },
      orderBy: { doneAt: "desc" },
      take: 20,
      include: { task: { select: { title: true } }, user: { select: { id: true, name: true, email: true } } },
    }),
    db.journalEntry.findMany({
      where: { readAt: null },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    db.journalEntry.count({ where: { readAt: null } }),
    countNewSales(),
    countOpenEnquiries(),
  ]);

  const [sessionClients, students, newUploads] = counts;
  const time = (d: Date) =>
    d.toLocaleString("en-AU", { timeZone: tz, weekday: "short", hour: "numeric", minute: "2-digit" });
  const display = (u: { name: string | null; email: string }) => u.name || u.email;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-stone-800">Overview</h1>
          <p className="text-stone-500">Here&apos;s how everyone is doing.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="bg-sage-600 hover:bg-sage-700">
            <Link href="/admin/clients?add=1">
              <UserPlus className="mr-2 h-4 w-4" /> Add person
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/library">
              <Upload className="mr-2 h-4 w-4" /> Upload material
            </Link>
          </Button>
        </div>
      </div>

      {sales.total > 0 && (
        <Link
          href={`/admin/bookings${sales.sessions > 0 ? "" : sales.courses > 0 ? "?tab=courses" : "?tab=learning"}`}
          className="flex items-center justify-between gap-3 rounded-xl bg-sage-50 p-4 ring-1 ring-sage-200 hover:bg-sage-100"
        >
          <span className="text-stone-800">
            <span>
              <strong>New on the website:</strong>{" "}
              {[
                sales.sessions && `${sales.sessions} session booking${sales.sessions === 1 ? "" : "s"}`,
                sales.courses && `${sales.courses} class enrolment${sales.courses === 1 ? "" : "s"}`,
                sales.learning && `${sales.learning} course purchase${sales.learning === 1 ? "" : "s"}`,
              ]
                .filter(Boolean)
                .join(", ")}
            </span>
          </span>
          <span className="shrink-0 text-sm font-medium text-sage-800">See them →</span>
        </Link>
      )}

      {openEnquiries > 0 && (
        <Link href="/admin/enquiries" className="flex items-center justify-between gap-3 rounded-xl bg-sage-50 p-4 ring-1 ring-sage-200 hover:bg-sage-100">
          <span className="text-stone-800">
            <strong>{openEnquiries}</strong> {openEnquiries === 1 ? "enquiry is" : "enquiries are"} waiting for a reply (free consultation requests and questions).
          </span>
          <span className="shrink-0 text-sm font-medium text-sage-800">Reply →</span>
        </Link>
      )}

      {waitingQuestions > 0 && (
        <Link href="/admin/sessions#questions" className="flex items-center justify-between gap-3 rounded-xl bg-red-50 p-4 ring-1 ring-red-200 hover:bg-red-100">
          <span className="text-red-900">
            <strong>{waitingQuestions}</strong> {waitingQuestions === 1 ? "question is" : "questions are"} waiting for your answer.
          </span>
          <span className="text-sm font-medium text-red-900">Answer →</span>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Session clients", value: sessionClients },
          { label: "Class students", value: students },
          { label: "Unread journal entries", value: unreadCount },
          { label: "New uploads from clients", value: newUploads },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-sm text-stone-500">{s.label}</p>
              <p className="mt-1 font-serif text-3xl text-stone-800">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-xl font-normal">
              <CheckCircle2 className="h-5 w-5 text-sage-600" /> Last 24 hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.length === 0 && <p className="text-sm text-stone-500">No tasks completed yet today.</p>}
            {recent.map((r) => (
              <Link key={r.id} href={`/admin/clients/${r.user.id}?tab=progress`} className="flex items-start justify-between gap-3 text-sm hover:underline">
                <span>
                  <span className="font-medium text-stone-800">{display(r.user)}</span>{" "}
                  <span className="text-stone-600">completed {r.task.title}</span>
                </span>
                <span className="shrink-0 text-xs text-stone-400">{time(r.doneAt)}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className={unreadCount > 0 ? "border-amber-300 bg-amber-50/60 ring-2 ring-amber-200" : undefined}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-xl font-normal">
              <NotebookPen className={`h-5 w-5 ${unreadCount > 0 ? "text-amber-600" : "text-sage-600"}`} /> New journal entries
              {unreadCount > 0 && (
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-2.5 py-0.5 font-sans text-xs font-semibold text-white">
                  <span className="relative flex h-2 w-2" aria-hidden>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                  </span>
                  {unreadCount} new
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unread.length === 0 && <p className="text-sm text-stone-500">You&apos;re all caught up.</p>}
            {unread.map((j) => (
              <div key={j.id} className="flex items-center gap-2 rounded-lg bg-white p-2 pr-3 text-sm ring-1 ring-amber-200 transition hover:bg-amber-100/60">
                <Link href={`/admin/clients/${j.user.id}?tab=journal`} className="min-w-0 flex-1 rounded-md p-1">
                  <div className="flex justify-between gap-3">
                    <span className="font-medium text-stone-800">{display(j.user)}</span>
                    <span className="shrink-0 text-xs text-stone-400">{time(j.createdAt)}</span>
                  </div>
                  <p className="line-clamp-2 text-stone-600">{j.body || (j.audioKey ? "🎙️ Voice message" : "")}</p>
                </Link>
                <JournalReadButton entryId={j.id} read={false} compact />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
