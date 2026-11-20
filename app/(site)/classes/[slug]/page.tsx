import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Award, BadgeCheck, BookOpen, CalendarDays, CheckCircle, Info, Layers, MonitorPlay, Users } from "lucide-react";
import { db } from "@/lib/db";
import { onSaleWhere } from "@/lib/course-sales";
import { BuyPackage } from "@/components/learn/buy-package";
import { coverUrl } from "@/lib/covers";
import { classPrice, formatPrice, viewerCurrency } from "@/lib/currency";
import { bundleSaving, highlightLines } from "@/lib/class-display";
import { CurrencySwitch } from "@/components/site/currency-switch";
import { getActivePromotion, promotionLink, freeOptionOf } from "@/lib/promotions";
import { PromoNote } from "@/components/site/promo-note";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  return db.course.findFirst({
    where: { ...onSaleWhere, slug },
    include: {
      modules: { orderBy: [{ order: "asc" }, { title: "asc" }], select: { id: true, title: true, description: true } },
      includes: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, summary: true, slug: true, published: true, archived: true, price: true, priceAed: true },
      },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = await load((await params).slug);
  return c ? { title: `${c.title} · Classes · Heal With Rangika`, description: c.summary ?? undefined } : { title: "Class not found" };
}

export default async function ClassPage({ params }: { params: Promise<{ slug: string }> }) {
  const [c, currency, promo] = await Promise.all([params.then((p) => load(p.slug)), viewerCurrency(), getActivePromotion()]);
  if (!c) notFound();
  const about = c.details || c.description;
  const full = c.seats !== null && c.seats <= 0;
  const price = classPrice(c, currency);
  const priceLabel = formatPrice(price.amount, price.currency);
  const saving = bundleSaving(c, currency);
  const highlights = highlightLines(c.highlights);
  const cover = coverUrl("course", c);
  const isBundle = c.includes.length > 0;
  // The running promotion is about this class (and may make it free).
  const promoLink = promo ? promotionLink(promo) : null;
  const promoted = Boolean(promo && promoLink?.kind === "class" && promoLink.id === c.id);
  const free = promoted && Boolean(promo?.free);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <div className="container mx-auto max-w-7xl px-4 py-10 md:py-14">
        <Link href="/classes" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
          <ArrowLeft className="h-4 w-4" /> All classes
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_24rem] xl:gap-14">
          <div className="min-w-0 space-y-8">
            {cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="h-56 w-full rounded-2xl object-cover sm:h-80 lg:h-96" />
            )}
            <div className="space-y-3">
              {isBundle && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sage-100 px-2.5 py-1 text-xs font-medium text-sage-800">
                  <Layers className="h-3.5 w-3.5" /> Bundle
                </span>
              )}
              <h1 className="font-serif text-4xl text-stone-800">{c.title}</h1>
              {c.summary && <p className="text-lg text-stone-600">{c.summary}</p>}
            </div>

            {c.prerequisite && (
              <div className="flex gap-3 rounded-xl bg-sage-50 p-4 text-sm text-stone-700 ring-1 ring-sage-200">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-sage-700" />
                <p>
                  <span className="font-medium text-stone-800">Before you join:</span> this class is for students who have completed {c.prerequisite}{" "}
                  (with Rangika or another Reiki teacher).
                </p>
              </div>
            )}

            {about && (
              <section className="space-y-2">
                <h2 className="font-serif text-2xl text-stone-800">About this class</h2>
                <p className="whitespace-pre-line leading-relaxed text-stone-700">{about}</p>
              </section>
            )}

            {isBundle && (
              <section className="space-y-3">
                <h2 className="font-serif text-2xl text-stone-800">Included in this bundle</h2>
                <ul className="divide-y divide-stone-100 rounded-2xl bg-white ring-1 ring-stone-200">
                  {c.includes.map((x) => {
                    const p = classPrice(x, currency);
                    const linkable = x.slug && x.published && !x.archived;
                    return (
                      <li key={x.id} className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
                        <div className="flex gap-3">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" />
                          <div>
                            {linkable ? (
                              <Link href={`/classes/${x.slug}`} className="font-medium text-stone-800 hover:underline">
                                {x.title}
                              </Link>
                            ) : (
                              <p className="font-medium text-stone-800">{x.title}</p>
                            )}
                            {x.summary && <p className="text-stone-500">{x.summary}</p>}
                          </div>
                        </div>
                        <span className="shrink-0 text-stone-500 line-through decoration-stone-300">{formatPrice(p.amount, p.currency)}</span>
                      </li>
                    );
                  })}
                </ul>
                <p className="text-sm text-stone-500">You&apos;ll be enrolled in each class above, with its own notes, material and certificate.</p>
              </section>
            )}

            {highlights.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-serif text-2xl text-stone-800">What you&apos;ll explore</h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {highlights.map((h) => (
                    <li key={h} className="flex gap-2 text-sm text-stone-700">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {c.modules.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-serif text-2xl text-stone-800">What you&apos;ll cover</h2>
                <ul className="divide-y divide-stone-100 rounded-2xl bg-white ring-1 ring-stone-200">
                  {c.modules.map((m) => (
                    <li key={m.id} className="flex gap-3 px-4 py-3 text-sm">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" />
                      <div>
                        <p className="text-stone-800">{m.title}</p>
                        {m.description && <p className="text-stone-500">{m.description}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
              {promoted && promo && <PromoNote promo={promo} freeText="Join this class free of charge while the promotion runs. No card needed." />}
              <div>
                {free ? (
                  <p className="flex items-baseline gap-2 font-serif text-3xl text-amber-700">
                    Free <span className="font-sans text-base text-stone-400 line-through">{priceLabel}</span>
                  </p>
                ) : (
                  <p className="font-serif text-3xl text-stone-800">{priceLabel}</p>
                )}
                {saving && !free && <p className="text-sm font-medium text-sage-700">You save {formatPrice(saving, price.currency)}</p>}
              </div>
              <CurrencySwitch current={currency} />
              <ul className="space-y-2 text-sm text-stone-600">
                {c.format && (
                  <li className="flex items-start gap-2">
                    <MonitorPlay className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" /> {c.format}
                  </li>
                )}
                {c.schedule && (
                  <li className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" /> {c.schedule}
                  </li>
                )}
                {c.seats !== null && !full && (
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-sage-600" /> {c.seats} place{c.seats === 1 ? "" : "s"} left
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-sage-600" /> IPHMA accredited training
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-sage-600" /> Class notes in your private space
                </li>
                <li className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-sage-600" /> Certificate {isBundle ? "for each level" : "when you complete"}
                </li>
              </ul>
              {full ? (
                <div className="space-y-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
                  <p className="font-medium">This class is fully booked.</p>
                  <p>Contact Rangika to join the waiting list or hear about the next dates.</p>
                  <Link href="/contact" className="inline-block font-medium underline">
                    Contact Rangika
                  </Link>
                </div>
              ) : (
                <BuyPackage kind="course" packageId={c.id} title={c.title} priceLabel={priceLabel} currency={price.currency} prerequisite={c.prerequisite} free={free} />
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
