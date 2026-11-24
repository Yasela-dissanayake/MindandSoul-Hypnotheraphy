import Link from "next/link";
import { ArrowLeft, CalendarCheck, Clock, Globe, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ServiceWithOptions } from "@/lib/session-catalog";
import { classPrice, formatPrice, type Currency } from "@/lib/currency";
import { coverUrl } from "@/lib/covers";
import { CATEGORY, bookingHref, enquiryHref } from "@/lib/site-routes";
import { CurrencySwitch } from "@/components/site/currency-switch";
import { RichText } from "@/components/site/rich-text";
import { PromoNote } from "@/components/site/promo-note";
import { freeOptionOf, promotionLink, type getActivePromotion } from "@/lib/promotions";

type Promo = Awaited<ReturnType<typeof getActivePromotion>>;

/**
 * One service's page (a Clinical Hypnotherapy area, Reiki, or an animal service): Rangika's page text on the left,
 * the packages with prices and booking buttons on the right ("Choose your support"), and an enquiry button.
 */
export function ServiceDetail({ s, currency, promo }: { s: ServiceWithOptions; currency: Currency; promo: Promo }) {
  const cat = CATEGORY[s.category];
  // The running promotion is about this service; when free, its single session costs nothing.
  const promoLink = promo ? promotionLink(promo) : null;
  const promoted = Boolean(promo && promoLink?.kind === "session" && promoLink.id === s.id);
  const freeId = promoted && promo?.free && !s.enquiryOnly ? freeOptionOf(s.options)?.id : null;
  const cover = coverUrl("session", s);
  const single = s.options.find((o) => o.sessions === 1 && !o.mode);
  const enquiry = enquiryHref(s.title);

  const cta = (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 ring-1 ring-sage-200 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-serif text-lg text-stone-800">{s.enquiryOnly ? "Let's talk about your team." : "Ready to begin?"}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        {!s.enquiryOnly && s.options.length > 0 && (
          <Button asChild className="bg-sage-600 text-white hover:bg-sage-700">
            <a href="#packages">
              <CalendarCheck className="mr-2 h-4 w-4" /> Book your session
            </a>
          </Button>
        )}
        <Button asChild variant="outline" className="border-sage-300 text-sage-800 hover:bg-sage-50">
          <Link href={enquiry}>
            <MessageCircle className="mr-2 h-4 w-4" /> {s.enquiryOnly ? "Send an enquiry" : "Need more clarity? Send us an enquiry"}
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <div className="container mx-auto max-w-7xl px-4 py-10 md:py-14">
        <Link href={cat.href} className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
          <ArrowLeft className="h-4 w-4" /> {cat.label}
        </Link>

        {/* Wide screens: title and page text on the left, the booking box beside them from the top (it stays in view).
            Phones: title, then the booking box, then the page text. */}
        <div className="mt-6 grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_26rem] xl:grid-cols-[minmax(0,1fr)_30rem] xl:gap-x-14">
        <header className="min-w-0 space-y-3 lg:col-start-1 lg:row-start-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage-700">{cat.label}</p>
          <h1 className="font-serif text-4xl leading-tight text-stone-800 md:text-5xl">{s.title}</h1>
          {s.tagline && <p className="font-serif text-xl italic text-sage-700">{s.tagline}</p>}
          {s.summary && <p className="max-w-3xl text-lg text-stone-600">{s.summary}</p>}
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm text-stone-600">
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
                <Globe className="h-4 w-4 text-sage-600" /> {s.inPerson ? "Live online / distance" : "Remote / online"}
              </span>
            )}
          </div>
        </header>

          <aside id="packages" className="scroll-mt-28 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
            <div className="space-y-4 rounded-2xl bg-white p-6 shadow-md ring-1 ring-stone-200 lg:p-7">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-serif text-xl text-stone-800">{s.enquiryOnly ? "Enquire" : "Choose your support"}</h2>
                {s.options.length > 0 && <CurrencySwitch current={currency} />}
              </div>
              {promoted && promo && <PromoNote promo={promo} freeText="Book a single session free of charge while the promotion runs (one per person). No card needed." />}
              {s.options.length > 0 && (
                <ul className="space-y-3">
                  {s.options.map((o) => {
                    const p = classPrice(o, currency);
                    const isFree = o.id === freeId;
                    return (
                      <li key={o.id} className="space-y-2 rounded-xl p-3 ring-1 ring-stone-200">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-medium text-stone-800">{o.title}</span>
                          {isFree ? (
                            <span className="flex items-baseline gap-1.5 font-semibold text-amber-700">
                              Free <span className="text-xs font-normal text-stone-400 line-through">{formatPrice(p.amount, p.currency)}</span>
                            </span>
                          ) : (
                            <span className="shrink-0 font-semibold text-stone-800">{formatPrice(p.amount, p.currency)}</span>
                          )}
                        </div>
                        {o.sessions > 1 && !s.enquiryOnly && single && classPrice(single, currency).amount * o.sessions > p.amount && (
                          <p className="text-xs text-sage-700">
                            {formatPrice(Math.round(p.amount / o.sessions), p.currency)} per session · save{" "}
                            {formatPrice(classPrice(single, currency).amount * o.sessions - p.amount, p.currency)}
                          </p>
                        )}
                        {o.note && <p className="text-xs text-stone-500">{o.note}</p>}
                        {!s.enquiryOnly && (
                          <div className="space-y-2 pt-1">
                            <Button asChild size="sm" className="w-full bg-sage-600 text-white hover:bg-sage-700">
                              <Link href={bookingHref(s.slug, { sessions: o.sessions, mode: o.mode })}>
                                {isFree ? "Book your free session" : `Book ${o.sessions > 1 ? o.title.toLowerCase() : "this session"}`}
                              </Link>
                            </Button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
              <Button asChild variant={s.enquiryOnly ? "default" : "outline"} className={s.enquiryOnly ? "w-full bg-sage-600 text-white hover:bg-sage-700" : "w-full border-sage-300 text-sage-800 hover:bg-sage-50"}>
                <Link href={enquiry}>
                  <MessageCircle className="mr-2 h-4 w-4" /> {s.enquiryOnly ? "Send an enquiry" : "Need more clarity? Send us an enquiry"}
                </Link>
              </Button>
              {!s.enquiryOnly && s.options.length > 0 && (
                <p className="text-xs leading-relaxed text-stone-500">
                  {s.options.some((o) => o.sessions > 1) && "Packages: you book your first live session at checkout and the rest from your private space, whenever it suits you. "}
                  Not sure what&apos;s right for you? Ask for a free consultation.
                </p>
              )}
            </div>
          </aside>

          <div className="min-w-0 space-y-8 lg:col-start-1 lg:row-start-2">
            {cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="h-56 w-full rounded-2xl object-cover sm:h-72 lg:h-80" />
            )}
            {s.body ? (
              <RichText text={s.body} cta={cta} fold />
            ) : (
              // No page text yet: the older short fields (About + one point per line).
              <RichText
                text={[s.details ?? "", ...(s.highlights ? ["## How it can help", ...s.highlights.split("\n").filter((l) => l.trim()).map((l) => `- ${l.trim()}`)] : [])].join("\n\n")}
              />
            )}
            {/* The page text normally places the buttons itself ([[book]]); otherwise they go at the end. */}
            {!s.body?.includes("[[book]]") && cta}
          </div>

        </div>
      </div>
    </div>
  );
}
