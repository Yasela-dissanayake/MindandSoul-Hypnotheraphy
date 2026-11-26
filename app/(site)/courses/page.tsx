import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Globe, MessageCircle, Sparkles } from "lucide-react";
import { enquiryHref } from "@/lib/site-routes";
import { db } from "@/lib/db";

import { coverUrl } from "@/lib/covers";
import { cn } from "@/lib/utils";
import { discounted, getActivePromotion, promoDiscount, promotedFirst, promotionLink } from "@/lib/promotions";
import { OfferBadge, WasPrice, promotedCard } from "@/components/site/offer-badge";
import { classPrice, formatPrice, viewerCurrency } from "@/lib/currency";

export const metadata: Metadata = {
  title: "Courses · Mind & Soul Works",
  description: "Self-paced courses by Rangika. Learn at home, at your own pace, one lesson at a time.",
};
export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const [all, promo] = await Promise.all([
    db.learningPackage.findMany({
      where: { published: true, archived: false },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { lessons: true } } },
    }),
    getActivePromotion(),
  ]);
  // The running promotion's course is listed first, with an offer badge.
  const link = promo ? promotionLink(promo) : null;
  const promotedId = link?.kind === "course" ? link.id : null;
  const packages = promotedFirst(all, promotedId);
  // Prices in AED for visitors in the UAE (when a course has one), otherwise AUD.
  const currency = await viewerCurrency();
  const pct = link?.kind === "course" ? promoDiscount(promo) : 0;
  const priceOf = (p: { price: number; priceAed: number | null }, off = 0) => {
    const x = classPrice(p, currency);
    return formatPrice(discounted(x.amount, off), x.currency);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <h1 className="sr-only">Courses</h1>
      <section className="container mx-auto px-4 py-16 md:py-20">
        {packages.length === 0 ? (
          // No published courses yet: shown until Rangika publishes one, then the list appears by itself.
          <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl bg-white text-center shadow-sm ring-1 ring-sage-200">
            <div className="bg-gradient-to-br from-sage-100 via-sage-50 to-amber-50 px-6 py-10 md:py-12">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-sage-200">
                <Sparkles className="h-8 w-8 text-sage-600" aria-hidden />
              </span>
              <h2 className="mt-5 font-serif text-4xl text-stone-800 md:text-5xl">Coming Soon!</h2>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-sage-700">Self-Paced Recorded Hypnotherapy Journey</p>
            </div>
            <div className="space-y-6 px-6 py-8 md:px-10">
              <div className="space-y-3 text-stone-600">
                <p>
                  Our <strong className="font-medium text-stone-800">Self-Paced Recorded Hypnotherapy Journey</strong> is currently being prepared and will be available soon.
                </p>
                <p>Thank you for your patience and interest!</p>
                <p>In the meantime, you&apos;re welcome to explore our Live Online Sessions or send us an enquiry for more information.</p>
              </div>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/hypnotherapy" className="inline-flex items-center justify-center gap-2 rounded-full bg-sage-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-sage-700">
                  <Globe className="h-4 w-4" aria-hidden /> Explore Live Online Sessions
                </Link>
                <Link
                  href={enquiryHref("Self-Paced Recorded Hypnotherapy Journey")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-sage-300 px-6 py-2.5 text-sm font-medium text-sage-800 transition hover:bg-sage-50"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden /> Send us an enquiry
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
            {packages.map((p) => {
              const promoted = p.id === promotedId;
              const free = promoted && Boolean(promo?.free);
              return (
              <Link
                key={p.id}
                href={`/courses/${p.slug}`}
                className={cn(
                  "group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:shadow-md hover:ring-sage-300",
                  promoted && promotedCard,
                )}
              >
                <div className="relative">
                  {promoted && <OfferBadge overlay free={free} discount={pct} />}
                  {coverUrl("package", p) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverUrl("package", p)!} alt="" className="h-48 w-full object-cover" />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-gradient-to-br from-sage-100 to-sage-200">
                      <BookOpen className="h-10 w-10 text-sage-700" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h2 className="font-serif text-xl text-stone-800 group-hover:text-sage-800">{p.title}</h2>
                  {p.summary && <p className="text-sm text-stone-600">{p.summary}</p>}
                  <div className="mt-auto flex items-center justify-between pt-3 text-sm">
                    <span className="text-stone-500">
                      {p._count.lessons} lesson{p._count.lessons === 1 ? "" : "s"}
                    </span>
                    {free ? (
                      <span className="flex items-baseline gap-1.5">
                        <span className="font-semibold text-amber-700">Free</span>
                        {p.price > 0 && <span className="text-xs text-stone-400 line-through">{priceOf(p)}</span>}
                      </span>
                    ) : promoted && pct > 0 ? (
                      <span className="flex items-baseline gap-1.5">
                        <span className="font-semibold text-amber-700">{priceOf(p, pct)}</span>
                        <WasPrice className="text-xs">{priceOf(p)}</WasPrice>
                      </span>
                    ) : (
                      <span className="font-semibold text-stone-800">{priceOf(p)}</span>
                    )}
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
