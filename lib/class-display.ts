import { classPrice, type Currency } from "@/lib/currency";

// Shared by the Classes list and the class page: what a bundle saves compared with
// buying its classes one by one, in the price shown to the visitor.

type Priced = { price: number; priceAed: number | null };

/** Amount saved (cents/fils) by the bundle, or null when it isn't a bundle or nothing is saved. */
export function bundleSaving(bundle: Priced & { includes: Priced[] }, currency: Currency): number | null {
  if (bundle.includes.length === 0) return null;
  const own = classPrice(bundle, currency);
  const parts = bundle.includes.map((c) => classPrice(c, currency));
  if (parts.some((p) => p.currency !== own.currency)) return null; // can't compare different currencies
  const saving = parts.reduce((sum, p) => sum + p.amount, 0) - own.amount;
  return saving > 0 ? saving : null;
}

/** "What you'll explore" lines (one per line in the admin box; leading "-" or "•" removed). */
export function highlightLines(text: string | null) {
  return (text ?? "")
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean);
}
