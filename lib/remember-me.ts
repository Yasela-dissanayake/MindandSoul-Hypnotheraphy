import { cookies } from "next/headers";

// "Remember me" on the login page.
// - Ticked: they stay signed in for REMEMBER_HOURS (30 days).
// - Not ticked: the sign-in cookie is a browser-session cookie (gone when the browser closes),
//   and the session also ends after SHORT_SESSION_HOURS even if the browser stays open.
// The choice is kept in its own small cookie so the Google sign-in (which leaves the site and
// comes back) knows it too.

export const REMEMBER_COOKIE = "hwr-remember";
export const REMEMBER_HOURS = 24 * 30; // 30 days
export const SHORT_SESSION_HOURS = 12;

/** The Auth.js sign-in cookie (and its chunks when it's large), on http and https. */
const SESSION_COOKIE = /^(__Secure-)?authjs\.session-token(\.\d+)?$/;
export const isSessionCookie = (name: string) => SESSION_COOKIE.test(name);

/** Save the visitor's choice just before signing in. */
export async function saveRememberChoice(remember: boolean) {
  (await cookies()).set(REMEMBER_COOKIE, remember ? "1" : "0", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Kept as long as the sign-in it belongs to.
    ...(remember ? { maxAge: REMEMBER_HOURS * 60 * 60 } : {}),
  });
}

/** Whether the person signing in right now ticked "Remember me" (older sign-ins count as remembered). */
export async function rememberChoice(): Promise<boolean> {
  try {
    return (await cookies()).get(REMEMBER_COOKIE)?.value !== "0";
  } catch {
    return true; // not in a request (shouldn't happen when signing in)
  }
}

/** After a password sign-in without "Remember me": turn the new sign-in cookie into a browser-session cookie. */
export async function makeSessionCookiesTemporary() {
  const store = await cookies();
  for (const c of store.getAll()) {
    if (!isSessionCookie(c.name) || !c.value) continue;
    store.set(c.name, c.value, { httpOnly: true, sameSite: "lax", path: "/", secure: c.name.startsWith("__Secure-") });
  }
}

/** Removes Expires / Max-Age from a Set-Cookie line, so the browser forgets it when it closes. */
function withoutExpiry(line: string) {
  return line
    .split(";")
    .filter((part) => !/^\s*(expires|max-age)\s*=/i.test(part))
    .join(";");
}

/**
 * For the Auth.js routes (the Google sign-in comes back through them): when the visitor didn't tick
 * "Remember me", the sign-in cookie they set becomes a browser-session cookie. Sign-out cookies
 * (which delete the sign-in) are left alone.
 */
export function applyRememberChoice(req: Request & { cookies?: { get(name: string): { value: string } | undefined } }, res: Response) {
  if (req.cookies?.get(REMEMBER_COOKIE)?.value !== "0") return res;
  const lines = res.headers.getSetCookie();
  const isSignIn = (line: string) => {
    const [pair] = line.split(";");
    const name = pair.slice(0, pair.indexOf("=")).trim();
    const value = pair.slice(pair.indexOf("=") + 1).trim();
    return isSessionCookie(name) && value !== "" && !/max-age\s*=\s*0\b/i.test(line);
  };
  if (!lines.some(isSignIn)) return res;
  const headers = new Headers(res.headers);
  headers.delete("set-cookie");
  for (const line of lines) headers.append("set-cookie", isSignIn(line) ? withoutExpiry(line) : line);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}
