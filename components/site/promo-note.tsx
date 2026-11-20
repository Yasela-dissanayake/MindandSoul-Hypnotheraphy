import { CalendarClock } from "lucide-react";
import { OfferBadge } from "@/components/site/offer-badge";
import type { ActivePromotion } from "@/lib/promotions";

/** On the page of the promoted session / class / course: the promotion's title and end date. */
export function PromoNote({ promo, freeText }: { promo: ActivePromotion; freeText?: string }) {
  const until = promo.endsAt.toLocaleDateString("en-AU", { timeZone: "Australia/Perth", weekday: "long", day: "numeric", month: "long" });
  return (
    <div className="space-y-2 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
      <OfferBadge free={promo.free} />
      <p className="font-medium text-stone-800">{promo.title}</p>
      {promo.free && freeText && <p className="text-sm text-stone-700">{freeText}</p>}
      <p className="flex items-center gap-1.5 text-xs text-stone-500">
        <CalendarClock className="h-3.5 w-3.5" aria-hidden /> Until {until}
      </p>
    </div>
  );
}
