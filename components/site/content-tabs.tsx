"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Sub-sections of a page shown one at a time ("Session 1", "Session 2", "Option 1"...).
 * A green pill slides to the chosen tab, the panel slides in from the side you moved towards,
 * and Previous / Next buttons step through them in order. All panels stay in the page for search engines.
 */
export function ContentTabs({ tabs }: { tabs: { label: string; panel: React.ReactNode }[] }) {
  const [open, setOpen] = useState(0);
  const [dir, setDir] = useState<"left" | "right" | null>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  const id = useId();
  const list = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const choose = (i: number, focus = false) => {
    const n = (i + tabs.length) % tabs.length;
    if (n === open) return;
    setDir(n > open ? "right" : "left");
    setOpen(n);
    if (focus) refs.current[n]?.focus();
    refs.current[n]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  };

  // Keep the sliding pill under the chosen tab (and follow it when the page is resized).
  useIsoLayoutEffect(() => {
    const measure = () => {
      const t = refs.current[open];
      if (t) setPill({ left: t.offsetLeft, width: t.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (list.current) ro.observe(list.current);
    return () => ro.disconnect();
  }, [open]);

  const prev = open > 0 ? tabs[open - 1] : null;
  const next = open < tabs.length - 1 ? tabs[open + 1] : null;

  return (
    <div className="space-y-4">
      {/* the padding keeps the bar's outline from being clipped by the sideways scroll area */}
      <div className="-m-1 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div ref={list} role="tablist" className="relative inline-flex min-w-max gap-1 rounded-full border border-sage-200 bg-sage-50 p-1">
          {pill && (
            <span
              aria-hidden
              className="absolute inset-y-1 rounded-full bg-sage-600 shadow-md shadow-sage-900/20 transition-all duration-300 ease-out motion-reduce:transition-none"
              style={{ left: pill.left, width: pill.width }}
            />
          )}
          {tabs.map((t, i) => (
            <button
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={open === i}
              aria-controls={`${id}-panel-${i}`}
              tabIndex={open === i ? 0 : -1}
              onClick={() => choose(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") choose(i + 1, true);
                else if (e.key === "ArrowLeft") choose(i - 1, true);
              }}
              className={cn(
                "relative z-10 flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300",
                open === i ? "text-white" : "text-stone-600 hover:text-sage-800",
                open === i && !pill && "bg-sage-600",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tabs.map((t, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={open !== i}
          className={cn(
            // a real border (not a ring), so nothing inside can draw over its rounded corners
            "relative overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-br from-white via-white to-sage-50 p-6 shadow-sm sm:p-7",
            // no animation on first load, only when moving between tabs
            dir && "duration-500 ease-out animate-in fade-in motion-reduce:animate-none",
            dir === "right" && "slide-in-from-right-8",
            dir === "left" && "slide-in-from-left-8",
          )}
        >
          {/* "Session 2 · 2 of 3" with a small rounded progress bar beside it */}
          <div className="mb-2 flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-600">
              {t.label} <span className="font-normal text-stone-400">· {i + 1} of {tabs.length}</span>
            </p>
            <div className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-sage-100 sm:w-28" aria-hidden>
              <div className="h-full rounded-full bg-sage-500 transition-all duration-500" style={{ width: `${((i + 1) / tabs.length) * 100}%` }} />
            </div>
          </div>
          <div className="space-y-4">{t.panel}</div>

          {tabs.length > 1 && (
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-stone-100 pt-4 text-sm">
              {prev ? (
                <button type="button" onClick={() => choose(i - 1)} className="group inline-flex items-center gap-1.5 text-stone-500 hover:text-sage-800">
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden /> {prev.label}
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-1.5" aria-hidden>
                {tabs.map((_, j) => (
                  <span key={j} className={cn("h-1.5 rounded-full transition-all duration-300", j === i ? "w-5 bg-sage-600" : "w-1.5 bg-stone-300")} />
                ))}
              </div>
              {next ? (
                <button type="button" onClick={() => choose(i + 1)} className="group inline-flex items-center gap-1.5 font-medium text-sage-700 hover:text-sage-900">
                  {next.label} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </button>
              ) : (
                <span />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
