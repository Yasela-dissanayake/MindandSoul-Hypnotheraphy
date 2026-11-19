import { cookies, headers } from "next/headers";
import { TZ_COOKIE } from "@/lib/viewer-tz";

// Class prices are shown (and paid) in AED to visitors in the UAE, and in AUD to everyone else.
// Order of checks: the visitor's own choice (AUD/AED switch) → the country the hosting provider
// detects from their connection → their device time zone (Asia/Dubai) → AUD.

export type Currency = "aud" | "aed";
export const CURRENCY_COOKIE = "currency";

export function isCurrency(v: unknown): v is Currency {
  return v === "aud" || v === "aed";
}

/** Country code from the hosting provider's location headers (Netlify, Vercel, Cloudflare). */
function countryFromHeaders(h: Headers): string | null {
  const direct = h.get("x-country") || h.get("x-vercel-ip-country") || h.get("cf-ipcountry");
  if (direct) return direct.toUpperCase();
  // Netlify: JSON, sometimes base64-encoded, e.g. {"country":{"code":"AE",...},...}
  const geo = h.get("x-nf-geo");
  if (geo) {
    for (const text of [geo, safeBase64(geo)]) {
      try {
        const code = JSON.parse(text ?? "")?.country?.code;
        if (typeof code === "string") return code.toUpperCase();
      } catch {}
    }
  }
  return null;
}

function safeBase64(s: string) {
  try {
    return Buffer.from(s, "base64").toString("utf8");
  } catch {
    return null;
  }
}

/** The currency to show prices in for the person viewing the page. */
export async function viewerCurrency(): Promise<Currency> {
  const c = await cookies();
  const chosen = c.get(CURRENCY_COOKIE)?.value;
  if (isCurrency(chosen)) return chosen;
  const country = countryFromHeaders(await headers());
  if (country) return country === "AE" ? "aed" : "aud";
  return c.get(TZ_COOKIE)?.value === "Asia/Dubai" ? "aed" : "aud";
}

/** A class's price in the wanted currency (AUD when it has no AED price). Amounts in cents/fils. */
export function classPrice(c: { price: number; priceAed: number | null }, currency: Currency): { amount: number; currency: Currency } {
  if (currency === "aed" && c.priceAed && c.priceAed >= 200) return { amount: c.priceAed, currency: "aed" };
  return { amount: c.price, currency: "aud" };
}

/** "AUD 325" / "AED 1,600" (cents only when there are some, e.g. "AUD 99.50"). */
export function formatPrice(amount: number, currency: string) {
  const value = amount / 100;
  const text = value.toLocaleString("en-AU", { minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2 });
  return `${currency.toUpperCase()} ${text}`;
}
