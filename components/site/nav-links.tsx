"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// The website's menu, shared by the top bar and the mobile menu, so both show which page you're on.

export const SITE_NAV = [
  { href: "/about", label: "About" },
  { href: "/sessions", label: "Sessions" },
  { href: "/classes", label: "Classes" },
  { href: "/courses", label: "Courses" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Client login" },
];

/** True on the page itself and on its sub-pages (e.g. /classes/reiki-level-1 lights up "Classes"). */
export function useIsActive() {
  const pathname = usePathname() ?? "/";
  return (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));
}

/** Top-bar links: the current page is green with a short green underline. */
export function DesktopNavLinks() {
  const isActive = useIsActive();
  return (
    <>
      {SITE_NAV.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative py-1 transition-colors",
              // the underline: a thin bar under the word, grows in on hover, stays on the current page
              "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-sage-600 after:transition-transform after:duration-200",
              active ? "font-medium text-sage-700 after:scale-x-100" : "text-stone-600 after:scale-x-0 hover:text-sage-600 hover:after:scale-x-100",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
