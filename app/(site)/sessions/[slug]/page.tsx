import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CheckCircle, Clock, Globe, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { serviceWithOptions } from "@/lib/session-catalog";
import { classPrice, formatPrice, viewerCurrency } from "@/lib/currency";
import { highlightLines } from "@/lib/class-display";
import { coverUrl } from "@/lib/covers";
import { CurrencySwitch } from "@/components/site/currency-switch";
import { getActivePromotion, promotionLink, freeOptionOf } from "@/lib/promotions";
import { PromoNote } from "@/components/site/promo-note";

export const dynamic = "force-dynamic";

const load = (slug: string) => db.sessionService.findFirst({ where: { slug, published: true }, include: serviceWithOptions });

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = await load((await params).slug);
  return s ? { title: `${s.title} · Sessions · Mind & Soul Works`, description: s.summary ?? undefined } : { title: "Session not found" };
}

export default async function SessionServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const [s, currency, promo] = await Promise.all([params.then((p) => load(p.slug)), viewerCurrency(), getActivePromotion()]);
  if (!s) notFound();
  // The running promotion is about this session; when free, its single session costs nothing.
  const promoLink = promo ? promotionLink(promo) : null;
  const promoted = Boolean(promo && promoLink?.kind === "session" && promoLink.id === s.id);
  const freeId = promoted && promo?.free && !s.enquiryOnly ? freeOptionOf(s.options)?.id : null;
  const cover = coverUrl("session", s);
  const highlights = highlightLines(s.highlights);
  const single = s.options.find((o) => o.sessions === 1 && !o.mode);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <div className="container mx-auto max-w-7xl px-4 py-10 md:py-14">
        <Link href="/sessions" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
          <ArrowLeft className="h-4 w-4" /> All sessions
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_24rem] xl:gap-14">
          <div className="min-w-0 space-y-8">
            {cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="h-56 w-full rounded-2xl object-cover sm:h-80 lg:h-96" />
            )}
            <div className="space-y-3">
              <h1 className="font-serif text-4xl text-stone-800">{s.title}</h1>
              {s.summary && <p className="text-lg text-stone-600">{s.summary}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
                {s.lengthLabel && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-sage-600" /> {s.lengthLabel}
                  </span>
                )}
                {s.inPerson && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-sage-600" /> In person in Perth
                  </span>
                )}
                {s.online && (
                  <span className="flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-sage-600" /> {s.inPerson ? "Online / distance" : "Remote / online"}
                  </span>
                )}
              </div>
            </div>

            {s.details && (
              <section className="space-y-2">
                <h2 className="font-serif text-2xl text-stone-800">About this session</h2>
                <p className="whitespace-pre-line leading-relaxed text-stone-700">{s.details}</p>
              </section>
            )}

            {highlights.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-serif text-2xl text-stone-800">{s.planService === "HYPNOTHERAPY" && s.options.length > 1 ? "Areas of support" : "How it can help"}</h2>
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
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-serif text-xl text-stone-800">{s.enquiryOnly ? "Prices" : "Pricing & booking"}</h2>
                {s.options.length > 0 && <CurrencySwitch current={currency} />}
              </div>
              {promoted && promo && <PromoNote promo={promo} freeText="Book a single session free of charge while the promotion runs (one per person). No card needed." />}
              {s.options.length > 0 && (
                <ul className="space-y-3">
                  {s.options.map((o) => {
                    const p = classPrice(o, currency);
                    const href = `/booking?service=${s.slug}&sessions=${o.sessions}${o.mode ? `&mode=${o.mode === "IN_PERSON" ? "in-person" : "online"}` : ""}`;
                    return (
                      <li key={o.id} className="space-y-2 rounded-xl p-3 ring-1 ring-stone-200">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-medium text-stone-800">{o.title}</span>
                          {o.id === freeId ? (
                            <span className="flex items-baseline gap-1.5 font-semibold text-amber-700">
                              Free <span className="text-xs font-normal text-stone-400 line-through">{formatPrice(p.amount, p.currency)}</span>
                            </span>
                          ) : (
                            <span className="font-semibold text-stone-800">{formatPrice(p.amount, p.currency)}</span>
                          )}
                        </div>
                        {o.sessions > 1 && !s.enquiryOnly && single && (
                          <p className="text-xs text-sage-700">
                            {formatPrice(Math.round(p.amount / o.sessions), p.currency)} per session · save{" "}
                            {formatPrice(classPrice(single, currency).amount * o.sessions - p.amount, p.currency)}
                          </p>
                        )}
                        {o.note && <p className="text-xs text-stone-500">{o.note}</p>}
                        {!s.enquiryOnly && (
                          <Button asChild size="sm" className="w-full bg-sage-600 text-white hover:bg-sage-700">
                            <Link href={href}>{o.id === freeId ? "Book your free session" : `Book ${o.sessions > 1 ? o.title.toLowerCase() : "this session"}`}</Link>
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
              {s.enquiryOnly ? (
                <Button asChild className="w-full bg-sage-600 text-white hover:bg-sage-700">
                  <Link href="/contact">
                    <MessageCircle className="mr-2 h-4 w-4" /> Send an enquiry
                  </Link>
                </Button>
              ) : (
                <p className="text-xs text-stone-500">
                  Packages: you book your first session at checkout and the rest from your private space, whenever it suits you. Not sure what&apos;s right for
                  you?{" "}
                  <Link href="/contact" className="text-sage-700 underline">
                    Ask for a free consultation
                  </Link>
                  .
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
