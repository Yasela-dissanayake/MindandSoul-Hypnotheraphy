import Link from "next/link";
import { Award, CalendarClock, CalendarPlus, CheckCircle2, ClipboardList, GraduationCap, MapPin, MessageCircleQuestion, NotebookPen, Video } from "lucide-react";
import { requireClientPage } from "@/lib/authz";
import { getToday } from "@/lib/plans";
import { getStudentCourses } from "@/lib/material";
import { greeting, formatDate } from "@/lib/dates";
import { getEncouragements } from "@/lib/settings";
import { AudioPlayer } from "@/components/portal/audio-player";
import { TaskList } from "@/components/portal/task-list";
import { Progress } from "@/components/ui/progress";
import { AskQuestion } from "@/components/portal/ask-question";
import { db } from "@/lib/db";
import { getLearnerPackages } from "@/lib/learning";
import { BookMore, ExploreServices } from "@/components/portal/explore-services";

export default async function TodayPage() {
  const user = await requireClientPage();
  const [{ today, tasks, trackers, prompt, tonightAudio, upcoming, hasPlans }, courses, enc, newAnswers, learning, newReplies, livePlans, nextSession] = await Promise.all([
    getToday(user.id, user.timezone),
    getStudentCourses(user.id),
    getEncouragements(),
    db.question.count({ where: { userId: user.id, answeredAt: { not: null }, answerSeenAt: null } }),
    getLearnerPackages(user.id),
    db.journalEntry.count({ where: { userId: user.id, repliedAt: { not: null }, replySeenAt: null } }),
    // Session plans with live sessions, to remind them of sessions still to book (e.g. after a cancellation).
    db.plan.findMany({
      where: { userId: user.id, completedAt: null, selfPaced: false, sessionServiceId: { not: null } },
      select: {
        id: true,
        title: true,
        totalSessions: true,
        sessionService: { select: { published: true, enquiryOnly: true } },
        bookings: { where: { status: "CONFIRMED", recorded: false }, select: { endsAt: true } },
      },
    }),
    // Their next session (or the one happening now), with the Zoom link for online sessions.
    db.booking.findFirst({
      where: { userId: user.id, status: "CONFIRMED", recorded: false, endsAt: { gt: new Date() } },
      orderBy: { startsAt: "asc" },
      select: { startsAt: true, endsAt: true, mode: true, service: true, plan: { select: { title: true, meetingLink: true, completedAt: true } } },
    }),
  ]);
  const now = new Date();
  // Sessions left to book and nothing coming up: invite them to choose a time.
  const toBook = livePlans
    .map((p) => ({ ...p, left: Math.max(0, (p.totalSessions ?? 0) - p.bookings.length), next: p.bookings.some((b) => b.endsAt > now) }))
    .filter((p) => p.left > 0 && !p.next && p.sessionService?.published && !p.sessionService.enquiryOnly);
  const done = tasks.filter((t) => t.done).length;
  const firstName = user.name?.split(" ")[0];
  const nothing = !hasPlans && livePlans.length === 0 && courses.length === 0 && learning.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-stone-500">{formatDate(today, { weekday: "long", day: "numeric", month: "long" })}</p>
        <h1 className="font-serif text-3xl text-stone-800">
          {greeting(user.timezone)}
          {firstName ? `, ${firstName}` : ""}
        </h1>
      </div>

      {newAnswers > 0 && (
        <Link
          href="/portal/sessions#questions"
          className="flex items-center gap-3 rounded-2xl bg-sage-600 p-4 text-white transition hover:bg-sage-700"
        >
          <MessageCircleQuestion className="h-5 w-5 shrink-0" />
          <span className="flex-1">
            Rangika answered {newAnswers === 1 ? "your question" : `${newAnswers} of your questions`}.
          </span>
          <span className="text-sm opacity-90">Read →</span>
        </Link>
      )}

      {/* Nothing booked or bought yet (e.g. just signed up with Google): show what Rangika offers. */}
      {nothing && <ExploreServices firstName={firstName} />}

      {learning.map((p) => (
        <Link
          key={p.id}
          href={`/portal/courses/${p.id}`}
          className="block space-y-2 rounded-2xl bg-white p-5 ring-1 ring-stone-200 transition hover:ring-sage-300"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-serif text-lg text-stone-800">{p.title}</p>
            <span className="shrink-0 text-sm text-sage-700">{p.completedAt ? "Finished ✓" : p.done ? "Continue →" : "Start →"}</span>
          </div>
          <Progress value={p.total ? (p.done / p.total) * 100 : 0} className="h-2 bg-sage-100 [&>div]:bg-sage-500" />
          <p className="text-xs text-stone-500">
            {p.done} of {p.total} lessons done
          </p>
        </Link>
      ))}

      {nextSession && (() => {
        const tz = user.timezone;
        const s = nextSession;
        const day = s.startsAt.toLocaleDateString("en-AU", { timeZone: tz, weekday: "long", day: "numeric", month: "long" });
        const t = (d: Date) => d.toLocaleTimeString("en-AU", { timeZone: tz, hour: "numeric", minute: "2-digit" });
        const isToday = s.startsAt.toLocaleDateString("en-CA", { timeZone: tz }) === today;
        const soon = s.startsAt.getTime() - Date.now() <= 15 * 60_000; // starting within 15 minutes, or already on
        const online = s.mode === "DISTANCE";
        const zoom = online && !s.plan?.completedAt ? s.plan?.meetingLink : null;
        return (
          <section
            aria-label="Your next session"
            className={`flex flex-col gap-4 rounded-2xl p-5 ring-1 sm:flex-row sm:items-center ${soon ? "bg-sage-700 text-white ring-sage-700" : "bg-white ring-sage-200"}`}
          >
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${soon ? "bg-white/15 text-brand-gold" : "bg-sage-100 text-sage-700"}`}>
              {online ? <Video className="h-6 w-6" aria-hidden /> : <CalendarClock className="h-6 w-6" aria-hidden />}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-semibold uppercase tracking-wider ${soon ? "text-brand-gold" : "text-sage-700"}`}>
                {soon ? "Your session is starting" : isToday ? "Your session is today" : "Your next session"}
              </p>
              <p className={`mt-0.5 font-serif text-xl ${soon ? "text-white" : "text-stone-800"}`}>{s.plan?.title ?? s.service}</p>
              <p className={`text-sm ${soon ? "text-white/80" : "text-stone-600"}`}>
                {isToday ? "Today" : day}, {t(s.startsAt)} – {t(s.endsAt)} ·{" "}
                {online ? (
                  "Online on Zoom"
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" aria-hidden /> In person in Perth
                  </span>
                )}
              </p>
              {online && !zoom && <p className={`mt-1 text-xs ${soon ? "text-white/70" : "text-stone-500"}`}>Rangika will add your Zoom link here before the session.</p>}
            </div>
            {zoom && (
              <a
                href={zoom}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  soon ? "bg-brand-gold text-sage-900 hover:bg-gold-300 focus-visible:ring-brand-gold" : "bg-sage-600 text-white hover:bg-sage-700 focus-visible:ring-sage-500"
                }`}
              >
                <Video className="h-4 w-4" aria-hidden /> Click here to join Zoom session
              </a>
            )}
          </section>
        );
      })()}

      {toBook.map((p) => (
        <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-sage-200">
          <CalendarPlus className="h-5 w-5 shrink-0 text-sage-600" aria-hidden />
          <p className="min-w-0 flex-1 text-stone-700">
            You have <strong>{p.left}</strong> {p.title} session{p.left === 1 ? "" : "s"} left to book.
          </p>
          <Link href={`/portal/sessions/book?plan=${p.id}`} className="rounded-full bg-sage-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sage-700">
            Book a time
          </Link>
        </div>
      ))}

      {upcoming.map((u) => (
        <p key={u.title + u.startDate} className="rounded-2xl bg-sage-50 p-4 text-stone-700 ring-1 ring-sage-200">
          Your <strong>{u.title}</strong> work starts on <strong>{formatDate(u.startDate, { weekday: "long", day: "numeric", month: "long" })}</strong>. Your daily
          exercises, check-ins and journal prompts will appear here from then.
        </p>
      ))}

      {hasPlans && (
        <>
          <section className="space-y-3">
            <div className="flex items-end justify-between">
              <h2 className="font-serif text-xl text-stone-800">Today&apos;s tasks</h2>
              {tasks.length > 0 && (
                <span className="text-sm text-stone-500">
                  {done} of {tasks.length} done
                </span>
              )}
            </div>
            {tasks.length > 0 && <Progress value={(done / tasks.length) * 100} className="h-2 bg-sage-100 [&>div]:bg-sage-500" />}
            {tasks.length === 0 ? (
              <p className="rounded-2xl bg-white p-5 text-stone-500 ring-1 ring-stone-200">Nothing set for today. Enjoy a gentle day.</p>
            ) : (
              <TaskList
                tasks={tasks.map((t) => ({
                  id: t.id,
                  title: t.title,
                  instructions: t.instructions,
                  done: t.done,
                  context: t.module?.title ?? null,
                  resource: t.resource,
                }))}
                encourage={{ ...enc, enabled: user.voiceOn }}
              />
            )}
          </section>

          {trackers.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-serif text-xl text-stone-800">Today&apos;s check-in</h2>
              {trackers.map((t) => (
                <Link
                  key={t.id}
                  href={`/portal/trackers/${t.id}`}
                  className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-stone-200 transition hover:ring-sage-300"
                >
                  {t.done ? <CheckCircle2 className="h-6 w-6 text-sage-500" /> : <ClipboardList className="h-6 w-6 text-sage-600" />}
                  <span className="flex-1">
                    <span className="block font-medium text-stone-800">{t.title}</span>
                    <span className="text-sm text-stone-500">{t.done ? "Filled in today. Tap to change it." : "Tap to fill in today's answers"}</span>
                  </span>
                </Link>
              ))}
            </section>
          )}

          {tonightAudio && (
            <section className="space-y-3">
              <h2 className="font-serif text-xl text-stone-800">Your recording</h2>
              <AudioPlayer resourceId={tonightAudio.id} title={tonightAudio.title} nightToggle />
            </section>
          )}
        </>
      )}

      {courses.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-stone-800">My classes</h2>
          {courses.map((c) => {
            const total = c.course.modules.length;
            return (
              <Link
                key={c.enrollmentId}
                href={`/portal/classes/${c.course.id}`}
                className="block space-y-2 rounded-2xl bg-white p-4 ring-1 ring-stone-200 transition hover:ring-sage-300"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-sage-600" />
                  <span className="flex-1 font-medium text-stone-800">{c.course.title}</span>
                  {c.certificate && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                      <Award className="h-3.5 w-3.5" /> Certificate ready
                    </span>
                  )}
                </div>
                {total > 0 && (
                  <>
                    <Progress value={(c.modulesDone / total) * 100} className="h-1.5 bg-sage-100 [&>div]:bg-sage-500" />
                    <p className="text-xs text-stone-500">
                      {c.modulesDone} of {total} modules done · Continue →
                    </p>
                  </>
                )}
              </Link>
            );
          })}
        </section>
      )}

      <section className="rounded-2xl bg-sage-50 p-5">
        <div className="flex items-start gap-3">
          <NotebookPen className="mt-1 h-5 w-5 shrink-0 text-sage-600" />
          <div className="flex-1">
            <h2 className="font-serif text-lg text-stone-800">{prompt ? "Today's journal prompt" : "Your journal"}</h2>
            <p className="mt-1 text-stone-600">{prompt ?? "How are you feeling today? Write or record a short message."}</p>
            {newReplies > 0 && (
              <Link href="/portal/journal#past-entries" className="mt-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-sage-800 ring-1 ring-sage-300 hover:bg-sage-100">
                <span className="h-2 w-2 shrink-0 rounded-full bg-sage-600" aria-hidden />
                Rangika replied to your journal. Read it →
              </Link>
            )}
            <Link href="/portal/journal" className="mt-3 inline-flex rounded-full bg-sage-600 px-4 py-2 text-sm text-white hover:bg-sage-700">
              Write or speak
            </Link>
            {hasPlans && prompt && (
              <div className="mt-3">
                <AskQuestion topic={`Journal prompt: ${prompt}`} topicHref="/portal/journal" label="Question about this prompt?" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Clients who already have something: links to book or buy something else. */}
      {!nothing && <BookMore />}
    </div>
  );
}
