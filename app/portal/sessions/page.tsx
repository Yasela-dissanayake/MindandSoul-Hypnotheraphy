import Link from "next/link";
import { ClipboardList, Video } from "lucide-react";
import { requireClientPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { getSessionMaterial } from "@/lib/material";
import { dayNumber, todayIn } from "@/lib/dates";
import { weekOfDay } from "@/lib/plans";
import { serviceLabel } from "@/lib/catalog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ResourceItem } from "@/components/portal/resource-item";
import { SubmissionUpload, MySubmissions } from "@/components/portal/submissions";
import { cn } from "@/lib/utils";
import { AskQuestion } from "@/components/portal/ask-question";
import { MyQuestions } from "@/components/portal/my-questions";
import { PlanBookings } from "@/components/portal/plan-bookings";

export default async function SessionsPage() {
  const user = await requireClientPage();
  const [{ plans, personal }, submissions, questions, bookingInfo] = await Promise.all([
    getSessionMaterial(user.id),
    db.submission.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 }),
    db.question.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 }),
    // Their booked sessions per plan, and whether each plan can be booked online (bought on the website).
    db.plan.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        totalSessions: true,
        sessionService: { select: { published: true, enquiryOnly: true } },
        bookings: { where: { status: "CONFIRMED" }, orderBy: { startsAt: "asc" }, select: { id: true, startsAt: true, endsAt: true, mode: true } },
      },
    }),
  ]);
  const now = new Date();
  const bookingsFor = (planId: string) => {
    const p = bookingInfo.find((x) => x.id === planId);
    if (!p) return null;
    const upcoming = p.bookings.filter((b) => b.endsAt > now);
    return {
      upcoming,
      pastCount: p.bookings.length - upcoming.length,
      left: p.sessionService ? Math.max(0, (p.totalSessions ?? 0) - p.bookings.length) : 0,
      canBook: Boolean(p.sessionService?.published && !p.sessionService.enquiryOnly),
    };
  };
  const today = todayIn(user.timezone);

  if (!plans.length) {
    return (
      <div className="space-y-4">
        <h1 className="font-serif text-3xl text-stone-800">My sessions</h1>
        <p className="rounded-2xl bg-white p-6 text-stone-500 ring-1 ring-stone-200">Rangika is preparing your sessions work. It will appear here soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl text-stone-800">My sessions</h1>

      {plans.map((plan) => {
        const current = plan.currentSession ?? 0;
        const week = plan.startDate ? weekOfDay(Math.max(1, dayNumber(plan.startDate, today))) : 1;
        const loose = plan.items.filter((i) => !i.moduleId);
        const looseTasks = plan.tasks.filter((t) => !t.moduleId);
        return (
          <section key={plan.id} className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-sage-100 text-sage-800 hover:bg-sage-100">{serviceLabel(plan.service)}</Badge>
                {plan.completedAt && <Badge variant="outline">Completed</Badge>}
              </div>
              <h2 className="font-serif text-2xl text-stone-800">{plan.title}</h2>
              {plan.description && <p className="whitespace-pre-line text-stone-600">{plan.description}</p>}
            </div>

            {plan.totalSessions ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-stone-600">
                  <span>
                    Session {Math.max(1, current)} of {plan.totalSessions}
                  </span>
                  {plan.startDate && !plan.completedAt && <span>Week {week}</span>}
                </div>
                <Progress value={(Math.max(0, current - 1) / plan.totalSessions) * 100} className="h-2 bg-sage-100 [&>div]:bg-sage-500" />
              </div>
            ) : null}

            {!plan.completedAt && bookingsFor(plan.id) && <PlanBookings planId={plan.id} timezone={user.timezone} {...bookingsFor(plan.id)!} />}

            {plan.meetingLink && !plan.completedAt && (
              <a
                href={plan.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl bg-sage-600 px-4 py-3 text-white hover:bg-sage-700"
              >
                <Video className="h-5 w-5" />
                <span className="flex-1 font-medium">Join your session on Zoom</span>
                <span className="text-sm opacity-80">Open →</span>
              </a>
            )}

            {plan.clientNote && (
              <div className="rounded-xl bg-sage-50 p-4">
                <p className="text-xs uppercase tracking-wide text-sage-700">A note from Rangika</p>
                <p className="mt-1 whitespace-pre-line font-serif text-stone-700">{plan.clientNote}</p>
              </div>
            )}

            {plan.trackers.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-stone-700">Daily check-ins</h3>
                {plan.trackers.map((t) => (
                  <Link
                    key={t.id}
                    href={`/portal/trackers/${t.id}`}
                    className="flex items-center gap-3 rounded-xl p-3 ring-1 ring-stone-200 transition hover:ring-sage-300"
                  >
                    <ClipboardList className="h-5 w-5 text-sage-600" />
                    <span className="flex-1">
                      <span className="block font-medium text-stone-800">{t.title}</span>
                      {t.description && <span className="text-sm text-stone-500">{t.description}</span>}
                    </span>
                    <span className="text-sm text-sage-700">Fill in →</span>
                  </Link>
                ))}
              </div>
            )}

            {plan.modules.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-stone-700">Your work, week by week</h3>
                {plan.modules.map((m, idx) => {
                  const items = plan.items.filter((i) => i.moduleId === m.id);
                  const tasks = plan.tasks.filter((t) => t.moduleId === m.id);
                  const isNow = !plan.completedAt && idx === week - 1;
                  return (
                    <details key={m.id} open={isNow} className={cn("rounded-xl ring-1", isNow ? "ring-sage-300" : "ring-stone-200")}>
                      <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs text-stone-600">{idx + 1}</span>
                        <span className="flex-1 font-medium text-stone-800">{m.title}</span>
                        {isNow && <Badge className="bg-sage-600 hover:bg-sage-600">This week</Badge>}
                      </summary>
                      <div className="space-y-3 px-4 pb-4">
                        {m.description && <p className="whitespace-pre-line text-sm text-stone-600">{m.description}</p>}
                        {tasks.length > 0 && (
                          <div className="rounded-lg bg-stone-50 p-3 text-sm text-stone-700">
                            <p className="font-medium">Exercises</p>
                            <ul className="mt-1 space-y-1">
                              {tasks.map((t) => (
                                <li key={t.id}>
                                  • {t.title} <span className="text-stone-500">({t.recurrence === "DAILY" ? "every day" : "once"})</span>
                                  {t.instructions && <span className="block pl-3 text-stone-500">{t.instructions}</span>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {items.map((i) => (
                          <ResourceItem key={i.id} r={i.resource} note={i.note} />
                        ))}
                        {!items.length && !tasks.length && !m.description && <p className="text-sm text-stone-500">Nothing here yet.</p>}
                        {(items.length > 0 || tasks.length > 0) && (
                          <AskQuestion topic={`${plan.title}: ${m.title}`} topicHref="/portal/sessions" planId={plan.id} label="Ask about this week" />
                        )}
                      </div>
                    </details>
                  );
                })}
              </div>
            )}

            {(loose.length > 0 || looseTasks.length > 0) && (
              <div className="space-y-3">
                {plan.modules.length > 0 && <h3 className="font-medium text-stone-700">Also for you</h3>}
                {loose.map((i) => (
                  <ResourceItem key={i.id} r={i.resource} note={i.note} />
                ))}
              </div>
            )}

            {!plan.completedAt && <AskQuestion topic={plan.title} topicHref="/portal/sessions" planId={plan.id} label="Ask Rangika about these sessions" />}
          </section>
        );
      })}

      {personal.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-stone-800">Made for you</h2>
          {personal.map((r) => (
            <ResourceItem key={r.id} r={r} />
          ))}
        </section>
      )}

      <section id="questions" className="scroll-mt-20 space-y-3 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
        <div>
          <h2 className="font-serif text-xl text-stone-800">Questions for Rangika</h2>
          <p className="text-sm text-stone-500">
            Not sure about something? Type your question here. Rangika will answer, and you&apos;ll get an email when she does.
          </p>
        </div>
        <AskQuestion startOpen planId={plans.filter((p) => !p.completedAt).length === 1 ? plans.find((p) => !p.completedAt)!.id : null} />
        <MyQuestions
          timezone={user.timezone}
          items={questions.map((q) => ({
            id: q.id,
            topic: q.topic,
            body: q.body,
            answer: q.answer,
            createdAt: q.createdAt.toISOString(),
            answeredAt: q.answeredAt?.toISOString() ?? null,
            isNew: Boolean(q.answeredAt && !q.answerSeenAt),
          }))}
        />
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
        <div>
          <h2 className="font-serif text-xl text-stone-800">Send your work to Rangika</h2>
          <p className="text-sm text-stone-500">Completed worksheets, recordings or photos. Only Rangika can see them.</p>
        </div>
        <SubmissionUpload plans={plans.filter((p) => !p.completedAt).map((p) => ({ id: p.id, title: p.title }))} />
        <MySubmissions
          items={submissions.map((s) => ({
            id: s.id,
            title: s.title,
            note: s.note,
            contentType: s.contentType,
            createdAt: s.createdAt.toISOString(),
            seen: Boolean(s.seenAt),
          }))}
          timezone={user.timezone}
        />
      </section>
    </div>
  );
}
