"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// The website's menu, shared by the top bar and the mobile menu, so both show which page you're on.
// The four service tabs: Clinical Hypnotherapy, Reiki Energy Healing, Reiki Training (Reiki / Animal Reiki), Courses,
// then "About" (About Rangika, Testimonials, Contact) and Client login.

export type NavItem = { href: string; label: string; children?: { href: string; label: string; text?: string }[] };

export const SITE_NAV: NavItem[] = [
  { href: "/hypnotherapy", label: "Clinical Hypnotherapy" },
  { href: "/reiki-healing", label: "Reiki Energy Healing" },
  {
    href: "/reiki-training",
    label: "Reiki Training",
    children: [
      { href: "/reiki-training", label: "Reiki", text: "Usui Reiki Level 1, 2 & 3" },
      { href: "/reiki-training/animal", label: "Animal Reiki", text: "Animal Reiki & Communication training" },
    ],
  },
  { href: "/courses", label: "Courses" },
  {
    href: "/about",
    label: "About",
    children: [
      { href: "/about", label: "About Rangika", text: "Her story, qualifications and approach" },
      { href: "/testimonials", label: "Testimonials", text: "Stories from clients and students" },
      { href: "/contact", label: "Contact", text: "Send an enquiry or get in touch" },
    ],
  },
  { href: "/login", label: "Client login" },
];

/** True on the page itself and on its sub-pages (e.g. /hypnotherapy/smoking-cessation lights up "Clinical Hypnotherapy"). */
export function useIsActive() {
  const pathname = usePathname() ?? "/";
  return (href: string, exact = false) =>
    href === "/" || exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

/** A menu item is lit up on its own page or on any page in its dropdown (e.g. "About" on /contact). */
export function useIsItemActive() {
  const isActive = useIsActive();
  return (item: NavItem) => isActive(item.href) || Boolean(item.children?.some((c) => isActive(c.href)));
}

const linkClass = (active: boolean) =>
  cn(
    "relative whitespace-nowrap py-1 transition-colors",
    // the underline: a thin bar under the word, grows in on hover, stays on the current page
    "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-sage-600 after:transition-transform after:duration-200",
    active ? "font-medium text-sage-700 after:scale-x-100" : "text-stone-600 after:scale-x-0 hover:text-sage-600 hover:after:scale-x-100",
  );

/** Top-bar links: the current page is green with a short green underline. */
export function DesktopNavLinks() {
  const isActive = useIsActive();
  const isItemActive = useIsItemActive();
  return (
    <>
      {SITE_NAV.map((item) =>
        item.children ? (
          <NavDropdown key={item.href} item={item} active={isItemActive(item)} />
        ) : (
          <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className={linkClass(isActive(item.href))}>
            {item.label}
          </Link>
        ),
      )}
    </>
  );
}

/** "Reiki Training ▾" and "About ▾": open on hover, click or keyboard; closes on Escape, outside click or leaving. */
function NavDropdown({ item, active }: { item: NavItem; active: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isActive = useIsActive();

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
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        suppressHydrationWarning
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className={cn(linkClass(active), "inline-flex items-center gap-1")}
      >
        {item.label}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        // pt-3 keeps the pointer inside while moving down from the button
        <div className="absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 pt-3">
          <div className="overflow-hidden rounded-2xl bg-white p-2 shadow-lg ring-1 ring-stone-200">
            {item.children!.map((c) => {
              const here = isActive(c.href, true);
              return (
                <Link
                  key={c.href}
                  href={c.href}
                  aria-current={here ? "page" : undefined}
                  className={cn("block rounded-xl px-4 py-3 transition-colors", here ? "bg-sage-50" : "hover:bg-stone-50")}
                >
                  <span className={cn("block font-medium", here ? "text-sage-800" : "text-stone-800")}>{c.label}</span>
                  {c.text && <span className="mt-0.5 block text-xs text-stone-500">{c.text}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
