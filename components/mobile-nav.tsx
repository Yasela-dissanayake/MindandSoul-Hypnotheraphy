"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Leaf } from "lucide-react";
import Image from "next/image";
import { SITE_NAV, useIsActive, useIsItemActive } from "@/components/site/nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const isActive = useIsActive();
  const isItemActive = useIsItemActive();

  const navItems = [{ href: "/", label: "Home" }, ...SITE_NAV];

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

          {/* Navigation Links */}
          <nav className="mt-6 flex flex-col space-y-1 overflow-y-auto">
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
