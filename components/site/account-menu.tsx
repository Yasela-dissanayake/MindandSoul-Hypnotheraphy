"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut, Sparkles, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutToHome } from "@/app/account-actions";
import { SubmitButton } from "@/components/submit-button";
import type { SiteViewer } from "@/lib/site-viewer";

/** Their initials in a circle (or their Google photo). */
export function Avatar({ viewer, size = 32 }: { viewer: SiteViewer; size?: number }) {
  // First letters of their first and last name (letters only, so "Anne (Annie) Smith" gives "AS").
  const words = (viewer.name ?? "").split(/\s+/).map((w) => w.replace(/[^\p{L}]/gu, "")).filter(Boolean);
  const initials = ((words[0]?.[0] ?? "") + (words.length > 1 ? words[words.length - 1][0] : "") || viewer.email[0] || "?").toUpperCase();
  if (viewer.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={viewer.image} alt="" width={size} height={size} referrerPolicy="no-referrer" className="shrink-0 rounded-full object-cover ring-2 ring-white" style={{ width: size, height: size }} />;
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-sage-700 font-medium text-brand-cream ring-2 ring-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

/** The links for a signed-in person: their own space and profile (Rangika: her dashboard and settings). */
export function accountLinks(viewer: SiteViewer) {
  return viewer.role === "ADMIN"
    ? [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/settings", label: "My profile & settings", icon: UserRound },
      ]
    : [
        { href: "/portal", label: "My space", icon: Sparkles },
        { href: "/portal/profile", label: "My profile", icon: UserRound },
      ];
}

/** "Sign out" as a form, so it works even before the page's scripts have loaded. */
export function SignOutItem({ className }: { className?: string }) {
  return (
    <form action={signOutToHome}>
      <SubmitButton
        variant="ghost"
        pendingText="Signing out…"
        className={cn("w-full justify-start gap-3 rounded-xl px-3 font-normal text-stone-700 hover:bg-red-50 hover:text-red-700", className)}
      >
        <LogOut className="h-4 w-4" aria-hidden /> Sign out
      </SubmitButton>
    </form>
  );
}

/** In the website's top bar instead of "Client login" when someone is signed in: their name, with a menu. */
export function AccountMenu({ viewer }: { viewer: SiteViewer }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        suppressHydrationWarning
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn("flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-stone-700 transition hover:bg-sage-50", open && "bg-sage-50")}
      >
        <Avatar viewer={viewer} />
        <span className="max-w-[9rem] truncate text-[15px] font-medium">{viewer.firstName || "My account"}</span>
        <ChevronDown className={cn("h-4 w-4 text-stone-400 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl bg-white p-2 shadow-lg ring-1 ring-stone-200">
          <div className="flex items-center gap-3 px-3 pb-3 pt-2">
            <Avatar viewer={viewer} size={40} />
            <div className="min-w-0">
              <p className="truncate font-medium text-stone-800">{viewer.name || viewer.firstName || "Signed in"}</p>
              <p className="truncate text-xs text-stone-500">{viewer.email}</p>
            </div>
          </div>
          <div className="border-t border-stone-100 pt-1">
            {accountLinks(viewer).map((l) => (
              <Link key={l.href} href={l.href} role="menuitem" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-700 transition hover:bg-sage-50 hover:text-sage-800">
                <l.icon className="h-4 w-4 text-sage-600" aria-hidden /> {l.label}
              </Link>
            ))}
          </div>
          <div className="mt-1 border-t border-stone-100 pt-1">
            <SignOutItem className="h-auto py-2.5 text-sm" />
          </div>
        </div>
      )}
    </div>
  );
}
