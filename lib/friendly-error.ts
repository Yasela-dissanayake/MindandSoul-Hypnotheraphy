// Turns any error into a sentence a visitor can understand, so nobody ever sees
// "Failed to fetch", "Unexpected token <" or a Next.js internal message.
//
// Messages we wrote on purpose (e.g. "That time was just taken", or Stripe's "Your card was declined")
// are plain `Error`s with a readable message, and they are shown as they are.
// Everything technical is replaced with a calm, helpful sentence.

export const OFFLINE_MESSAGE = "You seem to be offline. Please check your internet connection and try again.";
export const NETWORK_MESSAGE = "We couldn't reach the server. Please check your internet connection and try again.";
export const UPDATED_MESSAGE = "The website has just been updated. Please refresh the page and try again.";
export const GENERIC_MESSAGE = "Something went wrong on our side. Please try again in a moment.";

const isOffline = () => typeof navigator !== "undefined" && navigator.onLine === false;

/** Words that only ever appear in technical messages, never in ones written for people. */
const TECHNICAL =
  /failed to fetch|networkerror|network request failed|load failed|fetch failed|unexpected token|unexpected end of|json|cannot read propert|is not a function|is not defined|server components render|digest|prisma|ECONN|ETIMEDOUT|NEXT_|stack trace|chunk|module not found|webpack|turbopack|internal server error|(status|error|code)\s*5\d\d/i;

/** The kind of problem, for choosing an icon and title on error screens. */
export function errorKind(e: unknown): "offline" | "network" | "updated" | "other" {
  if (isOffline()) return "offline";
  const msg = e instanceof Error ? `${e.name} ${e.message}` : String(e ?? "");
  if (/failed to find server action|ChunkLoadError|loading chunk|dynamically imported module|importing a module script failed/i.test(msg)) return "updated";
  if (e instanceof TypeError && /fetch|network|load failed/i.test(e.message)) return "network";
  if (/failed to fetch|networkerror|network request failed|load failed|fetch failed|ERR_NETWORK|ERR_INTERNET_DISCONNECTED/i.test(msg)) return "network";
  if (e instanceof DOMException && e.name === "AbortError") return "network";
  return "other";
}

/** A message that's safe and helpful to show to anyone. `fallback` is used for unexpected technical errors. */
export function friendlyError(e: unknown, fallback = GENERIC_MESSAGE): string {
  const kind = errorKind(e);
  if (kind === "offline") return OFFLINE_MESSAGE;
  if (kind === "network") return NETWORK_MESSAGE;
  if (kind === "updated") return UPDATED_MESSAGE;
  // Only plain Errors carry messages written for people. TypeError, SyntaxError etc. are always technical.
  if (e instanceof Error && e.constructor === Error) {
    const m = e.message.trim();
    if (m && m.length <= 300 && !TECHNICAL.test(m)) return m;
  }
  if (typeof e === "string" && e.trim() && e.length <= 300 && !TECHNICAL.test(e)) return e;
  return fallback;
}

/** Reads a JSON reply safely: an HTML error page or an empty reply gives {} instead of a crash. */
export async function readJson<T = Record<string, unknown>>(res: Response): Promise<Partial<T> & { error?: string }> {
  try {
    return (await res.json()) as Partial<T> & { error?: string };
  } catch {
    return {};
  }
}
