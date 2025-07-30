"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Leaf } from "lucide-react";
import Image from "next/image";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/testimonials", label: "Testimonials" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden p-2" size="sm">
          <Menu className="h-6 w-6 text-stone-600" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-stone-200">
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={() => setOpen(false)}
            >
              <Image width={64} height={64} src="/logo.jpeg" alt="logo" />
              <span className="text-lg font-serif text-stone-800">
                Heal With Rangika
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-4 mt-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-lg text-stone-600 hover:text-sage-600 transition-colors py-2 px-4 rounded-lg hover:bg-sage-50"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="mt-8 pt-6 border-t border-stone-200">
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
              <p>healwithrangika@gmail.com</p>
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
