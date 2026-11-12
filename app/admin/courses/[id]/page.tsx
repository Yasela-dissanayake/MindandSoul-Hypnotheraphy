import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { loadCourseForEditor, loadLibraryOptions } from "@/lib/admin-plans";
import { CourseDetails, CourseMaterialEditor, CourseModulesEditor, CourseStudents } from "@/components/admin/course-editor";

export default async function CourseAdminPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const [course, library, enrollments, clients] = await Promise.all([
    loadCourseForEditor(id),
    loadLibraryOptions(),
    db.enrollment.findMany({
      where: { courseId: id },
      orderBy: [{ completedAt: "asc" }, { startedAt: "desc" }],
      include: { user: { select: { id: true, name: true, email: true } }, _count: { select: { progress: true } } },
    }),
    db.user.findMany({ where: { role: "CLIENT", status: { not: "FINISHED" } }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
  ]);
  if (!course) notFound();
  const enrolledIds = new Set(enrollments.map((e) => e.userId));

  return (
    <div className="space-y-6">
      <Link href="/admin/courses" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft className="h-4 w-4" /> All courses
      </Link>
      <section className="space-y-5 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
        <CourseDetails course={course} />
        <CourseModulesEditor course={course} />
        <CourseMaterialEditor course={course} library={library} />
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
        <CourseStudents
          courseId={id}
          totalModules={course.modules.length}
          students={enrollments.map((e) => ({
            enrollmentId: e.id,
            userId: e.user.id,
            name: e.user.name || e.user.email,
            email: e.user.email,
            modulesDone: e._count.progress,
            completed: Boolean(e.completedAt),
            hasCertificate: Boolean(e.certificateKey),
            startedAt: e.startedAt.toISOString(),
          }))}
          candidates={clients.filter((c) => !enrolledIds.has(c.id)).map((c) => ({ id: c.id, name: `${c.name || c.email} (${c.email})` }))}
        />
      </section>
    </div>
  );
}
