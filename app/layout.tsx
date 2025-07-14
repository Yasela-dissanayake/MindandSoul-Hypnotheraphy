import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";
import { Leaf } from "lucide-react";

export const metadata: Metadata = {
  title: "Heal With Rangika Hypnotherapy",
  description: "Professional hypnotherapy services in Australia",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <Leaf className="h-8 w-8 text-sage-600" />
                <h1 className="text-2xl font-serif text-stone-800">
                  Mind and Soul
                </h1>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-8">
                <Link
                  href="/about"
                  className="text-stone-600 hover:text-sage-600 transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/services"
                  className="text-stone-600 hover:text-sage-600 transition-colors"
                >
                  Services
                </Link>
                <Link
                  href="/testimonials"
                  className="text-stone-600 hover:text-sage-600 transition-colors"
                >
                  Testimonials
                </Link>
                <Link
                  href="/contact"
                  className="text-stone-600 hover:text-sage-600 transition-colors"
                >
                  Contact
                </Link>
                <Link href="/booking">
                  <Button className="bg-sage-600 hover:bg-sage-700 text-white">
                    Book Session
                  </Button>
                </Link>
              </nav>

              {/* Mobile Navigation */}
              <MobileNav />
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
