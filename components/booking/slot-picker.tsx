"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// The free times for a session service, shown in the visitor's own time zone.
// Used by the public booking page and by clients booking a package session in their portal.

type Mode = "IN_PERSON" | "DISTANCE";
export type Slot = { start: string; end: string; startsAt: string; endsAt: string };

export const myTz = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Australia/Perth";
  } catch {
    return "Australia/Perth";
  }
};

/** Free times from the booking calendar, shown in the visitor's own time zone. */
export function SlotPicker({
  serviceSlug,
  mode,
  date,
  slot,
  onDate,
  onSlot,
  reloadKey = 0,
}: {
  serviceSlug: string;
  mode: Mode;
  date: string | null;
  slot: Slot | null;
  onDate: (d: string) => void;
  onSlot: (s: Slot | null) => void;
  reloadKey?: number;
}) {
  const [days, setDays] = useState<Record<string, Slot[]> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tz = useMemo(myTz, []);
  useEffect(() => {
    let stop = false;
    setDays(null);
    setError(null);
    fetch(`/api/booking/availability?service=${encodeURIComponent(serviceSlug)}&mode=${mode === "IN_PERSON" ? "in-person" : "distance"}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => !stop && setDays(j.days ?? {}))
      .catch(() => !stop && setError("Couldn't load the available times. Please refresh the page."));
    return () => {
      stop = true;
    };
  }, [serviceSlug, mode, reloadKey]);

  if (error) return <p className="text-sm text-red-700">{error}</p>;
  if (!days)
    return (
      <p className="flex items-center gap-2 text-sm text-stone-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading available times…
      </p>
    );
  const dates = Object.keys(days).sort();
  if (dates.length === 0)
    return (
      <p className="text-sm text-stone-600">
        There are no free times at the moment.{" "}
        <Link href="/contact" className="text-sage-700 underline">
          Contact Rangika
        </Link>{" "}
        and she&apos;ll find a time with you.
      </p>
    );
  const current = date && days[date] ? date : dates[0];
  const label = (d: string) => {
    const [y, m, dd] = d.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, dd, 12)).toLocaleDateString("en-AU", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" });
  };
  const time = (iso: string) => new Date(iso).toLocaleTimeString("en-AU", { timeZone: tz, hour: "numeric", minute: "2-digit" });
  const tzName = tz === "Australia/Perth" ? "Perth time" : `your time, ${tz.replace(/_/g, " ")}`;

  return (
    <div className="space-y-4">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {dates.map((d) => (
          <button suppressHydrationWarning
            key={d}
            type="button"
            onClick={() => (onDate(d), onSlot(null))}
            aria-pressed={d === current}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-sm ring-1 transition",
              d === current ? "bg-sage-600 text-white ring-sage-600" : "bg-white text-stone-700 ring-stone-200 hover:ring-sage-300",
            )}
          >
            {label(d)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {days[current].map((s) => (
          <button suppressHydrationWarning
            key={s.start}
            type="button"
            onClick={() => (onDate(current), onSlot(s))}
            aria-pressed={slot?.startsAt === s.startsAt}
            className={cn(
              "rounded-lg px-3 py-2 text-sm ring-1 transition",
              slot?.startsAt === s.startsAt ? "bg-sage-600 text-white ring-sage-600" : "bg-white text-stone-700 ring-stone-200 hover:ring-sage-300",
            )}
          >
            {time(s.startsAt)}
          </button>
        ))}
      </div>
      <p className="text-xs text-stone-500">Times are shown in {tzName}. Dates are Perth dates.</p>
    </div>
  );
}

