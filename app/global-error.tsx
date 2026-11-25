"use client";

import { useEffect, useState } from "react";
import { fixedByReload, reloadOnce } from "@/lib/friendly-error";
import "./globals.css";

// The very last safety net: if even the main layout fails, show a calm page (with its own <html>),
// never the browser's or Next.js's bare "Application error" screen. Kept simple so it can't fail itself.
//
// Problems a fresh load fixes (the website was updated while the page was open, or the page's HTML and
// scripts didn't match) are fixed quietly: the page reloads once and the visitor just sees it load.
//
// Note: Next.js only uses this page on the live website. While developing (pnpm dev) it shows its own
// error overlay and "Application error" text instead.
export default function GlobalError({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  const [recovering, setRecovering] = useState(() => fixedByReload(error));
  const offline = typeof navigator !== "undefined" && navigator.onLine === false;

  useEffect(() => {
    console.error(error);
    if (fixedByReload(error) && reloadOnce()) return; // reloading: keep showing "Loading…"
    setRecovering(false);
    // Back online: try again by itself.
    const onOnline = () => window.location.reload();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", background: "#faf8f2", color: "#292524" }}>
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          {recovering ? (
            <p role="status" style={{ color: "#78716c", fontSize: 15 }}>
              Loading…
            </p>
          ) : (
            <div role="alert" style={{ maxWidth: 480, textAlign: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-mark.png" alt="Mind & Soul Works" width={56} height={56} style={{ borderRadius: 12, margin: "0 auto 20px" }} />
              <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 400, margin: "0 0 12px" }}>{offline ? "You're offline" : "Something went wrong"}</h1>
              <p style={{ color: "#57534e", lineHeight: 1.6, margin: "0 0 24px" }}>
                {offline
                  ? "Please check your internet connection. The page will load again by itself once you're back online."
                  : "The page didn't load properly. It's not something you did. Please try again in a moment."}
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => window.location.reload()}
                  style={{ background: "#1f4529", color: "white", border: 0, borderRadius: 8, padding: "10px 20px", fontSize: 15, cursor: "pointer" }}
                >
                  Try again
                </button>
                <a href="/" style={{ border: "1px solid #b9c0a6", color: "#0e2a16", borderRadius: 8, padding: "9px 20px", fontSize: 15, textDecoration: "none" }}>
                  Back to home
                </a>
              </div>
              {error.digest && !offline && <p style={{ marginTop: 20, fontSize: 12, color: "#a8a29e" }}>Reference: {error.digest}</p>}
            </div>
          )}
        </main>
      </body>
    </html>
  );
}
