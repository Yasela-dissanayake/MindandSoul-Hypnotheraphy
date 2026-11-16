import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Click-to-open section for long descriptions on the public site.
 * Uses the native <details> element, so it needs no JavaScript, works in
 * server and client components, and the text stays searchable (Ctrl+F opens it).
 */
export function Expandable({
  title,
  icon,
  hint,
  defaultOpen = false,
  size = "lg",
  className,
  children,
}: {
  title: ReactNode;
  icon?: ReactNode;
  /** Short text shown next to the title, e.g. "10 areas" or "from AUD 140". */
  hint?: ReactNode;
  defaultOpen?: boolean;
  size?: "lg" | "md";
  className?: string;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className={cn(
        "group rounded-xl border border-stone-200 bg-white open:shadow-sm",
        className
      )}
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center gap-3 rounded-xl text-stone-800 transition-colors hover:bg-sage-50 [&::-webkit-details-marker]:hidden",
          size === "lg" ? "px-5 py-4 sm:px-6" : "px-4 py-3"
        )}
      >
        {icon && <span className="shrink-0 text-sage-600">{icon}</span>}
        <span
          className={cn(
            "flex-1",
            size === "lg"
              ? "font-serif text-xl sm:text-2xl"
              : "font-semibold text-base"
          )}
        >
          {title}
        </span>
        {hint && (
          <span className="hidden text-sm text-stone-500 sm:inline">
            {hint}
          </span>
        )}
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage-700 transition-transform duration-200 group-open:rotate-180">
          <ChevronDown className="h-4 w-4" />
        </span>
      </summary>
      <div
        className={cn(
          "border-t border-stone-100",
          size === "lg" ? "p-5 sm:p-6" : "p-4"
        )}
      >
        {children}
      </div>
    </details>
  );
}
