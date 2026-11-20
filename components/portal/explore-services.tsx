import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, MessageCircleHeart, Sparkles } from "lucide-react";

// Shown in the portal to people who haven't booked or bought anything yet (e.g. they just signed up
// with Google): what Rangika offers, with links to the website pages where they can book or buy.
// Free sessions and promotions can be added here later.

const OFFERS = [
  {
    href: "/sessions",
    icon: Sparkles,
    title: "One-to-one sessions",
    text: "Hypnotherapy, Reiki healing and Animal Reiki with Rangika, in person or at a distance. Book a single session or a package.",
    cta: "See sessions",
  },
  {
    href: "/classes",
    icon: GraduationCap,
    title: "Reiki classes",
    text: "Live online Usui Reiki and Animal Reiki classes in small groups, from Level 1 to Master Teacher, with a certificate.",
    cta: "See classes",
  },
  {
    href: "/courses",
    icon: BookOpen,
    title: "Self-paced courses",
    text: "Video and audio courses you can start straight away and follow at your own pace.",
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
          {intro ?? "Choose a session, class or course below. Once you book or buy, it appears here in your private space straight away."}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
