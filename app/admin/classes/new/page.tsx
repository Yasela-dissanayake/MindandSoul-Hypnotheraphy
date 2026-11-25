import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdminPage } from "@/lib/authz";
import { NewClassForm } from "@/components/admin/new-course-dialog";
import { db } from "@/lib/db";

// A new Reiki Training class: the full form (details, class days, photo, price, bundle). Modules and material come next.
export default async function NewClassPage() {
  await requireAdminPage();
  // Ordinary classes (not bundles) that a new bundle can include.
  const classOptions = await db.course.findMany({
    where: { archived: false, includes: { none: {} } },
    orderBy: [{ order: "asc" }, { title: "asc" }],
    select: { id: true, title: true },
  });
  return (
    <div className="space-y-6">
      <Link href="/admin/classes" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft className="h-4 w-4" /> Reiki Training
      </Link>
      <div>
        <h1 className="font-serif text-3xl text-stone-800">New class</h1>
        <p className="text-stone-500">A live Reiki or Animal Reiki training people enroll in on the website.</p>
      </div>
      <NewClassForm classOptions={classOptions} />
    </div>
  );
}
