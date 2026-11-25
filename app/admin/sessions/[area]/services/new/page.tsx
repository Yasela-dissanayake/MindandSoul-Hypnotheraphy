import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdminPage } from "@/lib/authz";
import { SESSION_AREAS, areaHref, isSessionArea } from "@/lib/session-areas";
import { NewSessionServiceForm } from "@/components/admin/session-service-editor";

// A new one-to-one session (Clinical Hypnotherapy, or Reiki Energy Healing / Animal Reiki): the full form.
export default async function NewSessionServicePage({ params }: { params: Promise<{ area: string }> }) {
  await requireAdminPage();
  const { area } = await params;
  if (!isSessionArea(area)) notFound();
  const { label, categories } = SESSION_AREAS[area];
  return (
    <div className="space-y-6">
      <Link href={`${areaHref(area)}#services`} className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft className="h-4 w-4" /> {label}
      </Link>
      <div>
        <h1 className="font-serif text-3xl text-stone-800">New session</h1>
        <p className="text-stone-500">A one-to-one session in {label} that people can book on the website.</p>
      </div>
      <NewSessionServiceForm categories={categories as ("HYPNOTHERAPY" | "REIKI_HEALING" | "ANIMAL_REIKI")[]} />
    </div>
  );
}
