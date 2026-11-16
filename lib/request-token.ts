import { createHmac, timingSafeEqual } from "crypto";

// A short-lived signed link that proves which Google account is filling in the
// "Request access" form (they have no account yet, so there's no session).

const TTL_MS = 60 * 60 * 1000; // 1 hour
const secret = () => process.env.AUTH_SECRET ?? "dev";
const sign = (payload: string) => createHmac("sha256", secret()).update(`access-request:${payload}`).digest("base64url");

export function makeRequestToken(email: string): string {
  const payload = Buffer.from(JSON.stringify({ e: email, x: Date.now() + TTL_MS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** The email the link was made for, or null if it's been changed or has expired. */
export function readRequestToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const { e, x } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { e: string; x: number };
    return typeof e === "string" && typeof x === "number" && x > Date.now() ? e : null;
  } catch {
    return null;
  }
}
