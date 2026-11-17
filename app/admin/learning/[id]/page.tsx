import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { loadLibraryOptions } from "@/lib/admin-plans";
import { orderLessons } from "@/lib/learning";
import { LessonsEditor, PackageDetailsForm } from "@/components/admin/learning-editor";
import { CoverUpload } from "@/components/admin/cover-upload";
import { coverUrl } from "@/lib/covers";

export default async function LearningPackageAdminPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const [pkg, library] = await Promise.all([
    db.learningPackage.findUnique({
      where: { id },
      include: {
        sections: { orderBy: { order: "asc" } },
        lessons: { include: { resource: { select: { id: true, title: true, kind: true } } } },
        _count: { select: { enrollments: true } },
      },
    }),
    loadLibraryOptions(),
  ]);
  if (!pkg) notFound();
  const lessons = orderLessons(pkg.sections, pkg.lessons);

  return (
    <div className="space-y-6">
      <Link href="/admin/learning" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft className="h-4 w-4" /> Independent Learning
      </Link>
      <h1 className="font-serif text-3xl text-stone-800">{pkg.title}</h1>
      <PackageDetailsForm
        pkg={{
          id: pkg.id,
          slug: pkg.slug,
          title: pkg.title,
          summary: pkg.summary ?? "",
          description: pkg.description ?? "",
          price: pkg.price,
          published: pkg.published,
          archived: pkg.archived,
          lessons: pkg.lessons.length,
          learners: pkg._count.enrollments,
        }}
      />
      <section className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
        <CoverUpload kind="package" id={pkg.id} url={coverUrl("package", pkg)} />
      </section>
      <LessonsEditor
        packageId={pkg.id}
        sections={pkg.sections.map((s) => ({ id: s.id, title: s.title }))}
        lessons={lessons.map((l) => ({ id: l.id, title: l.title, body: l.body ?? "", sectionId: l.sectionId, resource: l.resource }))}
        library={library}
      />
    </div>
  );
}
