import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { CalendarDays, GraduationCap, Layers, MonitorPlay } from "lucide-react";
import { coverUrl } from "@/lib/covers";
import { classPrice, formatPrice, type Currency } from "@/lib/currency";
import { bundleSaving } from "@/lib/class-display";
import { classHref } from "@/lib/site-routes";
import { cn } from "@/lib/utils";
import { OfferBadge, WasPrice, promotedCard } from "@/components/site/offer-badge";
import { discounted } from "@/lib/promotions";
import { upcomingClassTimes } from "@/lib/class-dates";
import { ClassStartLine } from "@/components/site/class-dates";

export const classCardInclude = {
  dates: { orderBy: { startsAt: "asc" } },
  includes: { select: { title: true, price: true, priceAed: true, dates: { orderBy: { startsAt: "asc" } } }, orderBy: { order: "asc" } },
} satisfies Prisma.CourseInclude;
type ClassCard = Prisma.CourseGetPayload<{ include: typeof classCardInclude }>;

/** Reiki Training classes as cards (photo, format, dates, bundle contents, price). */
export function ClassGrid({
  classes,
  currency,
  promotedId,
  promoFree,
  promoDiscount = 0,
}: {
  classes: ClassCard[];
  currency: Currency;
  promotedId: string | null;
  promoFree: boolean;
  /** % off the promoted class while the promotion runs. */
  promoDiscount?: number;
}) {
  const promo = { free: promoFree };
  return (
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
          {classes.map((c) => {
            const full = c.seats !== null && c.seats <= 0;
            const price = classPrice(c, currency);
            const saving = bundleSaving(c, currency);
            const cover = coverUrl("course", c);
            const promoted = c.id === promotedId;
            const free = promoted && Boolean(promo?.free);
            const pay = promoted ? discounted(price.amount, promoDiscount) : price.amount;
            return (
              <Link
                key={c.id}
                href={classHref(c)}
                className={cn(
                  "group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:shadow-md hover:ring-sage-300",
                  promoted && promotedCard,
                )}
              >
                <div className="relative">
                  {promoted && <OfferBadge overlay free={free} discount={promoDiscount} className={c.includes.length > 0 ? "top-12" : undefined} />}
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="h-52 w-full object-cover" />
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-gradient-to-br from-sage-100 to-sage-200">
                      <GraduationCap className="h-10 w-10 text-sage-700" />
                    </div>
                  )}
                  {c.includes.length > 0 && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-sage-800 shadow-sm">
                      <Layers className="h-3.5 w-3.5" /> Bundle
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h2 className="font-serif text-xl text-stone-800 group-hover:text-sage-800">{c.title}</h2>
                  {c.summary && <p className="text-sm text-stone-600">{c.summary}</p>}
                  <div className="space-y-1 pt-1 text-xs text-stone-500">
                    {c.format && (
                      <p className="flex items-center gap-1.5">
                        <MonitorPlay className="h-3.5 w-3.5 shrink-0 text-sage-600" /> {c.format}
                      </p>
                    )}
                    {(c.schedule || upcomingClassTimes(c).length > 0) && (
                      <p className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-sage-600" /> <ClassStartLine dates={upcomingClassTimes(c)} note={c.schedule} />
                      </p>
                    )}
                    {c.includes.length > 0 && (
                      <p className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 shrink-0 text-sage-600" /> Includes {c.includes.map((x) => x.title).join(" + ")}
                      </p>
                    )}
                    {c.prerequisite && <p className="text-stone-500">For students who have completed {c.prerequisite}</p>}
                  </div>
                  <div className="mt-auto flex items-end justify-between gap-2 pt-3 text-sm">
                    <span className={full ? "font-medium text-amber-700" : "text-sage-700"}>
                      {full ? "Fully booked" : saving ? `Save ${formatPrice(saving, price.currency)}` : c.seats !== null ? `${c.seats} place${c.seats === 1 ? "" : "s"} left` : ""}
                    </span>
                    {free ? (
                      <span className="flex items-baseline gap-1.5">
                        <span className="text-lg font-semibold text-amber-700">Free</span>
                        <span className="text-xs text-stone-400 line-through">{formatPrice(price.amount, price.currency)}</span>
                      </span>
                    ) : pay < price.amount ? (
                      <span className="flex items-baseline gap-1.5">
                        <span className="text-lg font-semibold text-amber-700">{formatPrice(pay, price.currency)}</span>
                        <WasPrice className="text-xs">{formatPrice(price.amount, price.currency)}</WasPrice>
                      </span>
                    ) : (
                      <span className="text-lg font-semibold text-stone-800">{formatPrice(price.amount, price.currency)}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
  );
}
