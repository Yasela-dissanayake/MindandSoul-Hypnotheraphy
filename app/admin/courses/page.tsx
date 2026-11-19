import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";
import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { money } from "@/lib/learning";
import { getSettings } from "@/lib/settings";
import { Progress } from "@/components/ui/progress";
import { LearningCertificateUpload, NewPackageDialog } from "@/components/admin/learning-editor";
import { cn } from "@/lib/utils";
import { viewerTimezone } from "@/lib/viewer-tz";
import { ClientSessionFilter } from "@/components/admin/client-session-filter";

export default async function LearningAdminPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const tz = await viewerTimezone();
  await requireAdminPage();
  const [packages, settings, sales, sp] = await Promise.all([
    db.learningPackage.findMany({
      orderBy: [{ archived: "asc" }, { order: "asc" }, { createdAt: "asc" }],
      include: {
        _count: { select: { lessons: true } },
        enrollments: {
          orderBy: { startedAt: "desc" },
          include: { user: { select: { id: true, name: true, email: true } }, _count: { select: { progress: true } } },
        },
      },
    }),
    getSettings(),
    db.packagePurchase.findMany({ where: { status: "PAID" }, orderBy: { paidAt: "desc" }, take: 10, include: { package: { select: { title: true } } } }),
    searchParams,
  ]);
  const when = (d: Date) => d.toLocaleDateString("en-AU", { timeZone: tz, day: "numeric", month: "short", year: "numeric" });
  const waiting = packages.flatMap((p) => p.enrollments.filter((e) => e.completedAt && !e.certificateKey).map((e) => ({ ...e, title: p.title })));

  // Learners table: everyone who has a course, filterable by course (every course is in the filter,
  // so a new course appears there by itself).
  const all = packages.flatMap((p) => p.enrollments.map((e) => ({ e, p })));
  const filterOptions = [
    { value: "", label: "All courses", count: all.length },
    ...packages.map((p) => ({ value: p.id, label: p.title, count: p.enrollments.length })),
  ];
  const filter = filterOptions.some((o) => o.value === sp.course) ? (sp.course as string) : "";
  const rows = filter ? all.filter((r) => r.p.id === filter) : all;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-stone-800">Courses</h1>
          <p className="text-stone-500">
            Self-paced courses people buy on the website and follow at their own pace. Their account is created automatically when they pay.
          </p>
        </div>
        <NewPackageDialog />
      </div>

      {waiting.length > 0 && (
        <section id="finished" className="scroll-mt-6 space-y-3 rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
          <h2 className="font-serif text-xl text-amber-950">Waiting for a certificate ({waiting.length})</h2>
          {waiting.map((e) => (
            <div key={e.id} className="flex flex-col gap-2 rounded-xl bg-white p-3 ring-1 ring-amber-100 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href={`/admin/clients/${e.user.id}`} className="font-medium text-stone-800 hover:underline">
                  {e.user.name || e.user.email}
                </Link>
                <p className="text-sm text-stone-500">
                  Finished {e.title} on {when(e.completedAt!)}
                </p>
              </div>
              <LearningCertificateUpload enrollmentId={e.id} hasCertificate={false} />
            </div>
          ))}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-stone-800">Packages</h2>
        {packages.length === 0 ? (
          <p className="rounded-xl bg-white p-5 text-stone-500 ring-1 ring-stone-200">No courses yet. Create one with &quot;New course&quot;.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {packages.map((p) => (
              <Link
                key={p.id}
                href={`/admin/courses/${p.id}`}
                className={cn("flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-stone-200 transition hover:ring-sage-300", p.archived && "opacity-60")}
              >
                <span className="rounded-xl bg-sage-50 p-2.5 text-sage-700">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-stone-800">{p.title}</p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        p.archived ? "bg-stone-100 text-stone-600" : p.published ? "bg-sage-100 text-sage-800" : "bg-amber-100 text-amber-900",
                      )}
                    >
                      {p.archived ? "Archived" : p.published ? "On the website" : "Draft"}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500">
                    {money(p.price, p.currency)} · {p._count.lessons} lesson{p._count.lessons === 1 ? "" : "s"} · {p.enrollments.length} learner
                    {p.enrollments.length === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
        <p className="flex items-center gap-1 text-sm text-stone-500">
          Visitors see published packages at{" "}
          <a href="/courses" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sage-700 hover:underline">
            /courses <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </p>
      </section>

      <section id="learners" className="scroll-mt-6 space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-serif text-xl text-stone-800">
            Learners <span className="text-base text-stone-500">({rows.length})</span>
          </h2>
          <ClientSessionFilter options={filterOptions} current={filter} label="Course" param="course" anchor="learners" />
        </div>
        {rows.length === 0 ? (
          <p className="rounded-xl bg-white p-5 text-sm text-stone-500 ring-1 ring-stone-200">
            {filter ? "No one has this course yet." : "No learners yet. They appear here when someone buys a course."}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-stone-200">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Learner</th>
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Started</th>
                  <th className="w-48 px-4 py-3 font-medium">Progress</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ e, p }) => {
                  const total = p._count.lessons;
                  const done = Math.min(e._count.progress, total);
                  return (
                    <tr key={e.id} className="border-b border-stone-100 align-top last:border-0 hover:bg-stone-50">
                      <td className="px-4 py-3">
                        <Link href={`/admin/clients/${e.user.id}`} className="font-medium text-stone-800 hover:underline">
                          {e.user.name || e.user.email}
                        </Link>
                        {e.user.name && <span className="block text-xs text-stone-500">{e.user.email}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/courses/${p.id}`} className="text-stone-700 hover:underline">
                          {p.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-stone-600">{when(e.startedAt)}</td>
                      <td className="px-4 py-3">
                        <Progress value={total ? (done / total) * 100 : 0} className="h-1.5 bg-sage-100 [&>div]:bg-sage-500" />
                        <p className="mt-1 text-xs text-stone-600">
                          {done} of {total} lesson{total === 1 ? "" : "s"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {e.completedAt ? (
                          <div className="space-y-1">
                            <p className="text-xs text-stone-500">Finished {when(e.completedAt)}</p>
                            <LearningCertificateUpload enrollmentId={e.id} hasCertificate={Boolean(e.certificateKey)} />
                          </div>
                        ) : (
                          <span className="text-stone-500">In progress</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {sales.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-stone-800">Recent sales</h2>
          <div className="divide-y divide-stone-100 rounded-2xl bg-white text-sm ring-1 ring-stone-200">
            {sales.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <span>
                  <span className="font-medium text-stone-800">{s.name}</span> <span className="text-stone-500">({s.email})</span> bought {s.package.title}
                </span>
                <span className="text-stone-500">
                  {money(s.amount, s.currency)} · {when(s.paidAt ?? s.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
