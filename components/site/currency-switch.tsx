"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Currency = "aud" | "aed";

const MIN_LOADING_MS = 3000;

/** "Prices in AUD | AED": remembers the visitor's choice for a year and reloads the prices. */
export function CurrencySwitch({ current, className }: { current: Currency; className?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  // The currency being switched to, while the loading screen shows (at least 3 seconds).
  const [switching, setSwitching] = useState<Currency | null>(null);
  const [minTimeDone, setMinTimeDone] = useState(true);

  const choose = (c: Currency) => {
    if (c === current || switching) return;
    document.cookie = `currency=${c}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    setSwitching(c);
    setMinTimeDone(false);
    setTimeout(() => setMinTimeDone(true), MIN_LOADING_MS);
    start(() => router.refresh());
  };

  // Hide the loading screen once the new prices are in and 3 seconds have passed.
  useEffect(() => {
    if (switching && minTimeDone && !pending) setSwitching(null);
  }, [switching, minTimeDone, pending]);

  const shown = switching ?? current;

  return (
    <>
      <div className={cn("inline-flex items-center gap-2 text-xs text-stone-500", className)}>
        <span>Prices in</span>
        <div className="inline-flex rounded-full bg-white p-0.5 ring-1 ring-stone-200" role="group" aria-label="Currency">
          {(["aud", "aed"] as const).map((c) => (
            <button suppressHydrationWarning
              key={c}
              type="button"
              onClick={() => choose(c)}
              disabled={Boolean(switching)}
              aria-pressed={c === shown}
              className={cn(
                "rounded-full px-2.5 py-1 font-medium transition disabled:cursor-wait",
                c === shown ? "bg-sage-600 text-white" : "text-stone-600 hover:bg-stone-100",
              )}
            >
              {c.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Drawn straight on <body>: inside the sticky price box it would sit under later parts of the page. */}
      {switching &&
        createPortal(
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-xl ring-1 ring-stone-200">
            <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
            <p className="text-sm font-medium text-stone-700">Showing prices in {switching.toUpperCase()}…</p>
          </div>
        </div>,
          document.body,
        )}
    </>
  );
}
