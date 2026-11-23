import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Layers } from "lucide-react";
import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { loadCourseForEditor, loadLibraryOptions } from "@/lib/admin-plans";
import { CourseDetails, CourseMaterialEditor, CourseModulesEditor, CourseStudents, CourseWebsiteForm } from "@/components/admin/course-editor";
import { CoverUpload } from "@/components/admin/cover-upload";
import { MarkSeenButton } from "@/components/admin/mark-seen-button";
import { cn } from "@/lib/utils";
import { money } from "@/lib/learning";
import { viewerTimezone } from "@/lib/viewer-tz";

export default async function CourseAdminPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const tz = await viewerTimezone();
  const [course, library, enrollments, clients, sales, classOptions] = await Promise.all([
    loadCourseForEditor(id),
    loadLibraryOptions(),
    db.enrollment.findMany({
      where: { courseId: id },
      orderBy: [{ completedAt: "asc" }, { startedAt: "desc" }],
      include: { user: { select: { id: true, name: true, email: true } }, _count: { select: { progress: true } } },
    }),
    db.user.findMany({ where: { role: "CLIENT", status: { not: "FINISHED" } }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
    db.coursePurchase.findMany({ where: { courseId: id, status: "PAID" }, orderBy: { paidAt: "desc" }, take: 50 }),
    // For the "Bundle" choices in the website form.
    db.course.findMany({
      where: { archived: false },
      orderBy: [{ order: "asc" }, { title: "asc" }],
      select: { id: true, title: true, _count: { select: { includes: true } } },
    }),
  ]);
  if (!course) notFound();
  const enrolledIds = new Set(enrollments.map((e) => e.userId));
  const isBundle = course.includes.length > 0;

  return (
    <div className="space-y-6">
      <Link href="/admin/classes" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft className="h-4 w-4" /> All classes
      </Link>
      <section className="space-y-5 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
        <CourseDetails course={course} />
        {isBundle ? (
          // A bundle has no content or students of its own: buying it enrolls people in these classes.
          <div className="space-y-2 rounded-xl bg-sage-50 p-4 text-sm text-stone-700 ring-1 ring-sage-200">
            <p className="flex items-center gap-2 font-medium text-stone-800">
              <Layers className="h-4 w-4 text-sage-700" /> This is a bundle
            </p>
            <p>People who buy it are enrolled in each class below, and see that class&apos;s content and certificate. Add the content and manage students there.</p>
            <ul className="list-inside list-disc">
              {course.includes.map((c) => (
                <li key={c.id}>
                  <Link href={`/admin/classes/${c.id}`} className="text-sage-800 underline-offset-2 hover:underline">
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            {course.includedIn.length > 0 && (
              <p className="text-sm text-stone-500">
                Also sold in: {course.includedIn.map((b) => b.title).join(", ")}. Bundle buyers are enrolled here and see this content.
              </p>
            )}
            <CourseModulesEditor course={course} />
            <CourseMaterialEditor course={course} library={library} />
          </>
        )}
      </section>
      <section id="website" className="scroll-mt-6 space-y-5 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
        <CourseWebsiteForm course={course} classOptions={classOptions.map((c) => ({ id: c.id, title: c.title, isBundle: c._count.includes > 0 }))} />
        <CoverUpload kind="course" id={course.id} url={course.coverUrl} />
        {sales.length > 0 && (
          <div className="space-y-2 border-t border-stone-100 pt-4">
            <h3 className="font-medium text-stone-800">Paid on the website ({sales.length})</h3>
            <ul className="divide-y divide-stone-100 text-sm">
              {sales.map((p) => (
                <li key={p.id} className={cn("flex flex-wrap items-center justify-between gap-2 py-2", !p.seenAt && "-mx-2 rounded-lg bg-sage-50 px-2")}>
                  <span>
                    {!p.seenAt && <span className="mr-2 rounded bg-sage-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">New</span>}
                    <span className="text-stone-800">{p.name}</span>
                    <span className="text-stone-500">
                      {" "}
                      · {p.email}
                      {p.phone ? ` · ${p.phone}` : ""}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-stone-500">
                    {money(p.amount, p.currency)} · {p.paidAt?.toLocaleDateString("en-AU", { timeZone: tz, day: "numeric", month: "short", year: "numeric" })}
                    {!p.seenAt && <MarkSeenButton kind="courses" id={p.id} />}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      {!isBundle && (
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
      )}
    </div>
  );
}
