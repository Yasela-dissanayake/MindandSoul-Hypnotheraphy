import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, CheckCircle2, Download, Sparkles } from "lucide-react";
import { requireClientPage } from "@/lib/authz";
import { getStudentCourses } from "@/lib/material";
import { Progress } from "@/components/ui/progress";
import { ResourceItem } from "@/components/portal/resource-item";
import { ModuleCompleteButton } from "@/components/portal/module-complete-button";
import { cn } from "@/lib/utils";

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireClientPage();
  const { id } = await params;
  const c = (await getStudentCourses(user.id)).find((x) => x.course.id === id);
  if (!c) notFound(); // not enrolled: nothing to see

  const { course } = c;
  const total = course.modules.length;
  const main = course.items.filter((i) => !i.extra);
  const extras = course.items.filter((i) => i.extra).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const loose = main.filter((i) => !i.moduleId);
  const nextIdx = course.modules.findIndex((m) => !c.doneModules.has(m.id));

  return (
    <div className="space-y-6">
      <Link href="/portal/courses" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft className="h-4 w-4" /> My courses
      </Link>
      <div className="space-y-2">
        <h1 className="font-serif text-3xl text-stone-800">{course.title}</h1>
        {course.description && <p className="whitespace-pre-line text-stone-600">{course.description}</p>}
        {total > 0 && (
          <div className="space-y-1 pt-1">
            <Progress value={(c.modulesDone / total) * 100} className="h-2 bg-sage-100 [&>div]:bg-sage-500" />
            <p className="text-xs text-stone-500">
              {c.modulesDone} of {total} modules done
            </p>
          </div>
        )}
      </div>

      {c.certificate && (
        <section className="flex flex-wrap items-center gap-3 rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
          <Award className="h-8 w-8 text-amber-600" />
          <div className="flex-1">
            <p className="font-serif text-lg text-stone-800">Your certificate</p>
            <p className="text-sm text-stone-600">Congratulations on completing {course.title}.</p>
          </div>
          <a href={`/api/files/certificate/${c.enrollmentId}`} target="_blank" rel="noreferrer" className="rounded-full bg-sage-600 px-4 py-2 text-sm text-white hover:bg-sage-700">
            View
          </a>
          <a href={`/api/files/certificate/${c.enrollmentId}?download=1`} className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-stone-700 ring-1 ring-stone-300 hover:bg-white">
            <Download className="h-4 w-4" /> Download
          </a>
        </section>
      )}

      {course.modules.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-stone-800">Modules</h2>
          {course.modules.map((m, idx) => {
            const items = main.filter((i) => i.moduleId === m.id);
            const done = c.doneModules.has(m.id);
            return (
              <details key={m.id} open={idx === nextIdx} className={cn("rounded-2xl bg-white ring-1", done ? "ring-sage-200" : "ring-stone-200")}>
                <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-sage-500" />
                  ) : (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs text-stone-600">{idx + 1}</span>
                  )}
                  <span className="flex-1 font-medium text-stone-800">{m.title}</span>
                  <span className="text-xs text-stone-500">
                    {items.length} item{items.length === 1 ? "" : "s"}
                  </span>
                </summary>
                <div className="space-y-3 px-4 pb-4">
                  {m.description && <p className="whitespace-pre-line text-sm text-stone-600">{m.description}</p>}
                  {items.map((i) => (
                    <ResourceItem key={i.id} r={i.resource} note={i.note} />
                  ))}
                  {items.length === 0 && <p className="text-sm text-stone-500">Material for this module is coming soon.</p>}
                  <ModuleCompleteButton moduleId={m.id} done={done} />
                </div>
              </details>
            );
          })}
        </section>
      )}

      {loose.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-stone-800">{course.modules.length ? "Course material" : "Material"}</h2>
          {loose.map((i) => (
            <ResourceItem key={i.id} r={i.resource} note={i.note} />
          ))}
        </section>
      )}

      {extras.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-serif text-xl text-stone-800">
            <Sparkles className="h-5 w-5 text-sage-600" /> Extras
          </h2>
          <p className="-mt-2 text-sm text-stone-500">Bonus videos, meditations and recordings from Rangika.</p>
          {extras.map((i) => (
            <ResourceItem key={i.id} r={i.resource} note={i.note} />
          ))}
        </section>
      )}

      {course.items.length === 0 && total === 0 && (
        <p className="rounded-2xl bg-white p-6 text-stone-500 ring-1 ring-stone-200">Rangika is adding the course material. Check back soon.</p>
      )}
    </div>
  );
}
