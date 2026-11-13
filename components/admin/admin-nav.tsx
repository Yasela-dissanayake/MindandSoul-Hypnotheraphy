"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, Library, LogOut, Menu, Settings, Users, ClipboardList, UserCheck, GraduationCap } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { SubmitButton } from "@/components/submit-button";

type Badges = { requests: number; questions: number };

const items: { href: string; label: string; icon: typeof Users; also?: string[]; badge?: keyof Badges }[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/clients", label: "All users", icon: Users },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/requests", label: "Access requests", icon: UserCheck, badge: "requests" },
  { href: "/admin/sessions", label: "Sessions", icon: ClipboardList, also: ["/admin/plans"], badge: "questions" },
  { href: "/admin/courses", label: "Courses", icon: GraduationCap },
  { href: "/admin/library", label: "Library", icon: Library },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const badgeLabel = (key: keyof Badges, n: number) =>
  key === "requests" ? `${n} access request${n === 1 ? "" : "s"} waiting` : `${n} question${n === 1 ? "" : "s"} waiting for an answer`;

/** Red circle with a number. Nothing at all when the count is 0. */
function CountBadge({ count, label }: { count: number; label: string }) {
  if (count <= 0) return null;
  return (
    <span
      className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-semibold leading-none text-white"
      aria-label={label}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** Keeps the badge numbers fresh: every 30 s, on page change, and when the tab is shown again. */
function useBadges(initial: Badges, pathname: string) {
  const [counts, setCounts] = useState(initial);
  useEffect(() => setCounts(initial), [initial.requests, initial.questions]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    let stop = false;
    const load = async () => {
      if (stop) return;
      try {
        const res = await fetch("/api/admin/badges", { cache: "no-store" });
        // Signed out (or signed in as a client in another tab): stop asking until the page reloads.
        if (res.status === 404 || res.status === 401) {
          stop = true;
          clearInterval(timer);
          return;
        }
        if (!res.ok || stop) return;
        const j = await res.json();
        setCounts({ requests: j.requests ?? 0, questions: j.questions ?? 0 });
      } catch {}
    };
    void load();
    const timer = setInterval(load, 30_000);
    const onShow = () => document.visibilityState === "visible" && void load();
    document.addEventListener("visibilitychange", onShow);
    return () => {
      stop = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, [pathname]);
  return counts;
}

export function AdminNav({ name, logout, badges = { requests: 0, questions: 0 } }: { name: string; logout: () => Promise<void>; badges?: Badges }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const counts = useBadges(badges, pathname);
  const waiting = counts.requests + counts.questions;
  const active = (i: (typeof items)[number]) =>
    i.href === "/admin" ? pathname === i.href : [i.href, ...(i.also ?? [])].some((h) => pathname.startsWith(h));

  const links = (
    <nav className="flex flex-col gap-1">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
            active(i) ? "bg-sage-100 font-medium text-sage-800" : "text-stone-600 hover:bg-stone-100",
          )}
        >
          <i.icon className="h-4 w-4" />
          <span className="flex-1">{i.label}</span>
          {i.badge && <CountBadge count={counts[i.badge]} label={badgeLabel(i.badge, counts[i.badge])} />}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="space-y-2 border-t border-stone-200 pt-4 text-sm">
      <p className="truncate px-3 text-stone-500">{name}</p>
      <Link href="/" className="block rounded-lg px-3 py-2 text-stone-600 hover:bg-stone-100">
        View website
      </Link>
      <form action={logout}>
        <SubmitButton variant="ghost" className="w-full justify-start gap-2 px-3 font-normal text-stone-600" pendingText="Signing out…">
          <LogOut className="h-4 w-4" /> Sign out
        </SubmitButton>
      </form>
    </div>
  );

  const brand = (
    <Link href="/admin" className="flex items-center gap-2">
      <Image src="/logo.jpeg" alt="" width={32} height={32} className="rounded-full" />
      <span className="font-serif text-lg text-stone-800">Dashboard</span>
    </Link>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between border-r border-stone-200 bg-white p-4 md:flex">
        <div className="space-y-6">
          {brand}
          {links}
        </div>
        {footer}
      </aside>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 md:hidden">
        {brand}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="relative rounded-lg p-2 text-stone-600 hover:bg-stone-100" aria-label={waiting > 0 ? `Menu, ${waiting} waiting for you` : "Menu"}>
            <Menu className="h-5 w-5" />
            {waiting > 0 && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" aria-hidden />}
          </SheetTrigger>
          <SheetContent side="left" className="flex w-72 flex-col justify-between">
            <div className="space-y-6">
              <SheetTitle className="font-serif">Heal With Rangika</SheetTitle>
              {links}
            </div>
            {footer}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
