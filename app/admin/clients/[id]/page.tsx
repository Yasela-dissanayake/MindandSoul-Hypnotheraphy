import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { PlanBookingsAdmin } from "@/components/admin/plan-bookings-admin";
import { loadLibraryOptions, loadPlansForEditor } from "@/lib/admin-plans";
import { getSettings } from "@/lib/settings";
import { addDays, dayNumber, formatDate, todayIn } from "@/lib/dates";
import { isDue } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/status-badge";
import { MaterialsEditor, ModulesEditor, PlanDetails, PromptsEditor, TasksEditor, TrackersEditor } from "@/components/admin/plan-editor";
import { PersonCourses } from "@/components/admin/course-editor";
import { GiveCourse, RemoveCourse } from "@/components/admin/person-learning";
import { LearningCertificateUpload } from "@/components/admin/learning-editor";
import { Progress } from "@/components/ui/progress";
import { SubmissionsList } from "@/components/admin/submissions-list";
import { TrackerHistory } from "@/components/trackers/tracker-history";
import { parseTrackerFields, serviceLabel } from "@/lib/catalog";
import { loadAccessOptions } from "@/lib/admin-data";
import { AddPlanPanel } from "@/components/admin/add-plan-panel";
import { LibraryUpload } from "@/components/admin/library-upload";
import { ClientDetailsForm } from "@/components/admin/client-details-form";
import { LoginDetailsPanel } from "@/components/admin/login-details-panel";
import { getLoginDetails } from "@/app/admin/_actions/clients";
import { SITE_URL } from "@/lib/mail";
import { NotesPanel } from "@/components/admin/notes-panel";
import { MarkJournalRead } from "@/components/admin/mark-journal-read";
import { formatDuration } from "@/lib/format";
import { loadQuestions } from "@/lib/questions";
import { QuestionsList } from "@/components/admin/questions-list";
import { viewerTimezone } from "@/lib/viewer-tz";

/** The person, loaded once per request and shared by the header and the open tab. */
const getClient = cache((id: string) =>
  db.user.findUnique({
    where: { id },
    include: {
      _count: { select: { journal: { where: { readAt: null } }, submissions: { where: { seenAt: null } }, questions: { where: { answeredAt: null } } } },
      plans: { select: { service: true }, where: { completedAt: null } },
      enrollments: { select: { course: { select: { title: true } } } },
      learningEnrollments: { select: { package: { select: { title: true } } } },
    },
  }),
);
type Client = NonNullable<Awaited<ReturnType<typeof getClient>>>;

async function clientOr404(id: string): Promise<Client> {
  const c = await getClient(id);
  if (!c || c.role !== "CLIENT") notFound();
  return c;
}

const TABS = [
  { id: "sessions", label: "Sessions" },
  { id: "questions", label: "Questions" },
  { id: "tasks", label: "Tasks" },
  { id: "trackers", label: "Trackers" },
  { id: "uploads", label: "Uploads" },
  { id: "courses", label: "Classes" },
  { id: "learning", label: "Courses" },
  { id: "journal", label: "Journal" },
  { id: "progress", label: "Progress" },
  { id: "notes", label: "Private notes" },
  { id: "details", label: "Details" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default async function ClientPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string; add?: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const sp = await searchParams;
  const requested = sp.tab === "plan" ? "sessions" : sp.tab; // old links
  // No tab asked for: open where this person has something (sessions, then classes, then courses).
  const client = requested ? null : await clientOr404(id);
  const fallback: Tab = !client || client.plans.length ? "sessions" : client.enrollments.length ? "courses" : client.learningEnrollments.length ? "learning" : "sessions";
  const tab: Tab = (TABS.find((t) => t.id === requested)?.id ?? fallback) as Tab;

  return (
    <div className="space-y-6">
      <Link href="/admin/clients" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft className="h-4 w-4" /> All users
      </Link>
      <ClientHeader id={id} tab={tab} />
      {tab === "sessions" && <SessionsTab clientId={id} addPlan={sp.add === "1"} />}
      {tab === "questions" && <QuestionsTab clientId={id} />}
      {tab === "tasks" && <TasksTab clientId={id} />}
      {tab === "trackers" && <TrackersTab clientId={id} />}
      {tab === "uploads" && <UploadsTab clientId={id} />}
      {tab === "courses" && <CoursesTab clientId={id} />}
      {tab === "learning" && <LearningTab clientId={id} />}
      {tab === "journal" && <JournalTab clientId={id} />}
      {tab === "progress" && <ProgressTab clientId={id} />}
      {tab === "notes" && <NotesTab clientId={id} />}
      {tab === "details" && <DetailsTab clientId={id} />}
    </div>
  );
}

async function ClientHeader({ id, tab }: { id: string; tab: Tab }) {
  const client = await clientOr404(id);
  return (
    <>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-serif text-3xl text-stone-800">{client.name || client.email}</h1>
          <StatusBadge status={client.status} />
        </div>
        <p className="text-stone-500">
          {client.email} · {client.timezone.replace(/_/g, " ")}
        </p>
        <p className="text-sm text-stone-600">
          {[
            client.plans.length ? `Sessions: ${[...new Set(client.plans.map((p) => serviceLabel(p.service)))].join(", ")}` : "",
            client.enrollments.length ? `Classes: ${client.enrollments.map((e) => e.course.title).join(", ")}` : "",
            client.learningEnrollments.length ? `Courses: ${client.learningEnrollments.map((e) => e.package.title).join(", ")}` : "",
          ]
            .filter(Boolean)
            .join(" · ") || "No sessions, classes or courses yet"}
        </p>
      </div>

      <nav className="-mx-4 overflow-x-auto px-4">
        <div className="flex w-max gap-1 rounded-xl bg-white p-1 ring-1 ring-stone-200">
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={`/admin/clients/${id}?tab=${t.id}`}
              className={cn("whitespace-nowrap rounded-lg px-3 py-2 text-sm", tab === t.id ? "bg-sage-600 text-white" : "text-stone-600 hover:bg-stone-100")}
            >
              {t.label}
              {t.id === "questions" && client._count.questions > 0 && (
                <span className="ml-1.5 rounded-full bg-red-600 px-1.5 text-xs font-semibold text-white">{client._count.questions}</span>
              )}
              {t.id === "uploads" && client._count.submissions > 0 && (
                <span className={cn("ml-1.5 rounded-full px-1.5 text-xs", tab === t.id ? "bg-white/25" : "bg-amber-100 text-amber-800")}>{client._count.submissions}</span>
              )}
              {t.id === "journal" && client._count.journal > 0 && (
                <span className={cn("ml-1.5 rounded-full px-1.5 text-xs", tab === t.id ? "bg-white/25" : "bg-sage-100 text-sage-800")}>{client._count.journal}</span>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

async function DetailsTab({ clientId }: { clientId: string }) {
  const [client, res] = await Promise.all([clientOr404(clientId), getLoginDetails(clientId)]);
  const name = client.name || client.email;
  return (
    <>
      {res.ok && res.data && <LoginDetailsPanel userId={clientId} name={name} details={res.data} siteUrl={SITE_URL} />}
      <ClientDetailsForm
        client={{
          id: client.id,
          name: client.name ?? "",
          email: client.email,
          timezone: client.timezone,
          reminderHour: client.reminderHour,
          remindersOn: client.remindersOn,
          status: client.status,
          consentAt: client.consentAt?.toISOString() ?? null,
        }}
      />
    </>
  );
}

async function QuestionsTab({ clientId }: { clientId: string }) {
  const tz = await viewerTimezone();
  const [items, settings] = await Promise.all([loadQuestions({ userId: clientId }, 200), getSettings()]);
  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-500">Questions they typed about their work. When you answer, they get an email and see it on their page.</p>
      <QuestionsList items={items} timezone={tz} empty="No questions from them yet." />
    </div>
  );
}

async function SessionsTab({ clientId, addPlan }: { clientId: string; addPlan: boolean }) {
  const [client, plans, library, { packages }, planBookings, tz] = await Promise.all([
    clientOr404(clientId),
    loadPlansForEditor({ userId: clientId }),
    loadLibraryOptions(clientId),
    loadAccessOptions(),
    // Their booked sessions per plan (website bookings and package sessions).
    db.plan.findMany({
      where: { userId: clientId },
      select: {
        id: true,
        totalSessions: true,
        sessionServiceId: true,
        bookings: {
          where: { status: "CONFIRMED" },
          orderBy: { startsAt: "asc" },
          select: { id: true, startsAt: true, endsAt: true, mode: true, credit: true, amount: true, currency: true },
        },
      },
    }),
    viewerTimezone(),
  ]);
  const name = client.name || client.email;
  const timezone = client.timezone;
  return (
    <div className="space-y-6">
      {plans.length === 0 && (
        <p className="rounded-xl bg-stone-50 p-4 text-sm text-stone-600 ring-1 ring-stone-200">
          {name} has no one-to-one sessions yet. Add a session plan below to start: choose the session and package they&apos;re having.
        </p>
      )}
      {plans.map((plan) => (
        <section key={plan.id} className="space-y-5 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
          <PlanDetails plan={plan} services={packages} />
          {(() => {
            const pb = planBookings.find((x) => x.id === plan.id);
            if (!pb) return null;
            const left = pb.sessionServiceId ? Math.max(0, (pb.totalSessions ?? 0) - pb.bookings.length) : 0;
            return <PlanBookingsAdmin bookings={pb.bookings} left={left} tz={tz} online={Boolean(pb.sessionServiceId)} />;
          })()}
          <ModulesEditor plan={plan} />
          <MaterialsEditor plan={plan} library={library} />
          <TrackersEditor plan={plan} />
          <PromptsEditor plan={plan} />
          <p className="text-xs text-stone-500">
            Daily exercises are on the{" "}
            <Link href={`/admin/clients/${clientId}?tab=tasks`} className="text-sage-700 underline">
              Tasks tab
            </Link>
            .
          </p>
        </section>
      ))}
      <div id="add-plan" className="scroll-mt-6">
        <AddPlanPanel clientId={clientId} packages={packages} defaultStart={todayIn(timezone)} hasPlans={plans.length > 0} startOpen={addPlan} />
      </div>
      <section className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
        <h2 className="font-serif text-xl text-stone-800">Made just for {name}</h2>
        <p className="text-sm text-stone-500">Personal recordings or documents. They appear on their sessions page straight away, and only they can see them.</p>
        <LibraryUpload personalFor={{ id: clientId, name }} />
      </section>
    </div>
  );
}

async function TrackersTab({ clientId }: { clientId: string }) {
  const trackers = await db.tracker.findMany({
    where: { plan: { userId: clientId } },
    orderBy: [{ active: "desc" }, { order: "asc" }],
    include: { plan: { select: { title: true } }, entries: { orderBy: { forDate: "desc" }, take: 90 } },
  });
  if (!trackers.length) {
    return (
      <p className="rounded-xl bg-white p-5 text-stone-500 ring-1 ring-stone-200">
        No trackers yet. Add one in a session plan on the Sessions tab (e.g. weight &amp; measurements, or an urge tracker).
      </p>
    );
  }
  return (
    <div className="space-y-8">
      {trackers.map((t) => (
        <section key={t.id} className="space-y-3">
          <div>
            <h2 className="font-serif text-xl text-stone-800">
              {t.title} {!t.active && <span className="text-sm text-stone-500">(paused)</span>}
            </h2>
            <p className="text-sm text-stone-500">
              {t.plan.title} · {t.entries.length} answer{t.entries.length === 1 ? "" : "s"}
              {t.entries[0] ? ` · last on ${formatDate(t.entries[0].forDate, { day: "numeric", month: "short" })}` : ""}
            </p>
          </div>
          {t.entries.length === 0 ? (
            <p className="rounded-xl bg-white p-4 text-sm text-stone-500 ring-1 ring-stone-200">No answers yet.</p>
          ) : (
            <TrackerHistory fields={parseTrackerFields(t.fields)} entries={t.entries.map((e) => ({ date: e.forDate, values: e.values as Record<string, unknown> }))} />
          )}
        </section>
      ))}
    </div>
  );
}

async function UploadsTab({ clientId }: { clientId: string }) {
  // Shown to the admin, so in the viewer's own time zone.
  const [, subs, timezone] = await Promise.all([
    clientOr404(clientId),
    db.submission.findMany({ where: { userId: clientId }, orderBy: { createdAt: "desc" }, include: { plan: { select: { title: true } } } }),
    viewerTimezone(),
  ]);
  return (
    <SubmissionsList
      clientId={clientId}
      timezone={timezone}
      items={subs.map((s) => ({
        id: s.id,
        title: s.title,
        note: s.note,
        contentType: s.contentType,
        sizeBytes: s.sizeBytes,
        originalName: s.originalName,
        planTitle: s.plan?.title ?? null,
        createdAt: s.createdAt.toISOString(),
        seen: Boolean(s.seenAt),
      }))}
    />
  );
}

async function CoursesTab({ clientId }: { clientId: string }) {
  const [enrollments, courses] = await Promise.all([
    db.enrollment.findMany({
      where: { userId: clientId },
      orderBy: { startedAt: "asc" },
      include: { course: { select: { id: true, title: true, _count: { select: { modules: true } } } }, user: { select: { name: true, email: true } }, _count: { select: { progress: true } } },
    }),
    db.course.findMany({ where: { archived: false }, select: { id: true, title: true }, orderBy: [{ order: "asc" }, { title: "asc" }] }),
  ]);
  return (
    <PersonCourses
      userId={clientId}
      allCourses={courses}
      enrollments={enrollments.map((e) => ({
        enrollmentId: e.id,
        userId: clientId,
        name: e.user.name || e.user.email,
        email: e.user.email,
        courseId: e.course.id,
        courseTitle: e.course.title,
        totalModules: e.course._count.modules,
        modulesDone: e._count.progress,
        completed: Boolean(e.completedAt),
        hasCertificate: Boolean(e.certificateKey),
        startedAt: e.startedAt.toISOString(),
      }))}
    />
  );
}

/** Self-paced courses this person has (bought on the website or given by Rangika). */
async function LearningTab({ clientId }: { clientId: string }) {
  const [enrollments, all, tz] = await Promise.all([
    db.packageEnrollment.findMany({
      where: { userId: clientId },
      orderBy: { startedAt: "asc" },
      include: { package: { select: { id: true, title: true, _count: { select: { lessons: true } } } }, _count: { select: { progress: true } } },
    }),
    db.learningPackage.findMany({ where: { archived: false }, select: { id: true, title: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
    viewerTimezone(),
  ]);
  const purchases = await db.packagePurchase.findMany({
    where: { userId: clientId, status: "PAID" },
    select: { packageId: true, amount: true, currency: true, paidAt: true },
  });
  const when = (d: Date) => d.toLocaleDateString("en-AU", { timeZone: tz, day: "numeric", month: "short", year: "numeric" });
  const have = new Set(enrollments.map((e) => e.packageId));

  return (
    <div className="space-y-4">
      {enrollments.length === 0 ? (
        <p className="rounded-xl bg-stone-50 p-4 text-sm text-stone-600 ring-1 ring-stone-200">No self-paced courses yet. People get them by buying on the website, or you can give one below.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-stone-200">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Started</th>
                <th className="w-48 px-4 py-3 font-medium">Progress</th>
                <th className="px-4 py-3 font-medium">Certificate</th>
                <th className="px-4 py-3 text-right font-medium">Remove</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => {
                const total = e.package._count.lessons;
                const done = Math.min(e._count.progress, total);
                const paid = purchases.find((x) => x.packageId === e.packageId);
                return (
                  <tr key={e.id} className="border-b border-stone-100 align-top last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/admin/courses/${e.package.id}`} className="font-medium text-stone-800 hover:underline">
                        {e.package.title}
                      </Link>
                      <p className="text-xs text-stone-500">
                        {paid ? `Bought on the website${paid.paidAt ? ` · ${when(paid.paidAt)}` : ""}` : "Given by you"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-stone-600">{when(e.startedAt)}</td>
                    <td className="px-4 py-3">
                      <Progress value={total ? (done / total) * 100 : 0} className="h-1.5 bg-sage-100 [&>div]:bg-sage-500" />
                      <p className="mt-1 text-xs text-stone-600">
                        {done} of {total} lesson{total === 1 ? "" : "s"}
                        {e.completedAt ? ` · finished ${when(e.completedAt)}` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {e.completedAt || e.certificateKey ? (
                        <LearningCertificateUpload enrollmentId={e.id} hasCertificate={Boolean(e.certificateKey)} />
                      ) : (
                        <span className="text-stone-500">When they finish</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <RemoveCourse enrollmentId={e.id} title={e.package.title} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <GiveCourse userId={clientId} courses={all.filter((c) => !have.has(c.id))} />
    </div>
  );
}

async function TasksTab({ clientId }: { clientId: string }) {
  const [plans, library] = await Promise.all([loadPlansForEditor({ userId: clientId }), loadLibraryOptions(clientId)]);
  if (!plans.length) return <p className="rounded-xl bg-white p-5 text-stone-500 ring-1 ring-stone-200">No session plan yet. Add one on the Sessions tab first.</p>;
  return (
    <div className="space-y-6">
      {plans.map((plan) => (
        <section key={plan.id} className="space-y-2 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
          <h2 className="font-serif text-xl text-stone-800">{plan.title}</h2>
          <TasksEditor plan={plan} library={library} />
        </section>
      ))}
    </div>
  );
}

async function JournalTab({ clientId }: { clientId: string }) {
  const tz = await viewerTimezone();
  const [entries, settings] = await Promise.all([
    db.journalEntry.findMany({ where: { userId: clientId }, orderBy: { createdAt: "desc" }, take: 200 }),
    getSettings(),
  ]);
  const hasUnread = entries.some((e) => !e.readAt);
  return (
    <div className="space-y-3">
      {hasUnread && <MarkJournalRead clientId={clientId} />}
      {entries.length === 0 && <p className="rounded-xl bg-white p-5 text-stone-500 ring-1 ring-stone-200">No journal entries yet.</p>}
      {entries.map((e) => (
        <article key={e.id} className={cn("space-y-2 rounded-2xl bg-white p-4 ring-1", e.readAt ? "ring-stone-200" : "ring-2 ring-sage-400")}>
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>
              {e.createdAt.toLocaleString("en-AU", { timeZone: tz, weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
            </span>
            {!e.readAt && <span className="rounded-full bg-sage-100 px-2 py-0.5 font-medium text-sage-800">New</span>}
          </div>
          {e.prompt && <p className="text-sm italic text-sage-700">{e.prompt}</p>}
          {e.audioKey && (
            <div className="flex items-center gap-2">
              <audio src={`/api/files/journal/${e.id}`} controls preload="none" className="h-10 w-full" />
              {e.audioSeconds ? <span className="text-xs text-stone-500">{formatDuration(e.audioSeconds)}</span> : null}
            </div>
          )}
          {e.body && <p className="whitespace-pre-line text-stone-700">{e.body}</p>}
        </article>
      ))}
    </div>
  );
}

async function ProgressTab({ clientId }: { clientId: string }) {
  // Their "today" is within a day of the server's, so ask for a little extra and trim below.
  const [{ timezone }, plans, recentTicks] = await Promise.all([
    clientOr404(clientId),
    db.plan.findMany({ where: { userId: clientId, startDate: { not: null } }, include: { tasks: { orderBy: { order: "asc" } } } }),
    db.taskCompletion.findMany({ where: { userId: clientId, forDate: { gte: addDays(todayIn("UTC"), -31) } } }),
  ]);
  const today = todayIn(timezone);
  const days = Array.from({ length: 30 }, (_, i) => addDays(today, i - 29));
  const completions = recentTicks.filter((c) => c.forDate >= days[0]);
  const done = new Set(completions.map((c) => `${c.taskId}:${c.forDate}`));
  const rows = plans.flatMap((p) => p.tasks.map((t) => ({ t, start: p.startDate!, plan: p.title })));
  const doneDays = new Set(completions.map((c) => c.forDate));

  if (!rows.length) return <p className="rounded-xl bg-white p-5 text-stone-500 ring-1 ring-stone-200">No tasks yet.</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-600">
        Active on <strong>{doneDays.size}</strong> of the last 30 days. <span className="text-sage-600">●</span> done ·{" "}
        <span className="text-stone-300">●</span> not done · blank = not scheduled
      </p>
      <div className="overflow-x-auto rounded-2xl bg-white p-4 ring-1 ring-stone-200">
        <table className="text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white pr-3 text-left font-medium text-stone-500">Task</th>
              {days.map((d) => (
                <th key={d} className="w-6 px-0.5 text-center font-normal text-stone-400">
                  {formatDate(d, { day: "numeric" })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ t, start, plan }) => (
              <tr key={t.id}>
                <td className="sticky left-0 max-w-[12rem] truncate bg-white py-1 pr-3 text-stone-700" title={`${plan}: ${t.title}`}>
                  {t.title}
                </td>
                {days.map((d) => {
                  const isDone = done.has(`${t.id}:${d}`);
                  const day = dayNumber(start, d);
                  const scheduled = day >= 1 && (isDone || (t.recurrence === "DAILY" && isDue(t, day, { doneToday: false, doneEver: false })));
                  return (
                    <td key={d} className="px-0.5 py-1 text-center">
                      {scheduled && <span className={cn("inline-block h-3.5 w-3.5 rounded-full", isDone ? "bg-sage-500" : "bg-stone-200")} title={`${formatDate(d)}: ${isDone ? "done" : "not done"}`} />}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function NotesTab({ clientId }: { clientId: string }) {
  const notes = await db.privateNote.findMany({ where: { userId: clientId }, orderBy: { createdAt: "desc" } });
  return <NotesPanel clientId={clientId} notes={notes.map((n) => ({ id: n.id, body: n.body, createdAt: n.createdAt.toISOString() }))} />;
}

