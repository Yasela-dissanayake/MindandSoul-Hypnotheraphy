"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// A thin bar at the top of the screen while the next page loads or a save is in progress.
// - Page changes: starts when an internal link is clicked, finishes when the new URL renders.
// - Saves/uploads: call startProgress() / doneProgress() (useAction does this automatically).

let active = 0;
let navigating = false; // a page change is on its way
const listeners = new Set<(on: boolean) => void>();
const emit = () => listeners.forEach((l) => l(active > 0 || navigating));

export function startProgress() {
  active++;
  emit();
}
export function doneProgress() {
  active = Math.max(0, active - 1);
  emit();
}
/** Call just before router.push()/router.replace() so the bar shows until the new page appears. */
let safety: ReturnType<typeof setTimeout> | null = null;
export function beginNavigation() {
  navigating = true;
  emit();
  // Never leave the bar running if a navigation doesn't happen (e.g. same page).
  if (safety) clearTimeout(safety);
  safety = setTimeout(() => {
    navigating = false;
    emit();
  }, 15000);
}

/** router.push with the progress bar. */
export function navigateTo(router: { push: (href: string) => void }, href: string) {
  beginNavigation();
  router.push(href);
}

function isInternalNavigation(e: MouseEvent): boolean {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  const a = (e.target as HTMLElement | null)?.closest("a");
  if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download")) return false;
  const url = new URL(a.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  if (url.pathname.startsWith("/api/")) return false; // file downloads
  const here = window.location;
  // Same page (or only a #hash change): nothing to wait for.
  return !(url.pathname === here.pathname && url.search === here.search);
}

function Bar() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start/stop the animation.
  const run = (on: boolean) => {
    if (on) {
      if (timer.current) return;
      setVisible(true);
      setWidth(8);
      timer.current = setInterval(() => setWidth((w) => (w < 85 ? w + (90 - w) * 0.08 : w)), 200);
    } else {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
      setWidth(100);
      setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 250);
    }
  };

  useEffect(() => {
    const onChange = (on: boolean) => run(on);
    listeners.add(onChange);
    const onClick = (e: MouseEvent) => {
      if (!isInternalNavigation(e)) return;
      beginNavigation();
    };
    document.addEventListener("click", onClick, true);
    return () => {
      listeners.delete(onChange);
      document.removeEventListener("click", onClick, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The new page rendered: finish.
  useEffect(() => {
    if (!navigating) return;
    navigating = false;
    emit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  if (!visible) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5" aria-hidden>
      <div className="h-full bg-sage-500 shadow-[0_0_8px_rgba(92,115,92,0.6)] transition-[width] duration-200 ease-out" style={{ width: `${width}%` }} />
    </div>
  );
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  );
}
