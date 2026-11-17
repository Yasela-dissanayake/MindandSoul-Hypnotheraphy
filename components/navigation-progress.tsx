"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

// A thin bar at the top of the screen while the next page loads or a save is in progress.
// - Page changes: starts when an internal link is clicked, finishes when the new URL renders.
//   If the page takes more than a moment, a loading spinner also covers the screen until it appears.
// - Saves/uploads: call startProgress() / doneProgress() (useAction does this automatically).

let active = 0;
let navigating = false; // a page change is on its way
const listeners = new Set<(on: boolean, nav: boolean) => void>();
const emit = () => listeners.forEach((l) => l(active > 0 || navigating, navigating));

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
  const [overlay, setOverlay] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Page changes only (not saves). Waits a moment so quick pages don't flash a spinner.
  const spin = (on: boolean) => {
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
    overlayTimer.current = null;
    if (on) overlayTimer.current = setTimeout(() => setOverlay(true), 200);
    else setOverlay(false);
  };

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
    const onChange = (on: boolean, nav: boolean) => {
      run(on);
      spin(nav);
    };
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

  if (!visible && !overlay) return null;
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5" aria-hidden>
        <div className="h-full bg-sage-500 shadow-[0_0_8px_rgba(92,115,92,0.6)] transition-[width] duration-200 ease-out" style={{ width: `${width}%` }} />
      </div>
      {overlay && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-white/60 backdrop-blur-[2px] animate-in fade-in-0 duration-200">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-lg ring-1 ring-stone-200" role="status" aria-live="polite">
            <Loader2 className="h-9 w-9 animate-spin text-sage-600" aria-hidden />
            <p className="text-sm text-stone-600">Loading…</p>
          </div>
        </div>
      )}
    </>
  );
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  );
}
