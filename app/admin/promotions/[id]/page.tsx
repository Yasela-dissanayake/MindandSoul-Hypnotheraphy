import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { coverUrl } from "@/lib/covers";
import { isRunning, linkValue, promotionChoices, promotionInclude, shortDate, timeLeft } from "@/lib/promotion-admin";
import { CoverUpload } from "@/components/admin/cover-upload";
import { PromotionActions, PromotionForm } from "@/components/admin/promotion-editor";

export default async function PromotionEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const [p, choices, settings] = await Promise.all([
    db.promotion.findUnique({ where: { id }, include: promotionInclude }),
    promotionChoices(),
    getSettings(),
  ]);
  if (!p) notFound();
  const tz = settings.adminTimezone;
  const running = isRunning(p);

  return (
    <div className="space-y-6">
      <Link href="/admin/promotions" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft className="h-4 w-4" /> Promotion
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-stone-800">{p.title}</h1>
          <p className="text-sm text-stone-500">
            {running ? (
              <>
                <span className="font-medium text-sage-700">Showing now</span> · until {shortDate(p.endsAt, tz)} ({timeLeft(p.endsAt)})
              </>
            ) : (
              <>
                Not showing · last shown {shortDate(p.startsAt, tz)} – {shortDate(p.endsAt, tz)}
              </>
            )}
          </p>
        </div>
        <PromotionActions id={p.id} running={running} title={p.title} afterDelete="/admin/promotions" />
      </div>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
        <CoverUpload kind="promotion" id={p.id} url={coverUrl("promotion", p)} />
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
        <PromotionForm
          id={p.id}
          choices={choices}
          initial={{ title: p.title, content: p.content, days: p.days, link: linkValue(p), free: p.free }}
        />
        {running && <p className="mt-3 text-xs text-stone-500">Changing the number of days moves the end date, counted from {shortDate(p.startsAt, tz)}.</p>}
      </section>
    </div>
  );
}
