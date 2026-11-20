import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Clock, Infinity as Always } from "lucide-react";
import { db } from "@/lib/db";
import { money } from "@/lib/learning";
import { coverUrl } from "@/lib/covers";
import { cn } from "@/lib/utils";
import { getActivePromotion, promotedFirst, promotionLink } from "@/lib/promotions";
import { OfferBadge, promotedCard } from "@/components/site/offer-badge";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <h1 className="font-serif text-4xl text-stone-800 md:text-5xl">Courses</h1>
          <p className="text-lg text-stone-600">
            Self-paced courses by Rangika. Learn at home, one lesson at a time, whenever it suits you.
          </p>
          <p className="text-sm text-stone-500">
            Looking for a class taught in person or live?{" "}
            <Link href="/classes" className="text-sage-700 underline">
              See classes
            </Link>
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2 text-sm text-stone-600">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-sage-600" /> At your own pace
            </span>
            <span className="flex items-center gap-1.5">
              <Always className="h-4 w-4 text-sage-600" /> Keep access to your course
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-sage-600" /> Certificate when you finish
            </span>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        {packages.length === 0 ? (
          <p className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center text-stone-600 ring-1 ring-stone-200">
            New courses are coming soon. Meanwhile, you can{" "}
            <Link href="/booking" className="text-sage-700 underline">
              book a session
            </Link>{" "}
            with Rangika.
          </p>
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
                  {promoted && <OfferBadge overlay free={free} />}
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
                        {p.price > 0 && <span className="text-xs text-stone-400 line-through">{money(p.price, p.currency)}</span>}
                      </span>
                    ) : (
                      <span className="font-semibold text-stone-800">{money(p.price, p.currency)}</span>
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
