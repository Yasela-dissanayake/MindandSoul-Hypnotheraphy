import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Sparkles } from "lucide-react";

const WAYS = [
  {
    icon: Sparkles,
    title: "Healing Sessions",
    text: "One-to-one hypnotherapy, Reiki and energy healing, in person in Perth or online. Pick a time and pay online.",
    href: "/booking",
    cta: "Book a session",
  },
  {
    icon: GraduationCap,
    title: "Taught Courses",
    text: "Reiki and Animal Reiki courses taught by Rangika, with practice, course notes and a certificate.",
    href: "/courses",
    cta: "See courses and dates",
  },
  {
    icon: BookOpen,
    title: "Online Learning",
    text: "Self-paced online courses. Learn at home, one lesson at a time, and receive a certificate when you finish.",
    href: "/learn",
    cta: "Browse online courses",
  },
];

/** The three ways to work with Rangika: sessions, taught courses and self-paced online learning. */
export function WaysToWork({ title = "Three Ways to Work with Rangika" }: { title?: string }) {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl space-y-3 text-center">
          <h2 className="font-serif text-3xl text-stone-800 lg:text-4xl">{title}</h2>
          <p className="text-stone-600">Heal with a private session, learn in a class, or study at your own pace online.</p>
        </div>
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {WAYS.map((w) => (
            <Link
              key={w.href}
              href={w.href}
              className="group flex flex-col gap-3 rounded-2xl bg-stone-50 p-6 ring-1 ring-stone-200 transition hover:bg-sage-50 hover:ring-sage-300"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-100 text-sage-700">
                <w.icon className="h-6 w-6" />
              </span>
              <h3 className="font-serif text-xl text-stone-800">{w.title}</h3>
              <p className="flex-1 text-sm leading-relaxed text-stone-600">{w.text}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-sage-700">
                {w.cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
