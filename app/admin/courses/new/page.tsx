import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdminPage } from "@/lib/authz";
import { NewPackageForm } from "@/components/admin/learning-editor";

// A new self-paced course: all its details at once, then lessons on the next page.
export default async function NewCoursePage() {
  await requireAdminPage();
  return (
    <div className="space-y-6">
      <Link href="/admin/courses" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft className="h-4 w-4" /> Courses
      </Link>
      <div>
        <h1 className="font-serif text-3xl text-stone-800">New course</h1>
        <p className="text-stone-500">A self-paced course people buy on the website and follow at their own pace.</p>
      </div>
      <NewPackageForm />
    </div>
  );
}
