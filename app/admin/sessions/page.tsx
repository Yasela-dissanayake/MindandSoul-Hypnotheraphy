import Link from "next/link";
import { CalendarClock, FileUp, MessageCircleQuestion, NotebookPen, Video } from "lucide-react";
import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { SERVICES } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { loadAccessOptions } from "@/lib/admin-data";
import { loadQuestions } from "@/lib/questions";
import { SITE_URL } from "@/lib/mail";
import { Badge } from "@/components/ui/badge";
import { AddPersonDialog } from "@/components/admin/add-person-dialog";
import { ExistingClientSessions } from "@/components/admin/existing-client-sessions";
import { NewTemplateDialog } from "@/components/admin/new-template-dialog";
import { QuestionsList } from "@/components/admin/questions-list";
import { StatusBadge } from "@/components/admin/status-badge";

// One-to-one sessions, client by client: who is with Rangika for which service,
// what each of them has, and the questions waiting for an answer.

export default async function SessionsPage() {
  await requireAdminPage();
  const [plans, waitingQuestions, answeredQuestions, templates, { packages, courses }, settings, everyone] = await Promise.all([
    db.plan.findMany({
      where: { userId: { not: null }, user: { status: { not: "FINISHED" } } },
      orderBy: [{ completedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            lastActiveAt: true,
            _count: {
              select: {
                journal: { where: { readAt: null } },
                submissions: { where: { seenAt: null } },
                questions: { where: { answeredAt: null } },
              },
            },
          },
        },
        _count: { select: { items: true, tasks: true, trackers: true } },
      },
    }),
    loadQuestions({ answeredAt: null, user: { status: { not: "FINISHED" } } }),
    loadQuestions({ answeredAt: { not: null } }, 15),
    db.plan.findMany({
      where: { userId: null },
      orderBy: [{ service: "asc" }, { title: "asc" }],
      include: { _count: { select: { modules: true, items: true, tasks: true, trackers: true } } },
    }),
    loadAccessOptions(),
    getSettings(),
    db.user.findMany({ where: { role: "CLIENT", status: { not: "FINISHED" } }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
  ]);

  // Personal files made just for one client count as their materials too.
  const personal = await db.resource.groupBy({
    by: ["personalForUserId"],
    where: { personalForUserId: { in: [...new Set(plans.map((p) => p.userId!))] } },
    _count: true,
  });
  const personalCount = (userId: string) => personal.find((p) => p.personalForUserId === userId)?._count ?? 0;
  const used = await db.plan.groupBy({ by: ["templateId"], where: { templateId: { not: null } }, _count: true });
  const usedCount = (id: string) => used.find((u) => u.templateId === id)?._count ?? 0;

  const lastActive = (d: Date | null) => (d ? d.toLocaleDateString("en-AU", { timeZone: settings.adminTimezone, day: "numeric", month: "short" }) : "not yet");
  const active = plans.filter((p) => !p.completedAt);
  const finished = plans.filter((p) => p.completedAt);

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-stone-800">Sessions</h1>
            <p className="text-stone-500">
              Your one-to-one clients. Open a client to send them their Zoom link, extra exercises, journal prompts, trackers and recordings.
            </p>
          </div>
          <AddPersonDialog packages={packages} courses={courses} siteUrl={SITE_URL} />
        </div>
        <ExistingClientSessions people={everyone.map((u) => ({ id: u.id, name: u.name ? `${u.name} (${u.email})` : u.email }))} />
      </div>

      <section id="questions" className="scroll-mt-6 space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="font-serif text-2xl text-stone-800">Questions</h2>
          {waitingQuestions.length > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-semibold text-white">{waitingQuestions.length}</span>
          )}
        </div>
        <QuestionsList items={waitingQuestions} timezone={settings.adminTimezone} showClient empty="No questions waiting. When a client asks something, it shows here and you get an email." />
        {answeredQuestions.length > 0 && (
          <details className="group rounded-xl bg-white p-4 ring-1 ring-stone-200">
            <summary className="cursor-pointer text-sm font-medium text-stone-700">Recently answered ({answeredQuestions.length})</summary>
            <div className="mt-3">
              <QuestionsList items={answeredQuestions} timezone={settings.adminTimezone} showClient />
            </div>
          </details>
        )}
      </section>

      {SERVICES.map((s) => {
        const rows = active.filter((p) => p.service === s.id);
        return (
          <section key={s.id} className="space-y-3">
            <h2 className="font-serif text-2xl text-stone-800">
              {s.label} <span className="text-base text-stone-500">({rows.length})</span>
            </h2>
            {rows.length === 0 ? (
              <p className="rounded-xl bg-white p-5 text-sm text-stone-500 ring-1 ring-stone-200">No clients in {s.label} sessions right now.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {rows.map((p) => {
                  const u = p.user!;
                  const materials = p._count.items + personalCount(u.id);
                  return (
                    <Link
                      key={p.id}
                      href={`/admin/clients/${u.id}?tab=${u._count.questions ? "questions" : "sessions"}`}
                      className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-stone-200 transition hover:ring-sage-300"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-stone-800">{u.name || u.email}</p>
                          <p className="truncate text-sm text-stone-500">{p.title}</p>
                        </div>
                        <StatusBadge status={u.status} />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {p.totalSessions ? (
                          <Badge variant="outline" className="font-normal">
                            Session {p.currentSession ?? 0} of {p.totalSessions}
                          </Badge>
                        ) : null}
                        {u._count.questions > 0 && (
                          <Badge className="gap-1 bg-red-600 hover:bg-red-600">
                            <MessageCircleQuestion className="h-3 w-3" /> {u._count.questions} question{u._count.questions === 1 ? "" : "s"}
                          </Badge>
                        )}
                        {u._count.submissions > 0 && (
                          <Badge className="gap-1 bg-amber-500 hover:bg-amber-500">
                            <FileUp className="h-3 w-3" /> {u._count.submissions} new upload{u._count.submissions === 1 ? "" : "s"}
                          </Badge>
                        )}
                        {u._count.journal > 0 && (
                          <Badge className="gap-1 bg-sage-600 hover:bg-sage-600">
                            <NotebookPen className="h-3 w-3" /> {u._count.journal} new journal
                          </Badge>
                        )}
                      </div>
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                        <span className={p.meetingLink ? "inline-flex items-center gap-1 text-sage-700" : "inline-flex items-center gap-1 text-amber-700"}>
                          <Video className="h-3.5 w-3.5" /> {p.meetingLink ? "Zoom link set" : "No Zoom link yet"}
                        </span>
                        <span>
                          {materials} material{materials === 1 ? "" : "s"} · {p._count.tasks} task{p._count.tasks === 1 ? "" : "s"} · {p._count.trackers} tracker
                          {p._count.trackers === 1 ? "" : "s"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="h-3.5 w-3.5" /> active {lastActive(u.lastActiveAt)}
                        </span>
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      {finished.length > 0 && (
        <details className="rounded-xl bg-white p-4 ring-1 ring-stone-200">
          <summary className="cursor-pointer text-sm font-medium text-stone-700">Finished session plans ({finished.length})</summary>
          <ul className="mt-3 divide-y divide-stone-100 text-sm">
            {finished.map((p) => (
              <li key={p.id} className="py-2">
                <Link href={`/admin/clients/${p.user!.id}?tab=sessions`} className="hover:underline">
                  <span className="text-stone-800">{p.user!.name || p.user!.email}</span>
                  <span className="text-stone-500"> · {p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}

      <section id="packages" className="scroll-mt-6 space-y-3 border-t border-stone-200 pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl text-stone-800">Ready-made packages</h2>
            <p className="text-sm text-stone-500">
              Optional time-savers, e.g. &quot;Quit smoking: 6 sessions&quot;. Build the weekly work once, then copy it to a client and change anything just for them.
            </p>
          </div>
          <NewTemplateDialog />
        </div>
        {templates.length === 0 ? (
          <p className="rounded-xl bg-white p-5 text-sm text-stone-500 ring-1 ring-stone-200">No packages yet. You don&apos;t need one: you can also build a client&apos;s plan from scratch.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {templates.map((t) => (
              <Link key={t.id} href={`/admin/plans/${t.id}`} className="space-y-2 rounded-xl bg-white p-4 ring-1 ring-stone-200 transition hover:ring-sage-300">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-stone-800">{t.title}</p>
                  <Badge variant="outline" className="font-normal">
                    {SERVICES.find((s) => s.id === t.service)?.short}
                  </Badge>
                  {t.totalSessions && <Badge variant="outline">{t.totalSessions} sessions</Badge>}
                </div>
                <p className="text-xs text-stone-500">
                  {t._count.modules} weeks · {t._count.items} items · {t._count.tasks} tasks · {t._count.trackers} trackers
                </p>
                <p className="text-xs text-sage-700">
                  Given to {usedCount(t.id)} {usedCount(t.id) === 1 ? "client" : "clients"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
