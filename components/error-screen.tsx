"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CloudOff, Loader2, RefreshCw, Sparkles, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { errorKind } from "@/lib/friendly-error";

type Area = "site" | "portal" | "admin";

const HOME: Record<Area, { href: string; label: string }> = {
  site: { href: "/", label: "Back to home" },
  portal: { href: "/portal", label: "Back to Today" },
  admin: { href: "/admin", label: "Back to Overview" },
};

const TEXT = {
  offline: {
    icon: WifiOff,
    title: "You're offline",
    body: "We can't load this page without an internet connection. It will try again by itself as soon as you're back online.",
  },
  network: {
    icon: CloudOff,
    title: "We couldn't load this page",
    body: "The connection to our server dropped for a moment. Please check your internet and try again.",
  },
  updated: {
    icon: Sparkles,
    title: "The website has just been updated",
    body: "Please refresh the page to get the latest version. Nothing you saved has been lost.",
  },
  other: {
    icon: RefreshCw,
    title: "Something went wrong",
    body: "This page didn't load properly. It's not something you did. Please try again, and if it keeps happening, let us know.",
  },
} as const;

/**
 * Shown instead of a page that failed to load (a crash, the server not answering, no internet).
 * Never shows the technical error; only a calm message, "Try again", and a way home.
 */
export function ErrorScreen({ error, reset, area = "site" }: { error: Error & { digest?: string }; reset: () => void; area?: Area }) {
  const router = useRouter();
  const [retrying, startRetry] = useTransition();
  const [online, setOnline] = useState(true);
  const kind = online ? errorKind(error) : "offline";
  const t = TEXT[kind];
  const home = HOME[area];

  const retry = () => {
    if (kind === "updated") {
      window.location.reload();
      return;
    }
    // Ask the server for the page again, then redraw it.
    startRetry(() => {
      router.refresh();
      reset();
    });
  };

  useEffect(() => {
    // The details stay in the browser console for us; visitors only see the friendly message.
    console.error(error);
    setOnline(navigator.onLine);
    const goOnline = () => {
      setOnline(true);
      retry();
    };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return (
    <section
      role="alert"
      className={area === "site" ? "bg-gradient-to-b from-sage-50 to-white px-4 py-16 md:py-24" : "py-10 md:py-16"}
    >
      <div className="mx-auto max-w-xl space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-100 text-sage-700">
          <t.icon className="h-8 w-8" aria-hidden />
        </div>
        <div className="space-y-3">
          <h1 className="font-serif text-3xl text-stone-800 md:text-4xl">{t.title}</h1>
          <p className="leading-relaxed text-stone-600">{t.body}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={retry} disabled={retrying} className="bg-sage-600 text-white hover:bg-sage-700">
            {retrying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            {kind === "updated" ? "Refresh the page" : "Try again"}
          </Button>
          <Button asChild variant="outline" className="border-sage-300 text-sage-800 hover:bg-sage-50">
            <Link href={home.href}>{home.label}</Link>
          </Button>
        </div>
        {area === "site" && kind === "other" && (
          <p className="text-sm text-stone-500">
            Need help now? Email{" "}
            <a href="mailto:mindandsoulworks@gmail.com" className="text-sage-700 underline">
              mindandsoulworks@gmail.com
            </a>
            .
          </p>
        )}
        {error.digest && kind === "other" && <p className="text-xs text-stone-400">Reference: {error.digest}</p>}
      </div>
    </section>
  );
}
