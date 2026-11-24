"use client";

import "./globals.css";

// The very last safety net: if even the main layout fails, show a calm page (with its own <html>),
// never the browser's or Next.js's bare error screen. Kept simple so it can't fail itself.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const offline = typeof navigator !== "undefined" && navigator.onLine === false;
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", background: "#f6f7f6", color: "#292524" }}>
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div role="alert" style={{ maxWidth: 480, textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-mark.png" alt="Mind & Soul Works" width={56} height={56} style={{ borderRadius: 12, margin: "0 auto 20px" }} />
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 400, margin: "0 0 12px" }}>
              {offline ? "You're offline" : "Something went wrong"}
            </h1>
            <p style={{ color: "#57534e", lineHeight: 1.6, margin: "0 0 24px" }}>
              {offline
                ? "Please check your internet connection, then try again."
                : "The website didn't load properly. It's not something you did. Please try again in a moment."}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => (offline ? window.location.reload() : reset())}
                style={{ background: "#485a48", color: "white", border: 0, borderRadius: 8, padding: "10px 20px", fontSize: 15, cursor: "pointer" }}
              >
                Try again
              </button>
              <a href="/" style={{ border: "1px solid #a3b2a3", color: "#323d32", borderRadius: 8, padding: "9px 20px", fontSize: 15, textDecoration: "none" }}>
                Back to home
              </a>
            </div>
            {error.digest && !offline && <p style={{ marginTop: 20, fontSize: 12, color: "#a8a29e" }}>Reference: {error.digest}</p>}
          </div>
        </main>
      </body>
    </html>
  );
}
