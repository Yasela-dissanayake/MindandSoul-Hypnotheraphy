"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FADE = "linear-gradient(to bottom, black calc(100% - 7rem), transparent)";

/**
 * Folds long content to a preview with a soft fade and a "See more" button.
 * Content that fits (or is only a little longer) stays fully open, with no button.
 * The text is always in the page (search engines and Ctrl+F still find it).
 */
export function SeeMore({
  children,
  collapsedHeight = 300,
  className,
}: {
  children: React.ReactNode;
  /** Height of the preview, in pixels. */
  collapsedHeight?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const id = useId();
  const [open, setOpen] = useState(false);
  // Until measured, assume it's long (so long sections don't jump closed after the page loads).
  const [long, setLong] = useState<boolean | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Only fold when there is a real amount hidden (not just a line or two).
    const check = () => setLong(el.scrollHeight > collapsedHeight + 120);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [collapsedHeight]);

  const folded = !open && long !== false;
  const toggle = () => {
    if (open && top.current && top.current.getBoundingClientRect().top < 0) {
      // Closing from further down: bring the start of the section back into view.
      top.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setOpen(!open);
  };

  return (
    <div ref={top} className={cn("scroll-mt-28", className)}>
      <div
        id={id}
        ref={ref}
        className="relative overflow-hidden"
        // The preview fades out at the bottom (a mask, so it blends into any background).
        style={
          folded
            ? {
                maxHeight: collapsedHeight,
                ...(long ? { maskImage: FADE, WebkitMaskImage: FADE } : {}),
              }
            : undefined
        }
      >
        {children}
      </div>
      {long && (
        <button
          suppressHydrationWarning
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={id}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-sage-800 ring-1 ring-sage-200 transition hover:bg-sage-50 hover:ring-sage-300"
        >
          {open ? "See less" : "See more"}
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden />
        </button>
      )}
    </div>
  );
}
