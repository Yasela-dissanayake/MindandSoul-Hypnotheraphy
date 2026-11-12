import Link from "next/link";
import { Award, GraduationCap } from "lucide-react";
import { requireClientPage } from "@/lib/authz";
import { getStudentCourses } from "@/lib/material";
import { Progress } from "@/components/ui/progress";

export default async function CoursesPage() {
  const user = await requireClientPage();
  const courses = await getStudentCourses(user.id);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-stone-800">My courses</h1>
      {courses.length === 0 && (
        <p className="rounded-2xl bg-white p-6 text-stone-500 ring-1 ring-stone-200">You&apos;re not enrolled in a course yet.</p>
      )}
      {courses.map((c) => {
        const total = c.course.modules.length;
        return (
          <Link
            key={c.enrollmentId}
            href={`/portal/courses/${c.course.id}`}
            className="block space-y-3 rounded-2xl bg-white p-5 ring-1 ring-stone-200 transition hover:ring-sage-300"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sage-50 text-sage-600">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h2 className="font-serif text-xl text-stone-800">{c.course.title}</h2>
                {c.course.description && <p className="text-sm text-stone-500">{c.course.description}</p>}
              </div>
            </div>
            {total > 0 && (
              <div className="space-y-1">
                <Progress value={(c.modulesDone / total) * 100} className="h-2 bg-sage-100 [&>div]:bg-sage-500" />
                <p className="text-xs text-stone-500">
                  {c.modulesDone} of {total} modules done
                </p>
              </div>
            )}
            {c.certificate && (
              <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-800">
                <Award className="h-4 w-4" /> Your certificate is ready
              </p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
