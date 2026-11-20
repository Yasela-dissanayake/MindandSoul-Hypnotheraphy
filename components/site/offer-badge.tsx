import { Gift, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * "Special offer" / "Free" label for the session, class or course the running promotion is about.
 * `overlay` places it on the top-left corner of a card photo.
 */
export function OfferBadge({ free, overlay, label, className }: { free?: boolean; overlay?: boolean; label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        free ? "bg-amber-100 text-amber-800" : "bg-sage-100 text-sage-800",
        overlay && "absolute left-3 top-3 z-10 shadow-sm ring-1 ring-white/70",
        className,
      )}
    >
      {free ? <Gift className="h-3.5 w-3.5" aria-hidden /> : <Sparkles className="h-3.5 w-3.5" aria-hidden />}
      {label ?? (free ? "Free" : "Special offer")}
    </span>
  );
}

/** Ring that makes the promoted card stand out in a list. */
export const promotedCard = "ring-2 ring-amber-300 hover:ring-amber-400";
