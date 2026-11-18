import Link from "next/link";
import { ArrowLeft, BookOpen, GraduationCap, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Area = "site" | "portal" | "admin";

const HOME: Record<Area, { href: string; label: string }> = {
  site: { href: "/", label: "Back to home" },
  portal: { href: "/portal", label: "Back to Today" },
  admin: { href: "/admin", label: "Back to Overview" },
};

const SITE_LINKS = [
  { href: "/sessions", label: "Sessions", text: "Hypnotherapy, Reiki and energy healing", icon: Sparkles },
  { href: "/classes", label: "Classes", text: "Reiki classes taught by Rangika", icon: GraduationCap },
  { href: "/courses", label: "Courses", text: "Self-paced courses to learn at home", icon: BookOpen },
  { href: "/contact", label: "Contact", text: "Ask a question or book a free chat", icon: Mail },
];

const MESSAGE: Record<Area, string> = {
  site: "The page you're looking for may have moved, or the link might be out of date. Let's get you back on your path.",
  portal: "This page isn't in your space. It may have moved, or it's something you don't have access to yet.",
  admin: "This page doesn't exist or the item has been deleted. Use the menu to find what you need.",
};

/** The friendly "page not found" message, shared by the website, client portal and admin 404 pages. */
export function NotFoundContent({ area = "site" }: { area?: Area }) {
  const home = HOME[area];
  return (
    <section className={area === "site" ? "bg-gradient-to-b from-sage-50 to-white px-4 py-16 md:py-24" : "py-10 md:py-16"}>
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-serif text-7xl text-sage-300 md:text-8xl" aria-hidden>
          404
        </p>
        <h1 className="mt-4 font-serif text-3xl text-stone-800 md:text-4xl">This page can&apos;t be found</h1>
        <p className="mx-auto mt-3 max-w-lg text-stone-600">{MESSAGE[area]}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="bg-sage-600 text-white hover:bg-sage-700">
            <Link href={home.href}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {home.label}
            </Link>
          </Button>
          {area === "site" && (
            <Button asChild variant="outline" className="border-sage-300 text-sage-800 hover:bg-sage-50">
              <Link href="/booking">Book a session</Link>
            </Button>
          )}
        </div>
      </div>

      {area === "site" && (
        <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SITE_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group rounded-2xl bg-white p-5 text-left ring-1 ring-stone-200 transition hover:ring-sage-300"
            >
              <l.icon className="h-5 w-5 text-sage-600" />
              <p className="mt-3 font-medium text-stone-800 group-hover:text-sage-700">{l.label}</p>
              <p className="mt-1 text-sm text-stone-500">{l.text}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
