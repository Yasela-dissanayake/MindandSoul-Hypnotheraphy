import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { coverUrl } from "@/lib/covers";
import { CoverUpload } from "@/components/admin/cover-upload";
import { SessionOptionsEditor, SessionServiceForm } from "@/components/admin/session-service-editor";

export default async function SessionServiceEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const s = await db.sessionService.findUnique({
    where: { id },
    include: {
      options: { orderBy: [{ order: "asc" }, { sessions: "asc" }], include: { _count: { select: { bookings: true } } } },
      _count: { select: { plans: true } },
    },
  });
  if (!s) notFound();
  const booked = s._count.plans > 0 || s.options.some((o) => o._count.bookings > 0);

  return (
    <div className="space-y-6">
      <Link href="/admin/sessions#services" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft className="h-4 w-4" /> Sessions
      </Link>
      <h1 className="font-serif text-3xl text-stone-800">{s.title}</h1>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
        <SessionOptionsEditor
          serviceId={s.id}
          options={s.options.map((o) => ({
            id: o.id,
            title: o.title,
            sessions: o.sessions,
            price: o.price,
            priceAed: o.priceAed,
            mode: o.mode,
            note: o.note ?? "",
            recorded: o.recorded,
          }))}
        />
      </section>
      <section className="space-y-5 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
        <SessionServiceForm
          service={{
            id: s.id,
            slug: s.slug,
            title: s.title,
            category: s.category,
            tagline: s.tagline ?? "",
            summary: s.summary ?? "",
            body: s.body ?? "",
            details: s.details ?? "",
            highlights: s.highlights ?? "",
            planService: s.planService ?? "HYPNOTHERAPY",
            minutes: s.minutes,
            lengthLabel: s.lengthLabel ?? "",
            inPerson: s.inPerson,
            online: s.online,
            enquiryOnly: s.enquiryOnly,
            published: s.published,
            canDelete: !booked,
          }}
        />
        <div className="border-t border-stone-100 pt-4">
          <CoverUpload kind="session" id={s.id} url={coverUrl("session", s)} />
        </div>
      </section>
    </div>
  );
}
