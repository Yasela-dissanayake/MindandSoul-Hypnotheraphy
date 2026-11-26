import { Gift, Percent, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * "Special offer" / "Free" / "20% off" label for the session, class or course the running promotion is about.
 * `overlay` places it on the top-left corner of a card photo.
 */
export function OfferBadge({
  free,
  discount = 0,
  overlay,
  label,
  className,
}: {
  free?: boolean;
  discount?: number;
  overlay?: boolean;
  label?: string;
  className?: string;
}) {
  const deal = free || discount > 0;
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        deal ? "bg-amber-100 text-amber-800" : "bg-sage-100 text-sage-800",
        overlay && "absolute left-3 top-3 z-10 shadow-sm ring-1 ring-white/70",
        className,
      )}
    >
      {free ? <Gift className="h-3.5 w-3.5" aria-hidden /> : discount > 0 ? <Percent className="h-3.5 w-3.5" aria-hidden /> : <Sparkles className="h-3.5 w-3.5" aria-hidden />}
      {label ?? (free ? "Free" : discount > 0 ? `${discount}% off` : "Special offer")}
    </span>
  );
}

/** The usual price, crossed out, next to the offer price. */
export function WasPrice({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("font-normal text-stone-400 line-through", className)}>
      <span className="sr-only">Usual price </span>
      {children}
    </span>
  );
}

/** Ring that makes the promoted card stand out in a list. */
export const promotedCard = "ring-2 ring-amber-300 hover:ring-amber-400";
