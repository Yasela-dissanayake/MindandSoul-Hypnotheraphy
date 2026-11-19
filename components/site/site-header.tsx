import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";
import { DesktopNavLinks } from "@/components/site/nav-links";

/** The website's top bar: logo, menu and "Book a Session". Used by the site layout and the 404 page. */
export function SiteHeader() {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {/* <Leaf className="h-8 w-8 text-sage-600" /> */}
            <Image width={64} height={64} src="/logo.jpeg" alt="logo" />
            <h1 className="text-2xl font-serif text-stone-800">
              Heal With Rangika
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <DesktopNavLinks />
            <Link href="/booking">
              <Button className="bg-sage-600 hover:bg-sage-700 text-white">
                Book a Session
              </Button>
            </Link>
          </nav>

          {/* Mobile Navigation */}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
