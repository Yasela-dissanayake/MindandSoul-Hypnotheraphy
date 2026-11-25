"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shown while a file uploads, everywhere in the app: a spinner, the percentage and a bar.
 * At 100% the file is in storage and we're saving it, so it says "Finishing…".
 * `compact`: just the spinner and percentage, for tight rows (e.g. next to a button).
 */
export function UploadProgress({ pct, label, compact = false, className }: { pct: number; label?: string; compact?: boolean; className?: string }) {
  const value = Math.max(0, Math.min(100, Math.round(pct)));
  const done = value >= 100;
  const text = done ? "Finishing…" : label ?? "Uploading…";
  if (compact)
    return (
      <span role="status" aria-live="polite" className={cn("inline-flex items-center gap-1.5 text-xs font-medium text-sage-800", className)}>
        <Loader2 className="h-3.5 w-3.5 animate-spin text-sage-600" aria-hidden />
        {done ? "Finishing…" : `${value}%`}
      </span>
    );
  return (
    <div role="status" aria-live="polite" className={cn("flex items-center gap-3 rounded-lg bg-sage-50 px-3 py-2.5 ring-1 ring-sage-200", className)}>
      <Loader2 className="h-5 w-5 shrink-0 animate-spin text-sage-600" aria-hidden />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="truncate text-stone-700">{text}</span>
          <span className="font-semibold tabular-nums text-sage-800">{value}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-sage-100">
          <div className="h-full rounded-full bg-sage-600 transition-[width] duration-300 ease-out" style={{ width: `${value}%` }} />
        </div>
      </div>
    </div>
  );
}
