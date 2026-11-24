import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ServiceWithOptions } from "@/lib/session-catalog";
import { cheapest } from "@/lib/session-catalog";
import { classPrice, formatPrice, type Currency } from "@/lib/currency";
import { coverUrl } from "@/lib/covers";
import { serviceHref } from "@/lib/site-routes";
import { cn } from "@/lib/utils";
import { OfferBadge, promotedCard } from "@/components/site/offer-badge";

/** "1 or 3 sessions", "5-session journey", "6 or 12 sessions", "Single session · 1½ hours". */
export function packagesLabel(s: Pick<ServiceWithOptions, "options" | "enquiryOnly" | "lengthLabel">) {
  if (s.enquiryOnly || s.options.length === 0) return "By enquiry";
  const counts = [...new Set(s.options.map((o) => o.sessions))].sort((a, b) => a - b);
  if (counts.length === 1 && counts[0] === 1) return s.lengthLabel ? `Single session · ${s.lengthLabel}` : "Single session";
  if (counts.length === 1) return `${counts[0]}-session journey`;
  return `${counts.slice(0, -1).join(", ")} or ${counts[counts.length - 1]} sessions`;
}

/** A service on a tab page: optional photo, number, title, summary, packages and the starting price. */
export function ServiceCard({
  s,
  currency,
  number,
  photo = false,
  promoted = false,
  free = false,
}: {
  s: ServiceWithOptions;
  currency: Currency;
  number?: number;
  photo?: boolean;
  promoted?: boolean;
  free?: boolean;
}) {
  const from = cheapest(s.options);
  const price = from ? classPrice(from, currency) : null;
  const cover = photo ? coverUrl("session", s) : null;
  return (
    <Link
      href={serviceHref(s)}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-sage-300",
        promoted && promotedCard,
      )}
    >
      {promoted && <OfferBadge overlay free={free} label={free ? "Free session" : undefined} />}
      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="h-48 w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col gap-3 p-6 lg:p-7">
        <div className="flex items-start gap-3">
          {number !== undefined && (
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sm font-semibold text-sage-800">
              {number}
            </span>
          )}
          <h3 className="font-serif text-xl leading-snug text-stone-800 group-hover:text-sage-800">{s.title}</h3>
        </div>
        {(s.summary || s.tagline) && <p className="text-sm leading-relaxed text-stone-600">{s.summary || s.tagline}</p>}
        <div className="mt-auto space-y-3 pt-3">
          <div className="flex flex-wrap gap-1.5 text-xs">
            <span className="rounded-full bg-sage-50 px-2.5 py-1 text-sage-800 ring-1 ring-sage-200">{packagesLabel(s)}</span>
          </div>
          <div className="flex items-end justify-between gap-2 text-sm">
            <span className="inline-flex items-center gap-1 font-medium text-sage-700">
              {s.enquiryOnly ? "Enquire" : "Read more"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
            {free ? (
              <span className="font-semibold text-amber-700">Single session free</span>
            ) : (
              price && (
                <span className="font-semibold text-stone-800">
                  {s.options.length > 1 && <span className="mr-1 text-xs font-normal text-stone-500">from</span>}
                  {formatPrice(price.amount, price.currency)}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
