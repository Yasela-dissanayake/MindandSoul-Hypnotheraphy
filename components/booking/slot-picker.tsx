"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { timeRange } from "@/lib/dates";
import { cn } from "@/lib/utils";

// The free times for a session service, shown in the visitor's own time zone.
// Used by the public booking page and by clients booking a package session in their portal.
// A month calendar where only days with free times can be picked, and the chosen day's times beside it.

type Mode = "IN_PERSON" | "DISTANCE";
export type Slot = { start: string; end: string; startsAt: string; endsAt: string };

export const myTz = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Australia/Perth";
  } catch {
    return "Australia/Perth";
  }
};

// The calendar works in Perth dates ("2026-11-24"); the day picker wants Date objects.
const fromKey = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const toKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

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
  const dates = Object.keys(days)
    .filter((d) => days[d].length > 0)
    .sort();
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
  const current = date && days[date]?.length ? date : dates[0];
  const longLabel = new Date(`${current}T12:00:00Z`).toLocaleDateString("en-AU", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" });
  const hour = (iso: string) => Number(new Date(iso).toLocaleString("en-GB", { timeZone: tz, hour: "2-digit", hourCycle: "h23" }));
  const tzName = tz === "Australia/Perth" ? "Perth time" : `your time, ${tz.replace(/_/g, " ")}`;

  // Morning / afternoon / evening in the visitor's own time.
  const groups = [
    { label: "Morning", slots: days[current].filter((s) => hour(s.startsAt) < 12) },
    { label: "Afternoon", slots: days[current].filter((s) => hour(s.startsAt) >= 12 && hour(s.startsAt) < 17) },
    { label: "Evening", slots: days[current].filter((s) => hour(s.startsAt) >= 17) },
  ].filter((g) => g.slots.length > 0);
  const available = new Set(dates);
  const count = days[current].length;

  return (
    <div className="space-y-4">
      <div className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
        <div className="mx-auto md:mx-0">
          <Calendar
            mode="single"
            required
            selected={fromKey(current)}
            onSelect={(d) => {
              if (!d) return;
              onDate(toKey(d));
              onSlot(null);
            }}
            defaultMonth={fromKey(current)}
            startMonth={fromKey(dates[0])}
            endMonth={fromKey(dates[dates.length - 1])}
            disabled={(d) => !available.has(toKey(d))}
            showOutsideDays={false}
            modifiers={{ open: (d) => available.has(toKey(d)) }}
            modifiersClassNames={{
              open: "[&_button]:bg-sage-100 [&_button]:font-semibold [&_button]:text-sage-900 [&_button:hover]:bg-sage-200",
              selected: "[&_button]:!bg-sage-600 [&_button]:!text-white",
              disabled: "[&_button]:text-stone-300 [&_button]:line-through [&_button]:decoration-stone-200",
              today: "[&_button]:ring-1 [&_button]:ring-stone-300",
            }}
            className="rounded-xl p-3 ring-1 ring-stone-200 [--cell-size:2.6rem]"
          />
          <p className="mt-2 flex items-center justify-center gap-2 text-xs text-stone-500 md:justify-start">
            <span className="h-3 w-3 rounded bg-sage-100 ring-1 ring-sage-300" aria-hidden /> Days with free times
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="font-serif text-lg text-stone-800" suppressHydrationWarning>
              {longLabel}
            </p>
            <p className="text-sm text-stone-500">
              {count} {count === 1 ? "time" : "times"} available
            </p>
          </div>
          {groups.map((g) => (
            <div key={g.label} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{g.label}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {g.slots.map((s) => (
                  <button
                    suppressHydrationWarning
                    key={s.start}
                    type="button"
                    onClick={() => (onDate(current), onSlot(s))}
                    aria-pressed={slot?.startsAt === s.startsAt}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm ring-1 transition",
                      slot?.startsAt === s.startsAt ? "bg-sage-600 font-medium text-white ring-sage-600" : "bg-white text-stone-700 ring-stone-200 hover:bg-sage-50 hover:ring-sage-300",
                    )}
                  >
                    {timeRange(s.startsAt, s.endsAt, tz)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-stone-500">Times are shown in {tzName}. Dates are Perth dates.</p>
    </div>
  );
}
