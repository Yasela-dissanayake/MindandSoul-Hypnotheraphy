"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A small notice at the bottom of the screen when the internet connection drops ("You're offline"),
 * and a short "You're back online" when it returns. Shown on every page.
 *
 * While offline, clicking a link to another page of the site is held back: otherwise the browser would
 * replace the page with its own "No internet" screen. The visitor stays where they are and is told why.
 */
export function NetworkStatus() {
  const [state, setState] = useState<"online" | "offline" | "back">("online");
  const [blocked, setBlocked] = useState(0); // counts held-back clicks, to replay the "shake"

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!navigator.onLine) setState("offline");
    const off = () => {
      clearTimeout(timer);
      setState("offline");
    };
    const on = () => {
      setBlocked(0);
      setState("back");
      timer = setTimeout(() => setState("online"), 3000);
    };
    // Hold back clicks on links to other pages of this site while there's no connection.
    const onClick = (e: MouseEvent) => {
      if (navigator.onLine || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // same page (e.g. #section) works offline
      e.preventDefault();
      e.stopPropagation();
      setState("offline");
      setBlocked((n) => n + 1);
    };
    window.addEventListener("offline", off);
    window.addEventListener("online", on);
    document.addEventListener("click", onClick, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("offline", off);
      window.removeEventListener("online", on);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  if (state === "online") return null;
  const offline = state === "offline";
  return (
    <div
      key={blocked}
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-x-0 bottom-4 z-[200] mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-2.5 rounded-full px-4 py-2.5 text-sm shadow-lg ring-1",
        "duration-300 animate-in fade-in slide-in-from-bottom-4 motion-reduce:animate-none",
        offline ? "bg-stone-800 text-white ring-stone-700" : "bg-sage-600 text-white ring-sage-500",
      )}
    >
      {offline ? <WifiOff className="h-4 w-4 shrink-0" aria-hidden /> : <Wifi className="h-4 w-4 shrink-0" aria-hidden />}
      {offline
        ? blocked
          ? "You're offline, so that page can't open yet. It will work once your connection is back."
          : "You're offline. Some things won't work until your connection is back."
        : "You're back online."}
    </div>
  );
}
