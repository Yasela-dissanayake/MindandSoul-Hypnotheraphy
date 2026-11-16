import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";
import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { money } from "@/lib/learning";
import { getSettings } from "@/lib/settings";
import { Progress } from "@/components/ui/progress";
import { LearningCertificateUpload, NewPackageDialog } from "@/components/admin/learning-editor";
import { cn } from "@/lib/utils";

export default async function LearningAdminPage() {
  await requireAdminPage();
  const [packages, settings, sales] = await Promise.all([
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
  ]);
  const when = (d: Date) => d.toLocaleDateString("en-AU", { timeZone: settings.adminTimezone, day: "numeric", month: "short", year: "numeric" });
  const waiting = packages.flatMap((p) => p.enrollments.filter((e) => e.completedAt && !e.certificateKey).map((e) => ({ ...e, title: p.title })));

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-stone-800">Independent Learning Packages</h1>
          <p className="text-stone-500">
            Ready-made online courses people buy on the website and follow at their own pace. Their account is created automatically when they pay.
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
          <p className="rounded-xl bg-white p-5 text-stone-500 ring-1 ring-stone-200">No packages yet. Create one with &quot;New package&quot;.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {packages.map((p) => (
              <Link
                key={p.id}
                href={`/admin/learning/${p.id}`}
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
          <a href="/learn" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sage-700 hover:underline">
            /learn <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </p>
      </section>

      {packages
        .filter((p) => p.enrollments.length > 0)
        .map((p) => (
          <section key={p.id} className="space-y-3">
            <h2 className="font-serif text-xl text-stone-800">
              {p.title} Learners <span className="text-base text-stone-500">({p.enrollments.length})</span>
            </h2>
            <div className="divide-y divide-stone-100 rounded-2xl bg-white ring-1 ring-stone-200">
              {p.enrollments.map((e) => {
                const total = p._count.lessons;
                const done = Math.min(e._count.progress, total);
                return (
                  <div key={e.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Link href={`/admin/clients/${e.user.id}`} className="font-medium text-stone-800 hover:underline">
                        {e.user.name || e.user.email}
                      </Link>
                      <p className="text-xs text-stone-500">
                        {e.user.email} · started {when(e.startedAt)}
                        {e.completedAt ? ` · finished ${when(e.completedAt)}` : ""}
                      </p>
                      <Progress value={total ? (done / total) * 100 : 0} className="h-1.5 max-w-xs bg-sage-100 [&>div]:bg-sage-500" />
                      <p className="text-xs text-stone-500">
                        {done} of {total} lessons done
                      </p>
                    </div>
                    {e.completedAt ? (
                      <LearningCertificateUpload enrollmentId={e.id} hasCertificate={Boolean(e.certificateKey)} />
                    ) : (
                      <span className="text-sm text-stone-400">In progress</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

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
