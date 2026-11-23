"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { formatClassTime, type ClassTime } from "@/lib/class-dates";
import { cn } from "@/lib/utils";

const PERTH = "Australia/Perth";

/**
 * The visitor's own time zone. The page is first drawn in Perth time (the server can't know where they are),
 * then switches to their device's zone, so daylight saving in Sydney, Melbourne etc. is always right.
 */
function useViewerTz(fallback = PERTH) {
  const [tz, setTz] = useState(fallback);
  useEffect(() => {
    try {
      const mine = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (mine) setTz(mine);
    } catch {
      /* keep Perth */
    }
  }, []);
  return tz;
}

const zoneLabel = (tz: string) => (tz === PERTH ? "Perth time" : `your time (${tz.replace(/_/g, " ")})`);

/** Every upcoming class day, in the visitor's time, with the Perth time alongside when it differs. */
export function ClassDates({ dates, note, className }: { dates: ClassTime[]; note?: string | null; className?: string }) {
  const tz = useViewerTz();
  if (dates.length === 0)
    return note ? (
      <p className={cn("flex items-start gap-2 text-sm text-stone-600", className)}>
        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" /> {note}
      </p>
    ) : null;
  const labelled = dates.some((d) => d.label);
  return (
    <div className={cn("space-y-2", className)}>
      <p className="flex items-center gap-2 text-sm font-medium text-stone-800">
        <CalendarDays className="h-4 w-4 text-sage-600" /> Class dates
      </p>
      <ul className="space-y-1.5">
        {dates.map((d, i) => {
          const showLabel = labelled && d.label && d.label !== dates[i - 1]?.label;
          return (
            <li key={d.startsAt + i} className="text-sm">
              {showLabel && <p className="mb-1 mt-2 text-xs font-semibold uppercase tracking-wide text-sage-700">{d.label}</p>}
              <div className="rounded-lg bg-sage-50 px-3 py-2 ring-1 ring-sage-100">
                <p className="font-medium text-stone-800" suppressHydrationWarning>
                  {formatClassTime(d, tz)}
                </p>
                {tz !== PERTH && (
                  <p className="text-xs text-stone-500" suppressHydrationWarning>
                    Perth: {formatClassTime(d, PERTH)}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-stone-500" suppressHydrationWarning>
        Shown in {zoneLabel(tz)}.{tz !== PERTH && " Daylight saving is already taken into account."}
      </p>
      {note && <p className="text-xs text-stone-500">{note}</p>}
    </div>
  );
}

/** One line for a class card: "Starts Sat 14 Dec, 6:00 – 9:00 pm · 2 days" in the visitor's time. */
export function ClassStartLine({ dates, note }: { dates: ClassTime[]; note?: string | null }) {
  const tz = useViewerTz();
  if (dates.length === 0) return note ? <>{note}</> : null;
  return (
    <span suppressHydrationWarning>
      Starts {formatClassTime(dates[0], tz)}
      {dates.length > 1 && ` · ${dates.length} days`}
      {tz !== PERTH ? " (your time)" : " (Perth time)"}
    </span>
  );
}
