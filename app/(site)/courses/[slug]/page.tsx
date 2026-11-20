import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Award, BookOpen, Lock, PlayCircle } from "lucide-react";
import { db } from "@/lib/db";
import { money, orderLessons } from "@/lib/learning";
import { BuyPackage } from "@/components/learn/buy-package";
import { coverUrl } from "@/lib/covers";
import { getActivePromotion, promotionLink } from "@/lib/promotions";
import { PromoNote } from "@/components/site/promo-note";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  return db.learningPackage.findFirst({
    where: { slug, published: true, archived: false },
    include: { sections: { orderBy: { order: "asc" } }, lessons: { select: { id: true, title: true, sectionId: true, order: true, createdAt: true } } },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const pkg = await load((await params).slug);
  return pkg ? { title: `${pkg.title} · Courses · Mind & Soul Works`, description: pkg.summary ?? undefined } : { title: "Course not found" };
}

export default async function LearnPackagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = await load(slug);
  if (!pkg) {
    // Classes used to live at /courses/<slug>: send old links there.
    if (await db.course.findUnique({ where: { slug }, select: { id: true } })) redirect(`/classes/${slug}`);
    notFound();
  }
  const lessons = orderLessons(pkg.sections, pkg.lessons);
  // The running promotion is about this course (and may make it free).
  const promo = await getActivePromotion();
  const promoLink = promo ? promotionLink(promo) : null;
  const promoted = Boolean(promo && promoLink?.kind === "course" && promoLink.id === pkg.id);
  const free = promoted && Boolean(promo?.free);
  const groups = [
    ...pkg.sections.map((s) => ({ title: s.title, lessons: lessons.filter((l) => l.sectionId === s.id) })),
    { title: pkg.sections.length ? "More lessons" : "", lessons: lessons.filter((l) => !l.sectionId || !pkg.sections.some((s) => s.id === l.sectionId)) },
  ].filter((g) => g.lessons.length);
  let n = 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <div className="container mx-auto max-w-7xl px-4 py-10 md:py-14">
        <Link href="/courses" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
          <ArrowLeft className="h-4 w-4" /> All courses
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_24rem] xl:gap-14">
          <div className="space-y-8">
            {coverUrl("package", pkg) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl("package", pkg)!} alt="" className="h-56 w-full rounded-2xl object-cover sm:h-80 lg:h-96" />
            )}
            <div className="space-y-3">
              <h1 className="font-serif text-4xl text-stone-800">{pkg.title}</h1>
              {pkg.summary && <p className="text-lg text-stone-600">{pkg.summary}</p>}
            </div>

            {pkg.description && (
              <section className="space-y-2">
                <h2 className="font-serif text-2xl text-stone-800">About this course</h2>
                <p className="whitespace-pre-line leading-relaxed text-stone-700">{pkg.description}</p>
              </section>
            )}

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-stone-800">What&apos;s inside</h2>
              <p className="text-sm text-stone-500">
                {lessons.length} lesson{lessons.length === 1 ? "" : "s"}. Each one opens when you finish the one before.
              </p>
              <div className="space-y-4">
                {groups.map((g) => (
                  <div key={g.title || "lessons"} className="rounded-2xl bg-white ring-1 ring-stone-200">
                    {g.title && <p className="border-b border-stone-100 px-4 py-3 font-medium text-stone-800">{g.title}</p>}
                    <ul className="divide-y divide-stone-100">
                      {g.lessons.map((l) => {
                        n += 1;
                        return (
                          <li key={l.id} className="flex items-center gap-3 px-4 py-3 text-sm text-stone-700">
                            {n === 1 ? <PlayCircle className="h-4 w-4 shrink-0 text-sage-600" /> : <Lock className="h-4 w-4 shrink-0 text-stone-400" />}
                            <span className="text-stone-400">{n}.</span> {l.title}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
              {promoted && promo && <PromoNote promo={promo} freeText="Get this course free of charge while the promotion runs. No card needed." />}
              {free ? (
                <p className="flex items-baseline gap-2 font-serif text-3xl text-amber-700">
                  Free {pkg.price > 0 && <span className="font-sans text-base text-stone-400 line-through">{money(pkg.price, pkg.currency)}</span>}
                </p>
              ) : (
                <p className="font-serif text-3xl text-stone-800">{money(pkg.price, pkg.currency)}</p>
              )}
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-sage-600" /> {lessons.length} lessons, at your own pace
                </li>
                <li className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-sage-600" /> Certificate from Rangika when you finish
                </li>
              </ul>
              <BuyPackage packageId={pkg.id} title={pkg.title} priceLabel={money(pkg.price, pkg.currency)} free={free} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
