"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, LayoutDashboard, Library, LogOut, Menu, Settings, Users, ClipboardList, GraduationCap, ShoppingBag, Inbox, Layers, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { SubmitButton } from "@/components/submit-button";

type Badges = { questions: number; sales: number; enquiries: number };

type Item = { href: string; label: string; icon: typeof Users; also?: string[]; badge?: keyof Badges };
type Group = { group: string; icon: typeof Users; children: Item[] };

const items: (Item | Group)[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/clients", label: "All users", icon: Users },
  {
    group: "Services",
    icon: Layers,
    children: [
      { href: "/admin/sessions", label: "Sessions", icon: ClipboardList, also: ["/admin/plans"], badge: "questions" },
      { href: "/admin/classes", label: "Classes", icon: GraduationCap },
      { href: "/admin/courses", label: "Courses", icon: BookOpen },
    ],
  },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox, badge: "enquiries" },
  { href: "/admin/bookings", label: "Bookings & sales", icon: ShoppingBag, badge: "sales" },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/library", label: "Library", icon: Library },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const badgeLabel = (key: keyof Badges, n: number) =>
  key === "sales"
      ? `${n} new booking${n === 1 ? "" : "s"} or enrolment${n === 1 ? "" : "s"}`
      : key === "enquiries"
        ? `${n} enquir${n === 1 ? "y" : "ies"} waiting for a reply`
      : `${n} question${n === 1 ? "" : "s"} waiting for an answer`;

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
  useEffect(() => setCounts(initial), [initial.questions, initial.sales, initial.enquiries]); // eslint-disable-line react-hooks/exhaustive-deps
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
        setCounts({ questions: j.questions ?? 0, sales: j.sales ?? 0, enquiries: j.enquiries ?? 0 });
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

export function AdminNav({ name, logout, badges = { questions: 0, sales: 0, enquiries: 0 } }: { name: string; logout: () => Promise<void>; badges?: Badges }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const counts = useBadges(badges, pathname);
  const waiting = counts.questions + counts.sales + counts.enquiries;
  const active = (i: Item) =>
    i.href === "/admin" ? pathname === i.href : [i.href, ...(i.also ?? [])].some((h) => pathname.startsWith(h));
  // Groups start open; one you're inside always stays open. Closing one is remembered on this device.
  const [closed, setClosed] = useState<string[]>([]);
  useEffect(() => {
    try {
      setClosed(JSON.parse(localStorage.getItem("admin-nav-closed") ?? "[]"));
    } catch {}
  }, []);
  const toggle = (g: string) =>
    setClosed((c) => {
      const next = c.includes(g) ? c.filter((x) => x !== g) : [...c, g];
      try {
        localStorage.setItem("admin-nav-closed", JSON.stringify(next));
      } catch {}
      return next;
    });

  const link = (i: Item, nested = false) => (
    <Link
      key={i.href}
      href={i.href}
      onClick={() => setOpen(false)}
      className={cn(
        "flex items-center gap-3 rounded-lg py-2.5 pr-3 text-sm transition-colors",
        nested ? "pl-9" : "pl-3",
        active(i) ? "bg-sage-100 font-medium text-sage-800" : "text-stone-600 hover:bg-stone-100",
      )}
    >
      <i.icon className="h-4 w-4" />
      <span className="flex-1">{i.label}</span>
      {i.badge && <CountBadge count={counts[i.badge]} label={badgeLabel(i.badge, counts[i.badge])} />}
    </Link>
  );

  const links = (
    <nav className="flex flex-col gap-1">
      {items.map((i) => {
        if (!("group" in i)) return link(i);
        const inside = i.children.some(active);
        const isOpen = inside || !closed.includes(i.group);
        const hidden = i.children.reduce((n, c) => n + (c.badge ? counts[c.badge] : 0), 0);
        return (
          <div key={i.group}>
            <button suppressHydrationWarning
              type="button"
              onClick={() => !inside && toggle(i.group)}
              aria-expanded={isOpen}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-stone-100",
                inside ? "font-medium text-sage-800" : "text-stone-600",
              )}
            >
              <i.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{i.group}</span>
              {!isOpen && <CountBadge count={hidden} label={`${hidden} waiting in ${i.group}`} />}
              <ChevronDown className={cn("h-4 w-4 text-stone-400 transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen && <div className="mt-1 flex flex-col gap-1">{i.children.map((c) => link(c, true))}</div>}
          </div>
        );
      })}
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
