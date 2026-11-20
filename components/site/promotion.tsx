"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarClock, Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { HomePromotion } from "@/lib/promotions";
import { cn } from "@/lib/utils";

// The promotion on the home page: a pop-up (once per visitor per promotion) and a section,
// so anyone who closed the pop-up can still find it.

const SEEN_KEY = (id: string) => `promo-seen-${id}`;

/** Fixed format and time zone, so the server and the browser show the same text. */
const untilText = (iso: string) =>
  new Date(iso).toLocaleDateString("en-AU", { timeZone: "Australia/Perth", weekday: "long", day: "numeric", month: "long" });

function callToAction(p: HomePromotion) {
  if (!p.link) return { href: "/contact#enquiry", label: "Ask Rangika" };
  if (p.free) {
    const label = p.link.kind === "session" ? "Book your free session" : p.link.kind === "class" ? "Join the class for free" : "Get the course for free";
    return { href: p.link.href, label };
  }
  return { href: p.link.href, label: p.link.kind === "session" ? "See the session" : p.link.kind === "class" ? "See the class" : "See the course" };
}

function Badge({ free }: { free: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        free ? "bg-amber-100 text-amber-800" : "bg-sage-100 text-sage-800",
      )}
    >
      {free ? <Gift className="h-3.5 w-3.5" aria-hidden /> : <Sparkles className="h-3.5 w-3.5" aria-hidden />}
      {free ? "Free" : "Special offer"}
    </span>
  );
}

export function PromotionPopup({ promotion: p }: { promotion: HomePromotion }) {
  const [open, setOpen] = useState(false);

  // Once per visitor per promotion, shortly after the page appears.
  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY(p.id)) === "1";
    } catch {
      // storage blocked (private window): just show it
    }
    if (seen) return;
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, [p.id]);

  const close = (next: boolean) => {
    setOpen(next);
    if (!next) {
      try {
        localStorage.setItem(SEEN_KEY(p.id), "1");
      } catch {
        // ignore
      }
    }
  };
  const cta = callToAction(p);

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[90vh] max-w-lg gap-0 overflow-y-auto p-0">
        {p.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imageUrl} alt="" className="h-48 w-full object-cover object-[center_25%] sm:h-56 sm:rounded-t-lg" />
        )}
        <div className="space-y-3 p-6">
          <Badge free={p.free} />
          <DialogTitle className="font-serif text-2xl leading-snug text-stone-800">{p.title}</DialogTitle>
          <DialogDescription asChild>
            <p className="whitespace-pre-line text-sm leading-relaxed text-stone-600">{p.content}</p>
          </DialogDescription>
          {p.link && <p className="text-sm font-medium text-sage-800">{p.link.title}</p>}
          <p className="flex items-center gap-1.5 text-xs text-stone-500">
            <CalendarClock className="h-3.5 w-3.5" aria-hidden /> Until {untilText(p.endsAt)}
          </p>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button asChild className="flex-1 bg-sage-600 hover:bg-sage-700" onClick={() => close(false)}>
              <Link href={cta.href}>
                {cta.label} <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button variant="outline" className="sm:w-28" onClick={() => close(false)}>
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PromotionSection({ promotion: p }: { promotion: HomePromotion }) {
  const cta = callToAction(p);
  return (
    <section id="promotion" aria-labelledby="promotion-title" className="scroll-mt-24 bg-gradient-to-br from-sage-50 to-amber-50/40 py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-sage-200 md:grid-cols-2">
          {p.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.imageUrl} alt="" className="h-64 w-full object-cover md:h-full md:min-h-[20rem]" />
          ) : (
            <div className="flex h-40 items-center justify-center bg-gradient-to-br from-sage-100 to-sage-200 md:h-full">
              {p.free ? <Gift className="h-16 w-16 text-sage-600" aria-hidden /> : <Sparkles className="h-16 w-16 text-sage-600" aria-hidden />}
            </div>
          )}
          <div className="flex flex-col justify-center space-y-4 p-6 sm:p-8 lg:p-10">
            <Badge free={p.free} />
            <h2 id="promotion-title" className="font-serif text-3xl text-stone-800">
              {p.title}
            </h2>
            <p className="whitespace-pre-line leading-relaxed text-stone-600">{p.content}</p>
            {p.link && <p className="font-medium text-sage-800">{p.link.title}</p>}
            <p className="flex items-center gap-1.5 text-sm text-stone-500">
              <CalendarClock className="h-4 w-4" aria-hidden /> Until {untilText(p.endsAt)}
            </p>
            <div>
              <Button asChild size="lg" className="bg-sage-600 hover:bg-sage-700">
                <Link href={cta.href}>
                  {cta.label} <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
