import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdminPage } from "@/lib/authz";
import { loadLibraryOptions, loadPlansForEditor } from "@/lib/admin-plans";
import { MaterialsEditor, ModulesEditor, PlanDetails, PromptsEditor, TasksEditor, TrackersEditor } from "@/components/admin/plan-editor";
import { DuplicateTemplateButton } from "@/components/admin/duplicate-template-button";

export default async function PackagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const [plans, library] = await Promise.all([loadPlansForEditor({ id, userId: null }), loadLibraryOptions()]);
  const plan = plans[0];
  if (!plan) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/sessions#packages" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
          <ArrowLeft className="h-4 w-4" /> Sessions
        </Link>
        <DuplicateTemplateButton id={plan.id} />
      </div>
      <p className="rounded-xl bg-sage-50 p-4 text-sm text-stone-600">
        This is a ready-made package. Changes here apply to clients you give it to <strong>from now on</strong>. Clients who already have it keep
        their own copy, which you can change on their page.
      </p>
      <section className="space-y-5 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
        <PlanDetails plan={plan} />
        <ModulesEditor plan={plan} />
        <MaterialsEditor plan={plan} library={library} />
        <TasksEditor plan={plan} library={library} />
        <TrackersEditor plan={plan} />
        <PromptsEditor plan={plan} />
      </section>
    </div>
  );
}
