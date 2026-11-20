import Link from "next/link";
import { Gift, Megaphone, Pencil } from "lucide-react";
import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { coverUrl } from "@/lib/covers";
import { isRunning, linkText, promotionChoices, promotionInclude, shortDate, timeLeft } from "@/lib/promotion-admin";
import { Button } from "@/components/ui/button";
import { PromotionActions, PromotionForm } from "@/components/admin/promotion-editor";

// Admin → Promotion. One promotion runs at a time: it shows on the home page (pop-up + section)
// for its number of days. Past promotions are kept so they can be run again.

export default async function PromotionsPage() {
  await requireAdminPage();
  const [all, settings] = await Promise.all([
    db.promotion.findMany({ orderBy: { startsAt: "desc" }, include: promotionInclude }),
    getSettings(),
  ]);
  const tz = settings.adminTimezone;
  const now = new Date();
  const current = all.find((p) => isRunning(p, now)) ?? null;
  const past = all.filter((p) => p.id !== current?.id);
  const choices = current ? null : await promotionChoices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-stone-800">Promotion</h1>
        <p className="text-stone-500">
          A promotion shows on the home page as a pop-up and in its own section, for the number of days you choose. Only one runs at a time.
        </p>
      </div>

      {current ? (
        <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-sage-300">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-100 px-2.5 py-1 text-xs font-medium text-sage-800">
              <span className="h-2 w-2 rounded-full bg-sage-500" aria-hidden /> Showing now
            </span>
            {current.free && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                <Gift className="h-3.5 w-3.5" aria-hidden /> Free
              </span>
            )}
            <span className="text-sm text-stone-500">
              {shortDate(current.startsAt, tz)} – {shortDate(current.endsAt, tz)} · {timeLeft(current.endsAt, now)}
            </span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            {coverUrl("promotion", current) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl("promotion", current)!} alt="" className="h-28 w-full shrink-0 rounded-lg object-cover sm:w-44" />
            )}
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-serif text-xl text-stone-800">{current.title}</p>
              <p className="line-clamp-3 whitespace-pre-line text-sm text-stone-600">{current.content}</p>
              {linkText(current) && <p className="text-sm text-sage-700">Linked to {linkText(current)}</p>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
            <Button asChild size="sm" className="bg-sage-600 hover:bg-sage-700">
              <Link href={`/admin/promotions/${current.id}`}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
              </Link>
            </Button>
            <PromotionActions id={current.id} running title={current.title} />
            <Link href="/" target="_blank" className="ml-auto text-sm text-sage-700 underline">
              See it on the website
            </Link>
          </div>
        </section>
      ) : (
        <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
          <h2 className="flex items-center gap-2 font-serif text-xl text-stone-800">
            <Megaphone className="h-5 w-5 text-sage-600" aria-hidden /> New promotion
          </h2>
          <p className="text-sm text-stone-500">No promotion is showing at the moment. It starts showing on the website as soon as you create it.</p>
          <PromotionForm choices={choices!} />
        </section>
      )}

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-stone-800">Past promotions</h2>
          <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-stone-200">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Promotion</th>
                  <th className="px-4 py-3 font-medium">Shown</th>
                  <th className="px-4 py-3 font-medium">Linked to</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {past.map((p) => (
                  <tr key={p.id} className="align-top">
                    <td className="px-4 py-3">
                      <Link href={`/admin/promotions/${p.id}`} className="font-medium text-stone-800 hover:text-sage-700">
                        {p.title}
                      </Link>
                      {p.free && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Free</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-stone-600">
                      {shortDate(p.startsAt, tz)} – {shortDate(p.endsAt, tz)}
                      <span className="block text-xs text-stone-400">{p.days} day{p.days === 1 ? "" : "s"}</span>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{linkText(p) ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        {current ? (
                          <span className="text-xs text-stone-400">End the current one to run this again</span>
                        ) : (
                          <PromotionActions id={p.id} running={false} title={p.title} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
