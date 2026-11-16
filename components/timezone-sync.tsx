"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { syncMyTimezone } from "@/app/account-actions";

/**
 * Tells the server which time zone this device is in, so every time on the page is shown in
 * the viewer's own time. Runs when the page opens; refreshes the page only if something changed.
 */
export function TimezoneSync({ saved }: { saved: string }) {
  const router = useRouter();
  useEffect(() => {
    let tz = "";
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return;
    }
    const cookie = document.cookie.match(/(?:^|; )tz=([^;]*)/)?.[1];
    if (!tz || (tz === saved && decodeURIComponent(cookie ?? "") === tz)) return;
    syncMyTimezone(tz)
      .then((r) => r.changed && router.refresh())
      .catch(() => {});
  }, [saved, router]);
  return null;
}
