import Link from "next/link";
import { FileUp, MessageCircleQuestion, NotebookPen, Video } from "lucide-react";
import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { loadAccessOptions } from "@/lib/admin-data";
import { loadQuestions } from "@/lib/questions";
import { SITE_URL } from "@/lib/mail";
import { Badge } from "@/components/ui/badge";
import { AddPersonDialog } from "@/components/admin/add-person-dialog";
import { ExistingClientSessions } from "@/components/admin/existing-client-sessions";
import { NewSessionServiceButton } from "@/components/admin/session-service-editor";
import { SessionServicesTable } from "@/components/admin/session-services-table";
import { QuestionsList } from "@/components/admin/questions-list";
import { StatusBadge } from "@/components/admin/status-badge";
import { ClientSessionFilter } from "@/components/admin/client-session-filter";
import { viewerTimezone } from "@/lib/viewer-tz";

// One-to-one sessions, client by client: who is with Rangika for which service,
// what each of them has, and the questions waiting for an answer.

export default async function SessionsPage({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
  const tz = await viewerTimezone();
  await requireAdminPage();
  // Everything in one round: personal files don't depend on the plans list.
  const [plans, waitingQuestions, answeredQuestions, { packages, courses }, settings, everyone, personal, sessionServices, sp] = await Promise.all([
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
        // Booked sessions (website bookings and package sessions).
        bookings: { where: { status: "CONFIRMED" }, orderBy: { startsAt: "asc" }, select: { startsAt: true, endsAt: true } },
      },
    }),
    loadQuestions({ answeredAt: null, user: { status: { not: "FINISHED" } } }),
    loadQuestions({ answeredAt: { not: null } }, 15),
    loadAccessOptions(),
    getSettings(),
    db.user.findMany({ where: { role: "CLIENT", status: { not: "FINISHED" } }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
    // Personal files made just for one client count as their materials too.
    db.resource.groupBy({ by: ["personalForUserId"], where: { personalForUserId: { not: null } }, _count: true }),
    // For the Clients filter: every session service (a new one appears in the filter by itself).
    db.sessionService.findMany({ orderBy: [{ order: "asc" }, { title: "asc" }], select: { id: true, title: true } }),
    searchParams,
  ]);

  const personalCount = (userId: string) => personal.find((p) => p.personalForUserId === userId)?._count ?? 0;

  const now = new Date();
  const nextText = (d: Date) => d.toLocaleString("en-AU", { timeZone: tz, weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  const lastActive = (d: Date | null) => (d ? d.toLocaleDateString("en-AU", { timeZone: tz, day: "numeric", month: "short" }) : "not yet");
  const active = plans.filter((p) => !p.completedAt);

  // Which session each client's plan is for: the service it was booked through, or (plans added by hand)
  // the service with the same name. Anything else is "Other".
  const serviceOf = (p: { sessionServiceId: string | null; title: string }) =>
    p.sessionServiceId ?? sessionServices.find((x) => x.title.trim().toLowerCase() === p.title.trim().toLowerCase())?.id ?? "other";
  const sessionName = (p: { sessionServiceId: string | null; title: string }) => sessionServices.find((x) => x.id === serviceOf(p))?.title ?? p.title;
  const count = (id: string) => active.filter((p) => serviceOf(p) === id).length;
  const filterOptions = [
    { value: "", label: "All sessions", count: active.length },
    ...sessionServices.map((x) => ({ value: x.id, label: x.title, count: count(x.id) })),
    ...(count("other") ? [{ value: "other", label: "Other", count: count("other") }] : []),
  ];
  const filter = filterOptions.some((o) => o.value === sp.session) ? (sp.session as string) : "";
  const shown = filter ? active.filter((p) => serviceOf(p) === filter) : active;
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

      <section id="services" className="scroll-mt-6 space-y-3 border-b border-stone-200 pb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl text-stone-800">Services &amp; prices</h2>
            <p className="text-sm text-stone-500">
              The Clinical Hypnotherapy areas and Reiki Energy Healing services on the website, with AUD and AED prices. Open one to change its page text,
              prices and packages (live and recorded), or hide it.
            </p>
          </div>
          <NewSessionServiceButton />
        </div>
        <SessionServicesTable />
      </section>

      <section id="questions" className="scroll-mt-6 space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="font-serif text-2xl text-stone-800">Questions</h2>
          {waitingQuestions.length > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-semibold text-white">{waitingQuestions.length}</span>
          )}
        </div>
        <QuestionsList items={waitingQuestions} timezone={tz} showClient empty="No questions waiting. When a client asks something, it shows here and you get an email." />
        {answeredQuestions.length > 0 && (
          <details className="group rounded-xl bg-white p-4 ring-1 ring-stone-200">
            <summary className="cursor-pointer text-sm font-medium text-stone-700">Recently answered ({answeredQuestions.length})</summary>
            <div className="mt-3">
              <QuestionsList items={answeredQuestions} timezone={tz} showClient />
            </div>
          </details>
        )}
      </section>

      <section id="clients" className="scroll-mt-6 space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-serif text-2xl text-stone-800">
            Clients <span className="text-base text-stone-500">({shown.length})</span>
          </h2>
          <ClientSessionFilter options={filterOptions} current={filter} />
        </div>
        {shown.length === 0 ? (
          <p className="rounded-xl bg-white p-5 text-sm text-stone-500 ring-1 ring-stone-200">
            {filter ? "No clients in this session right now." : "No one-to-one clients yet. They appear here when someone books a session, or when you add them."}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-stone-200">
            <table className="w-full min-w-[1000px] text-sm">
              <thead className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Session</th>
                  <th className="px-4 py-3 font-medium">Progress</th>
                  <th className="px-4 py-3 font-medium">Waiting for you</th>
                  <th className="px-4 py-3 font-medium">Zoom</th>
                  <th className="px-4 py-3 font-medium">Their work</th>
                  <th className="px-4 py-3 font-medium">Next session</th>
                  <th className="px-4 py-3 font-medium">Last active</th>
                </tr>
              </thead>
              <tbody>
                    {shown.map((p) => {
                      const u = p.user!;
                      const materials = p._count.items + personalCount(u.id);
                      return (
                        // The whole row opens the client (the name link stretches over it).
                        <tr key={p.id} className="relative border-b border-stone-100 align-top last:border-0 hover:bg-stone-50">
                          <td className="px-4 py-3">
                            <Link
                              href={`/admin/clients/${u.id}?tab=${u._count.questions ? "questions" : "sessions"}`}
                              className="font-medium text-stone-800 after:absolute after:inset-0 hover:underline"
                            >
                              {u.name || u.email}
                            </Link>
                            {u.name && <span className="block text-xs text-stone-500">{u.email}</span>}
                            <StatusBadge status={u.status} />
                          </td>
                          <td className="px-4 py-3 text-stone-700">{sessionName(p)}</td>
                          <td className="px-4 py-3 text-stone-700">
                            {p.selfPaced ? "Recorded journey" : p.totalSessions ? `Session ${p.currentSession ?? 0} of ${p.totalSessions}` : "—"}
                          </td>
                          <td className="px-4 py-3">
                            {u._count.questions + u._count.submissions + u._count.journal === 0 ? (
                              <span className="text-stone-400">—</span>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {u._count.questions > 0 && (
                                  <Badge className="gap-1 bg-red-600 hover:bg-red-600">
                                    <MessageCircleQuestion className="h-3 w-3" /> {u._count.questions} question{u._count.questions === 1 ? "" : "s"}
                                  </Badge>
                                )}
                                {u._count.submissions > 0 && (
                                  <Badge className="gap-1 bg-amber-500 hover:bg-amber-500">
                                    <FileUp className="h-3 w-3" /> {u._count.submissions} upload{u._count.submissions === 1 ? "" : "s"}
                                  </Badge>
                                )}
                                {u._count.journal > 0 && (
                                  <Badge className="gap-1 bg-sage-600 hover:bg-sage-600">
                                    <NotebookPen className="h-3 w-3" /> {u._count.journal} journal
                                  </Badge>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={p.meetingLink ? "inline-flex items-center gap-1 text-sage-700" : "inline-flex items-center gap-1 text-amber-700"}>
                              <Video className="h-3.5 w-3.5" /> {p.meetingLink ? "Set" : "Not set"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-stone-600">
                            {materials} material{materials === 1 ? "" : "s"}
                            <span className="block text-xs text-stone-500">
                              {p._count.tasks} task{p._count.tasks === 1 ? "" : "s"} · {p._count.trackers} tracker{p._count.trackers === 1 ? "" : "s"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-stone-600">
                            {(() => {
                              const next = p.bookings.find((b) => b.endsAt > now);
                              const left = p.sessionServiceId && !p.selfPaced ? Math.max(0, (p.totalSessions ?? 0) - p.bookings.length) : 0;
                              return (
                                <>
                                  {next ? nextText(next.startsAt) : <span className="text-stone-400">—</span>}
                                  {left > 0 && <span className="block text-xs text-sage-700">{left} left to book</span>}
                                </>
                              );
                            })()}
                          </td>
                          <td className="px-4 py-3 text-stone-600">{lastActive(u.lastActiveAt)}</td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        )}
      </section>

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
    </div>
  );
}
