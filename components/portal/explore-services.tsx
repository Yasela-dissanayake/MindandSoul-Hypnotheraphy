import Link from "next/link";
import { ArrowRight, BookOpen, Brain, GraduationCap, MessageCircleHeart, Sparkles } from "lucide-react";

// Shown in the portal to people who haven't booked or bought anything yet (e.g. they just signed up
// with Google): what Rangika offers, with links to the website pages where they can book or buy.
// Free sessions and promotions can be added here later.

// The website's four sections, the same as its top menu: each page lists everything in it, ready to book or buy.
const OFFERS = [
  {
    href: "/hypnotherapy",
    icon: Brain,
    title: "Clinical Hypnotherapy",
    short: "One-to-one sessions",
    text: "One-to-one hypnotherapy sessions with Rangika, in person in Perth or online. Book a single session or a package.",
    cta: "See hypnotherapy",
  },
  {
    href: "/reiki-healing",
    icon: Sparkles,
    title: "Reiki Energy Healing",
    short: "Reiki & Animal Reiki",
    text: "Reiki healing sessions for you, and Animal Reiki & Communication for your animals, in person or at a distance.",
    cta: "See Reiki healing",
  },
  {
    href: "/reiki-training",
    icon: GraduationCap,
    title: "Reiki Training",
    short: "Live classes, with a certificate",
    text: "Live Usui Reiki and Animal Reiki training in small groups, from Level 1 to Master Teacher, with a certificate.",
    cta: "See Reiki training",
  },
  {
    href: "/courses",
    icon: BookOpen,
    title: "Courses",
    short: "Self-paced, at home",
    text: "Self-paced courses you can follow at home, at your own pace.",
    cta: "See courses",
  },
];

/**
 * What Rangika offers, with links to book or buy.
 * - In the portal: for clients who have nothing at the moment.
 * - On the public "Get started" page: for people without an account (pass `heading` / `intro`).
 */
export function ExploreServices({
  firstName,
  heading,
  intro,
}: {
  firstName?: string | null;
  heading?: string;
  intro?: React.ReactNode;
}) {
  return (
    <section className="space-y-5" aria-labelledby="explore-title">
      <div className="rounded-2xl bg-sage-50 p-6 ring-1 ring-sage-200">
        <h2 id="explore-title" className="font-serif text-2xl text-stone-800">
          {heading ?? `Welcome${firstName ? `, ${firstName}` : ""}! Here's how Rangika can help`}
        </h2>
        <div className="mt-2 text-stone-600">
          {intro ?? "Choose a session, training or course below. Once you book or buy, it appears here in your private space straight away."}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {OFFERS.map((o) => (
          <Link
            key={o.href}
            href={o.href}
            className="group flex flex-col rounded-2xl bg-white p-5 ring-1 ring-stone-200 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-sage-300"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-100 text-sage-700">
              <o.icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="mt-4 font-serif text-lg text-stone-800">{o.title}</span>
            <span className="mt-1 flex-1 text-sm text-stone-600">{o.text}</span>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-sage-700">
              {o.cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/contact#enquiry"
        className="group flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200 transition hover:ring-sage-300 sm:flex-row sm:items-center"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
          <MessageCircleHeart className="h-5 w-5" aria-hidden />
        </span>
        <span className="flex-1">
          <span className="block font-serif text-lg text-stone-800">Not sure where to start?</span>
          <span className="text-sm text-stone-600">Tell Rangika what you&apos;d like help with. She&apos;ll get back to you and suggest what suits you best, with a free consultation.</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-sage-700">
          Ask Rangika <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
        </span>
      </Link>
    </section>
  );
}

/**
 * For clients who already have something: a compact row with the website's four sections, to book or buy
 * something else. Each opens that section of the website (all its services are listed there).
 */
export function BookMore() {
  return (
    <section className="space-y-3" aria-labelledby="book-more-title">
      <h2 id="book-more-title" className="font-serif text-xl text-stone-800">
        Book something else
      </h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {OFFERS.map((o) => (
          <Link
            key={o.href}
            href={o.href}
            className="group flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-stone-200 transition hover:ring-sage-300"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage-100 text-sage-700">
              <o.icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium leading-snug text-stone-800 group-hover:text-sage-800">{o.title}</span>
              <span className="block truncate text-xs text-stone-500">{o.short}</span>
            </span>
            <ArrowRight className="hidden h-4 w-4 shrink-0 text-sage-600 transition group-hover:translate-x-0.5 sm:block" aria-hidden />
          </Link>
        ))}
      </div>
    </section>
  );
}
