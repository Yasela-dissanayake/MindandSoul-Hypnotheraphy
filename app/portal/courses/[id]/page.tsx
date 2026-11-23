import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ArrowLeft, ArrowRight, Award, CheckCircle2, Download, Lock, PartyPopper } from "lucide-react";
import { requireClientPage } from "@/lib/authz";
import { getLearnerPackage } from "@/lib/learning";
import { Progress } from "@/components/ui/progress";
import { ResourceItem } from "@/components/portal/resource-item";
import { LessonDoneButton } from "@/components/portal/lesson-done-button";
import { cn } from "@/lib/utils";

export default async function LearningPackagePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ lesson?: string }> }) {
  const user = await requireClientPage();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const lp = await getLearnerPackage(user.id, id);
  if (!lp) {
    // Classes used to live at /portal/courses/<id>: send old links there (that page checks enrollment).
    if (await db.course.findUnique({ where: { id }, select: { id: true } })) redirect(`/portal/classes/${id}`);
    notFound(); // hasn't bought it: nothing to see
  }

  const { pkg, lessons, enrollment } = lp;
  const total = lessons.length;
  const finished = total > 0 && lp.doneCount === total;
  // Show the lesson asked for (if it's open), otherwise the next one to do (or the first).
  const asked = lessons.find((l) => l.id === sp.lesson && l.open);
  const current = asked ?? lessons.find((l) => l.id === lp.nextLessonId) ?? (finished && !sp.lesson ? null : lessons[0]) ?? null;
  const idx = current ? lessons.findIndex((l) => l.id === current.id) : -1;
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx >= 0 && idx < total - 1 ? lessons[idx + 1] : null;
  const sectionTitle = (sectionId: string | null) => pkg.sections.find((s) => s.id === sectionId)?.title;

  return (
    <div className="space-y-6">
      <Link href="/portal/courses" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft className="h-4 w-4" /> My courses
      </Link>

      <div className="space-y-2">
        <h1 className="font-serif text-3xl text-stone-800">{pkg.title}</h1>
        {total > 0 && (
          <div className="space-y-1">
            <Progress value={(lp.doneCount / total) * 100} className="h-2 bg-sage-100 [&>div]:bg-sage-500" />
            <p className="text-xs text-stone-500">
              {lp.doneCount} of {total} lessons done
            </p>
          </div>
        )}
      </div>

      {enrollment.certificateKey ? (
        <section className="flex flex-wrap items-center gap-3 rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
          <Award className="h-8 w-8 text-amber-600" />
          <div className="flex-1">
            <p className="font-serif text-lg text-stone-800">Your certificate</p>
            <p className="text-sm text-stone-600">Congratulations on completing {pkg.title}.</p>
          </div>
          <a href={`/api/files/learning-certificate/${enrollment.id}`} target="_blank" rel="noreferrer" className="rounded-full bg-sage-600 px-4 py-2 text-sm text-white hover:bg-sage-700">
            View
          </a>
          <a
            href={`/api/files/learning-certificate/${enrollment.id}?download=1`}
            className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-stone-700 ring-1 ring-stone-300 hover:bg-white"
          >
            <Download className="h-4 w-4" /> Download
          </a>
        </section>
      ) : finished ? (
        <section className="flex items-center gap-3 rounded-2xl bg-sage-50 p-5 ring-1 ring-sage-200">
          <PartyPopper className="h-8 w-8 text-sage-600" />
          <div>
            <p className="font-serif text-lg text-stone-800">You&apos;ve finished every lesson. Well done!</p>
            <p className="text-sm text-stone-600">Rangika will send your certificate. You&apos;ll get an email when it&apos;s ready.</p>
          </div>
        </section>
      ) : null}

      {total === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-stone-500 ring-1 ring-stone-200">The lessons are being prepared. Check back soon.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem] xl:gap-10">
          {/* The lesson */}
          {current ? (
            <article className="order-1 space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200 sm:p-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-stone-500">
                  Lesson {current.number} of {total}
                  {sectionTitle(current.sectionId) ? ` · ${sectionTitle(current.sectionId)}` : ""}
                </p>
                <h2 className="font-serif text-2xl text-stone-800">{current.title}</h2>
              </div>
              {current.body && <p className="whitespace-pre-line leading-relaxed text-stone-700">{current.body}</p>}
              {current.resource && <ResourceItem r={current.resource} />}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
                {prev ? (
                  <Link href={`/portal/courses/${pkg.id}?lesson=${prev.id}`} className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
                    <ArrowLeft className="h-4 w-4" /> Previous
                  </Link>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-3">
                  <LessonDoneButton packageId={pkg.id} lessonId={current.id} done={current.done} isLast={!next} />
                  {current.done && next && (
                    <Link href={`/portal/courses/${pkg.id}?lesson=${next.id}`} className="inline-flex items-center gap-1 text-sm text-sage-700 hover:underline">
                      Next lesson <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ) : (
            <div className="order-1" />
          )}

          {/* All lessons */}
          <nav className="order-2 space-y-3 self-start rounded-2xl bg-white p-4 ring-1 ring-stone-200" aria-label="Lessons">
            {[...pkg.sections.map((s) => ({ id: s.id as string | null, title: s.title })), { id: null, title: pkg.sections.length ? "More lessons" : "" }].map((s) => {
              const list = lessons.filter((l) => (s.id ? l.sectionId === s.id : !l.sectionId || !pkg.sections.some((x) => x.id === l.sectionId)));
              if (!list.length) return null;
              return (
                <div key={s.id ?? "none"} className="space-y-1">
                  {s.title && <p className="px-2 text-xs font-medium uppercase tracking-wide text-stone-500">{s.title}</p>}
                  {list.map((l) => {
                    const here = current?.id === l.id;
                    const row = (
                      <span
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2 py-2 text-sm",
                          here ? "bg-sage-50 font-medium text-sage-900" : l.open ? "text-stone-700 hover:bg-stone-50" : "text-stone-400",
                        )}
                      >
                        {l.done ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-sage-500" />
                        ) : l.open ? (
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[10px] text-stone-600">{l.number}</span>
                        ) : (
                          <Lock className="h-4 w-4 shrink-0" />
                        )}
                        <span className="min-w-0 flex-1 truncate">{l.title}</span>
                      </span>
                    );
                    return l.open ? (
                      <Link key={l.id} href={`/portal/courses/${pkg.id}?lesson=${l.id}`} aria-current={here ? "page" : undefined}>
                        {row}
                      </Link>
                    ) : (
                      <div key={l.id} title="Finish the lessons before this one to open it">
                        {row}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
