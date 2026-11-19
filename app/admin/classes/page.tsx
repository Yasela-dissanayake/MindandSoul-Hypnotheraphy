import Link from "next/link";
import { Award, GraduationCap, Layers } from "lucide-react";
import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { loadAccessOptions } from "@/lib/admin-data";
import { SITE_URL } from "@/lib/mail";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AddPersonDialog } from "@/components/admin/add-person-dialog";
import { EnrolExistingPerson } from "@/components/admin/enrol-existing-person";
import { NewCourseDialog } from "@/components/admin/new-course-dialog";
import { StatusBadge } from "@/components/admin/status-badge";
import { viewerTimezone } from "@/lib/viewer-tz";
import { formatPrice } from "@/lib/currency";
import { newPurchaseWhere } from "@/lib/sales";
import { MarkSeenButton } from "@/components/admin/mark-seen-button";
import { cn } from "@/lib/utils";
import { ClientSessionFilter } from "@/components/admin/client-session-filter";

// Courses, student by student (same layout as the Sessions page):
// who is studying which course and how far they are, then the shared course content at the bottom.

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ class?: string }> }) {
  const tz = await viewerTimezone();
  await requireAdminPage();
  const [courses, { packages, courses: courseOptions }, settings, everyone, newSales, sp] = await Promise.all([
    db.course.findMany({
      orderBy: [{ archived: "asc" }, { order: "asc" }, { title: "asc" }],
      include: {
        _count: { select: { modules: true, items: true } },
        includes: { select: { title: true }, orderBy: { order: "asc" } },
        enrollments: {
          where: { user: { status: { not: "FINISHED" } } },
          orderBy: { startedAt: "desc" },
          include: {
            user: { select: { id: true, name: true, email: true, status: true, lastActiveAt: true } },
            _count: { select: { progress: true } },
          },
        },
      },
    }),
    loadAccessOptions(),
    getSettings(),
    db.user.findMany({ where: { role: "CLIENT", status: { not: "FINISHED" } }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
    db.coursePurchase.findMany({
      where: newPurchaseWhere,
      orderBy: { paidAt: "desc" },
      select: { id: true, name: true, userId: true, courseId: true, paidAt: true, course: { select: { title: true } } },
    }),
    searchParams,
  ]);
  // Students who enrolled on the website and Rangika hasn't seen yet.
  const isNewStudent = (courseId: string, userId: string) => newSales.some((s) => s.courseId === courseId && s.userId === userId);
  const newPerCourse = (courseId: string) => newSales.filter((s) => s.courseId === courseId).length;

  const lastActive = (d: Date | null) => (d ? d.toLocaleDateString("en-AU", { timeZone: tz, day: "numeric", month: "short" }) : "not yet");
  const date = (d: Date) => d.toLocaleDateString("en-AU", { timeZone: tz, day: "numeric", month: "short", year: "numeric" });
  // Bundles have no students of their own (buyers are enrolled in the bundle's classes), so no student table for them.
  const shown = courses.filter((c) => !c.archived && c.includes.length === 0);
  const finished = courses.flatMap((c) => c.enrollments.filter((e) => e.completedAt).map((e) => ({ ...e, courseTitle: c.title })));
  const needCertificate = finished.filter((e) => !e.certificateKey).length;

  // Students table: everyone currently on a class, filterable by class (every class is in the filter,
  // so a new class appears there by itself).
  const current = shown.flatMap((c) => c.enrollments.filter((e) => !e.completedAt).map((e) => ({ e, c })));
  const filterOptions = [
    { value: "", label: "All classes", count: current.length },
    ...shown.map((c) => ({ value: c.id, label: c.title, count: current.filter((r) => r.c.id === c.id).length })),
  ];
  const filter = filterOptions.some((o) => o.value === sp.class) ? (sp.class as string) : "";
  const rows = filter ? current.filter((r) => r.c.id === filter) : current;

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-stone-800">Classes</h1>
            <p className="text-stone-500">Your students. Open a student to see their progress, mark a class complete and add their certificate.</p>
          </div>
          <AddPersonDialog packages={packages} courses={courseOptions} siteUrl={SITE_URL} />
        </div>
        <EnrolExistingPerson people={everyone.map((u) => ({ id: u.id, name: u.name ? `${u.name} (${u.email})` : u.email }))} courses={courseOptions} />
      </div>

      {newSales.length > 0 && (
        <div className="space-y-2 rounded-xl bg-sage-50 p-4 ring-1 ring-sage-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-stone-800">
              {newSales.length} new enrolment{newSales.length === 1 ? "" : "s"} from the website
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/bookings?tab=courses" className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-sage-800 hover:bg-sage-100">
                See details →
              </Link>
              <MarkSeenButton kind="courses" />
            </div>
          </div>
          <ul className="space-y-1 text-sm text-stone-700">
            {newSales.map((s) => (
              <li key={s.id}>
                {s.userId ? (
                  <Link href={`/admin/clients/${s.userId}?tab=courses`} className="font-medium underline-offset-2 hover:underline">
                    {s.name}
                  </Link>
                ) : (
                  <strong>{s.name}</strong>
                )}{" "}
                enrolled on <strong>{s.course.title}</strong>
                {s.paidAt && <span className="text-stone-500"> · {date(s.paidAt)}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {needCertificate > 0 && (
        <a href="#finished" className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200 hover:bg-amber-100">
          <span className="text-amber-900">
            <strong>{needCertificate}</strong> finished student{needCertificate === 1 ? " is" : "s are"} waiting for a certificate.
          </span>
          <span className="text-sm font-medium text-amber-900">See →</span>
        </a>
      )}

      <section id="content" className="scroll-mt-6 space-y-3 border-b border-stone-200 pb-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl text-stone-800">Class content</h2>
            <p className="text-sm text-stone-500">
              Upload each class once. Every enrolled student sees it, including anything you add later. Open a class to set its price and put it on the website.
            </p>
          </div>
          <NewCourseDialog />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {courses.map((c) => {
            const active = c.enrollments.filter((e) => !e.completedAt).length;
            return (
              <Link key={c.id} href={`/admin/classes/${c.id}`} className="flex items-start gap-3 rounded-xl bg-white p-4 ring-1 ring-stone-200 transition hover:ring-sage-300">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage-50 text-sage-600">
                  {c.includes.length ? <Layers className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-stone-800">{c.title}</p>
                    {newPerCourse(c.id) > 0 && (
                      <span className="rounded bg-sage-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{newPerCourse(c.id)} new</span>
                    )}
                    {c.archived && <Badge variant="secondary">Hidden</Badge>}
                    {c.published && !c.archived ? (
                      <Badge className="bg-sage-100 font-normal text-sage-800 hover:bg-sage-100">
                        On website · {formatPrice(c.price, "aud")}
                        {c.priceAed ? ` / ${formatPrice(c.priceAed, "aed")}` : ""}
                        {c.seats !== null ? ` · ${c.seats} place${c.seats === 1 ? "" : "s"} left` : ""}
                      </Badge>
                    ) : (
                      !c.archived && (
                        <Badge variant="outline" className="font-normal text-stone-500">
                          Not on website
                        </Badge>
                      )
                    )}
                  </div>
                  {c.includes.length ? (
                    <p className="text-xs text-stone-500">Bundle: enrols buyers in {c.includes.map((x) => x.title).join(" + ")}</p>
                  ) : (
                    <p className="text-xs text-stone-500">
                      {c._count.modules} module{c._count.modules === 1 ? "" : "s"} · {c._count.items} item{c._count.items === 1 ? "" : "s"} · {active} current student
                      {active === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="students" className="scroll-mt-6 space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-serif text-2xl text-stone-800">
            Students <span className="text-base text-stone-500">({rows.length})</span>
          </h2>
          <ClientSessionFilter options={filterOptions} current={filter} label="Class" param="class" anchor="students" />
        </div>
        {rows.length === 0 ? (
          <p className="rounded-xl bg-white p-5 text-sm text-stone-500 ring-1 ring-stone-200">
            {filter ? "No students in this class right now." : "No students yet. They appear here when someone enrols on the website, or when you add them."}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-stone-200">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Class</th>
                  <th className="px-4 py-3 font-medium">Started</th>
                  <th className="w-48 px-4 py-3 font-medium">Progress</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Last active</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ e, c }) => {
                  const total = c._count.modules;
                  const done = Math.min(e._count.progress, total);
                  const allDone = total > 0 && done >= total;
                  const fresh = isNewStudent(c.id, e.user.id);
                  return (
                    // The whole row opens the student (the name link stretches over it). New website enrolments are tinted.
                    <tr key={e.id} className={cn("relative border-b border-stone-100 align-top last:border-0", fresh ? "bg-sage-50 hover:bg-sage-100" : "hover:bg-stone-50")}>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          {fresh && <span className="rounded bg-sage-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">New</span>}
                          <Link href={`/admin/clients/${e.user.id}?tab=courses`} className="font-medium text-stone-800 after:absolute after:inset-0 hover:underline">
                            {e.user.name || e.user.email}
                          </Link>
                        </span>
                        {e.user.name && <span className="block text-xs text-stone-500">{e.user.email}</span>}
                        <StatusBadge status={e.user.status} />
                      </td>
                      <td className="relative z-10 px-4 py-3">
                        <Link href={`/admin/classes/${c.id}`} className="text-stone-700 hover:underline">
                          {c.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-stone-600">{date(e.startedAt)}</td>
                      <td className="px-4 py-3">
                        {total > 0 ? (
                          <div className="space-y-1">
                            <Progress value={(done / total) * 100} className="h-1.5 bg-sage-100 [&>div]:bg-sage-500" />
                            <p className="text-xs text-stone-600">
                              {done} of {total} module{total === 1 ? "" : "s"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-700">No modules yet</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {allDone || e.certificateKey ? (
                          <div className="flex flex-wrap gap-1.5">
                            {allDone && <Badge className="bg-sage-600 hover:bg-sage-600">All done: mark complete?</Badge>}
                            {e.certificateKey && (
                              <Badge variant="outline" className="gap-1 font-normal">
                                <Award className="h-3 w-3" /> Certificate added
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-stone-500">In progress</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-stone-600">{lastActive(e.user.lastActiveAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {finished.length > 0 && (
        <details id="finished" className="scroll-mt-6 rounded-xl bg-white p-4 ring-1 ring-stone-200" open={needCertificate > 0}>
          <summary className="cursor-pointer text-sm font-medium text-stone-700">Finished classes ({finished.length})</summary>
          <ul className="mt-3 divide-y divide-stone-100 text-sm">
            {finished.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <Link href={`/admin/clients/${e.user.id}?tab=courses`} className="hover:underline">
                  <span className="text-stone-800">{e.user.name || e.user.email}</span>
                  <span className="text-stone-500"> · {e.courseTitle}</span>
                </Link>
                {e.certificateKey ? (
                  <span className="inline-flex items-center gap-1 text-xs text-sage-700">
                    <Award className="h-3.5 w-3.5" /> Certificate added
                  </span>
                ) : (
                  <span className="text-xs font-medium text-amber-700">Needs certificate</span>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}

    </div>
  );
}
