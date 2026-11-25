"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

const city = (tz: string) => tz.split("/").pop()!.replace(/_/g, " ");

/**
 * A small note at the top of the dashboard: the time zone (and place) this device is in, so it's clear
 * which clock the times on the page use. Drawn after the page loads (it depends on the device), so it
 * never disagrees with the server's HTML.
 */
export function ViewerClock() {
  const [tz, setTz] = useState<string | null>(null);
  useEffect(() => {
    try {
      setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "Australia/Perth");
    } catch {
      setTz("Australia/Perth");
    }
  }, []);
  if (!tz) return <div className="h-5" aria-hidden />;
  return (
    <p className="flex items-center justify-end gap-1.5 text-xs text-stone-500" title="Times on these pages are shown in this time zone">
      <Globe className="h-3.5 w-3.5 text-sage-500" aria-hidden />
      <span>
        <span className="font-medium text-stone-700">{city(tz)}</span> · {tz.replace(/_/g, " ")}
      </span>
    </p>
  );
}
