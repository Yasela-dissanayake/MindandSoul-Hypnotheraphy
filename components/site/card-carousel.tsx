"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A row of cards that slides: 1 card on phones (with the next one peeking in), 2 on tablets, 3 on laptops.
 * Swipe or use the arrows / dots. It moves on by itself every few seconds, and stops while the visitor
 * hovers, touches or tabs into it, when it's off screen, or when their device asks for reduced motion.
 */
export function CardCarousel({ children, interval = 5000, label }: { children: React.ReactNode; interval?: number; label: string }) {
  const items = Children.toArray(children);
  const track = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);

  const measure = useCallback(() => {
    const t = track.current;
    if (!t || !t.firstElementChild) return;
    const card = (t.firstElementChild as HTMLElement).offsetWidth;
    const perView = Math.max(1, Math.round(t.clientWidth / card));
    setPages(Math.max(1, items.length - perView + 1));
    setPage(Math.round(t.scrollLeft / (card + gap(t))));
  }, [items.length]);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
    if (track.current) io.observe(track.current);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [measure]);

  const goTo = useCallback((i: number) => {
    const t = track.current;
    if (!t || !t.firstElementChild) return;
    const card = (t.firstElementChild as HTMLElement).offsetWidth + gap(t);
    t.scrollTo({ left: i * card, behavior: "smooth" });
  }, []);

  // Moves on by itself, back to the start after the last card.
  useEffect(() => {
    if (paused || !visible || pages <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => goTo(page + 1 >= pages ? 0 : page + 1), interval);
    return () => clearInterval(id);
  }, [paused, visible, pages, page, interval, goTo]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        ref={track}
        onScroll={measure}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto scroll-smooth px-4 pb-2 pt-1 sm:-mx-1 sm:scroll-px-1 sm:px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((child, i) => (
          <div
            key={i}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${items.length}`}
            className="w-[85%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
          >
            {child}
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => goTo(page - 1 < 0 ? pages - 1 : page - 1)}
            aria-label="Previous"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-700 shadow-sm ring-1 ring-stone-200 transition hover:bg-sage-50 hover:text-sage-800 hover:ring-sage-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === page}
                className={cn("h-2 rounded-full transition-all duration-300", i === page ? "w-6 bg-sage-600" : "w-2 bg-stone-300 hover:bg-stone-400")}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => goTo(page + 1 >= pages ? 0 : page + 1)}
            aria-label="Next"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-700 shadow-sm ring-1 ring-stone-200 transition hover:bg-sage-50 hover:text-sage-800 hover:ring-sage-300"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

const gap = (el: HTMLElement) => parseFloat(getComputedStyle(el).columnGap) || 0;
