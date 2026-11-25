"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Leaf } from "lucide-react";
import Image from "next/image";
import { navFor, useIsActive, useIsItemActive } from "@/components/site/nav-links";
import { Avatar, SignOutItem, accountLinks } from "@/components/site/account-menu";
import type { SiteViewer } from "@/lib/site-viewer";

export function MobileNav({ viewer = null }: { viewer?: SiteViewer | null }) {
  const [open, setOpen] = useState(false);
  const isActive = useIsActive();
  const isItemActive = useIsItemActive();

  const navItems = [{ href: "/", label: "Home" }, ...navFor(Boolean(viewer))];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="xl:hidden p-2" size="sm">
          <Menu className="h-6 w-6 text-stone-600" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] overflow-y-auto sm:w-[400px]">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-stone-200">
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={() => setOpen(false)}
            >
              <Image width={48} height={48} src="/brand/logo-mark.png" alt="Mind & Soul Works logo" className="rounded-xl" />
              <span className="font-brand text-lg font-medium text-sage-700">
                Mind & Soul Works
              </span>
            </Link>
          </div>

          {/* Signed in: who they are, their space and profile, and Sign out */}
          {viewer && (
            <div className="mt-5 shrink-0 space-y-1 rounded-2xl bg-sage-50 p-3 ring-1 ring-sage-200">
              <div className="flex items-center gap-3 px-1 pb-2">
                <Avatar viewer={viewer} size={40} />
                <div className="min-w-0">
                  <p className="truncate font-medium text-stone-800">{viewer.name || viewer.firstName || "Signed in"}</p>
                  <p className="truncate text-xs text-stone-500">{viewer.email}</p>
                </div>
              </div>
              {accountLinks(viewer).map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-base text-stone-700 transition hover:bg-white hover:text-sage-800"
                >
                  <l.icon className="h-4 w-4 text-sage-600" aria-hidden /> {l.label}
                </Link>
              ))}
              <SignOutItem className="h-auto py-2.5 text-base hover:bg-white" />
            </div>
          )}

          {/* Navigation Links */}
          <nav className="mt-6 flex shrink-0 flex-col space-y-1">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.href} className="space-y-1">
                  <p className={`px-4 pt-2 pb-1 text-lg ${isItemActive(item) ? "font-medium text-sage-800" : "text-stone-600"}`}>{item.label}</p>
                  {item.children.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      aria-current={isActive(c.href, true) ? "page" : undefined}
                      className={`ml-4 block rounded-lg border-l-4 py-2 pl-4 pr-3 text-base transition-colors ${
                        isActive(c.href, true)
                          ? "border-sage-600 bg-sage-50 font-medium text-sage-800"
                          : "border-stone-200 text-stone-600 hover:bg-sage-50 hover:text-sage-600"
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`text-lg transition-colors py-2 px-4 rounded-lg border-l-4 ${
                    isActive(item.href)
                      ? "border-sage-600 bg-sage-50 font-medium text-sage-800"
                      : "border-transparent text-stone-600 hover:text-sage-600 hover:bg-sage-50"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          {/* CTA Button */}
          <div className="mt-6 pt-6 border-t border-stone-200">
            <Link href="/booking" onClick={() => setOpen(false)}>
              <Button className="w-full bg-sage-600 hover:bg-sage-700 text-white">
                Book Session
              </Button>
            </Link>
          </div>

          {/* Contact Info */}
          <div className="mt-auto pt-8 space-y-3 text-sm text-stone-600">
            <div>
              <p className="font-medium text-stone-800">Contact</p>
              <p>+61 429 940 130</p>
              <p>mindandsoulworks@gmail.com</p>
              <p>Perth, Western Australia</p>
            </div>
            <div>
              <p className="font-medium text-stone-800">Hours</p>
              <p>Mon-Sat: 8AM-6.30PM</p>
              {/* <p>Sat: 9AM-2PM</p> */}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
