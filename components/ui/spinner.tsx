import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-2">
      <Loader2 className={cn("h-4 w-4 animate-spin", className)} aria-hidden />
      <span className={label ? "" : "sr-only"}>{label ?? "Loading"}</span>
    </span>
  );
}

/** Full-area loading state for pages (used by loading.tsx files). */
export function PageLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-stone-500">
      <Loader2 className="h-8 w-8 animate-spin text-sage-600" aria-hidden />
      <p className="text-sm" role="status" aria-live="polite">
        {label}
      </p>
    </div>
  );
}
