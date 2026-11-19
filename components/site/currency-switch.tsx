"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/** "Prices in AUD | AED": remembers the visitor's choice for a year and reloads the prices. */
export function CurrencySwitch({ current, className }: { current: "aud" | "aed"; className?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const choose = (c: "aud" | "aed") => {
    if (c === current) return;
    document.cookie = `currency=${c}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    start(() => router.refresh());
  };
  return (
    <div className={cn("inline-flex items-center gap-2 text-xs text-stone-500", pending && "opacity-60", className)}>
      <span>Prices in</span>
      <div className="inline-flex rounded-full bg-white p-0.5 ring-1 ring-stone-200" role="group" aria-label="Currency">
        {(["aud", "aed"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => choose(c)}
            aria-pressed={c === current}
            className={cn(
              "rounded-full px-2.5 py-1 font-medium transition",
              c === current ? "bg-sage-600 text-white" : "text-stone-600 hover:bg-stone-100",
            )}
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
