import { cookies } from "next/headers";
import { DEFAULT_TZ, isValidTimezone } from "@/lib/dates";
import { getSettings } from "@/lib/settings";

/** Cookie the browser sets with its own time zone (see components/timezone-sync.tsx). */
export const TZ_COOKIE = "tz";

/**
 * The time zone of the person looking at the page, taken from their device.
 * Falls back to the saved time zone until the browser has reported it (the very first visit).
 */
export async function viewerTimezone(fallback?: string | null): Promise<string> {
  const fromDevice = (await cookies()).get(TZ_COOKIE)?.value;
  if (fromDevice && isValidTimezone(fromDevice)) return fromDevice;
  if (fallback && isValidTimezone(fallback)) return fallback;
  const saved = (await getSettings()).adminTimezone;
  return isValidTimezone(saved) ? saved : DEFAULT_TZ;
}
