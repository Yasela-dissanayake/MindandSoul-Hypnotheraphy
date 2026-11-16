import Link from "next/link";
import { Award, CheckCircle2, ClipboardList, GraduationCap, MessageCircleQuestion, NotebookPen } from "lucide-react";
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

export default async function TodayPage() {
  const user = await requireClientPage();
  const [{ today, tasks, trackers, prompt, tonightAudio, upcoming, hasPlans }, courses, enc, newAnswers, learning] = await Promise.all([
    getToday(user.id, user.timezone),
    getStudentCourses(user.id),
    getEncouragements(),
    db.question.count({ where: { userId: user.id, answeredAt: { not: null }, answerSeenAt: null } }),
    getLearnerPackages(user.id),
  ]);
  const done = tasks.filter((t) => t.done).length;
  const firstName = user.name?.split(" ")[0];
  const nothing = !hasPlans && courses.length === 0 && learning.length === 0;

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

      {nothing && (
        <div className="rounded-2xl bg-white p-6 text-center ring-1 ring-stone-200">
          <p className="font-serif text-lg text-stone-700">Rangika is getting your space ready.</p>
          <p className="mt-2 text-sm text-stone-500">Your sessions work or course material will appear here soon.</p>
        </div>
      )}

      {learning.map((p) => (
        <Link
          key={p.id}
          href={`/portal/learning/${p.id}`}
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
          <h2 className="font-serif text-xl text-stone-800">My courses</h2>
          {courses.map((c) => {
            const total = c.course.modules.length;
            return (
              <Link
                key={c.enrollmentId}
                href={`/portal/courses/${c.course.id}`}
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
    </div>
  );
}
