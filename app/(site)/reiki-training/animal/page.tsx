import Link from "next/link";
import type { Metadata } from "next";
import { BadgeCheck, Ear, HandHeart, Heart, PawPrint, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { onSaleWhere } from "@/lib/course-sales";
import { viewerCurrency } from "@/lib/currency";
import { getActivePromotion, promoDiscount, promotedFirst, promotionLink } from "@/lib/promotions";
import { enquiryHref } from "@/lib/site-routes";
import { CurrencySwitch } from "@/components/site/currency-switch";
import { ClassGrid, classCardInclude } from "@/components/site/class-grid";
import { CardCarousel } from "@/components/site/card-carousel";

export const metadata: Metadata = {
  title: "Animal Reiki & Communication Training · Mind & Soul Works",
  description:
    "IPHMA accredited Animal Reiki & Communication training with Rangika: 5 days, 3 hours each. For pet owners, veterinary professionals, shelter staff, rescuers and animal lovers.",
};
export const dynamic = "force-dynamic";

// Page text from "website content revised" (Animal Reiki & Communication Training).
const OFFER = [
  { icon: Sparkles, title: "Usui Reiki Level 1 & 2", text: "Learn the foundations of Usui Reiki and develop your personal energy practice through training and attunements." },
  { icon: Ear, title: "Animal Communication Training", text: "Learn to develop intuitive awareness, explore how animals communicate and practise connecting with them beyond words." },
  { icon: PawPrint, title: "Animal Reiki Training", text: "Learn the gentle practice of Reiki for animals, with an emphasis on presence, respect, choice and creating a calm, supportive environment." },
  { icon: Sparkles, title: "Attunements & Development", text: "Explore intuitive development through guided experiences, attunements and practical learning." },
  { icon: HandHeart, title: "Practice Sessions", text: "Continue learning through practical exercises, shared experiences, group practice and supportive feedback." },
  { icon: Users, title: "Support & Learning Groups", text: "Connect with like-minded people, exchange experiences and develop your skills in a welcoming community." },
];
const WHO = [
  ["Pet owners", "Build a deeper connection and understanding of your animal companions."],
  ["Animal trainers and behaviour professionals", "Explore intuitive awareness, connection and complementary approaches to supporting animal wellbeing."],
  ["Veterinary professionals and nurses", "Explore additional approaches to calm, compassionate animal care."],
  ["Animal shelter staff", "Develop greater awareness and understanding when working with animals in shelter environments."],
  ["Rescue organisations and volunteers", "Explore ways to support animals through transitions, care and recovery."],
  ["Foster carers", "Deepen your understanding of the individual needs and experiences of animals in your care."],
  ["Animal lovers", "Discover new ways to connect, learn and grow alongside animals."],
];

export default async function AnimalReikiTrainingPage() {
  const [all, currency, promo] = await Promise.all([
    db.course.findMany({ where: { ...onSaleWhere, track: "ANIMAL" }, orderBy: [{ order: "asc" }, { title: "asc" }], include: classCardInclude }),
    viewerCurrency(),
    getActivePromotion(),
  ]);
  const link = promo ? promotionLink(promo) : null;
  const promotedId = link?.kind === "class" ? link.id : null;
  const classes = promotedFirst(all, promotedId);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/session-covers/animal-communication.jpg" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-stone-900/80 via-stone-900/55 to-stone-900/25" />
        <div className="container mx-auto px-4 py-20 lg:py-28">
          <div className="max-w-3xl space-y-6 text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white ring-1 ring-white/30 backdrop-blur-sm">
              <BadgeCheck className="h-4 w-4" aria-hidden /> IPHMA Accredited
            </span>
            <h1 className="font-serif text-4xl leading-tight lg:text-6xl">Animal Reiki &amp; Communication Training</h1>
            <p className="font-serif text-xl italic text-sage-100">Building Deeper Connections Between Humans and Animals</p>
            <p className="text-lg text-stone-100">5 days, 3 hours each · Live online group training</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-sage-600 text-white hover:bg-sage-700">
                <a href="#training">See the training</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/80 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-stone-800">
                <Link href="/reiki-training">Usui Reiki levels</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Intro + accreditation */}
      <section className="bg-white py-16 lg:py-20">
        <div className="container mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-4 text-lg leading-relaxed text-stone-700">
            <p className="font-serif text-2xl text-sage-800">Animals communicate with us in many ways, often beyond spoken words.</p>
            <p>
              Mind &amp; Soul Works is a space dedicated to teaching Animal Communication and Animal Reiki, helping people develop a deeper understanding of
              animals through intuitive connection, awareness, compassion and energy practices.
            </p>
            <p>
              Whether you are a pet owner, veterinary professional, nurse, animal shelter worker, rescue volunteer or someone who simply loves animals, these
              courses and learning experiences offer opportunities to develop new skills and strengthen your connection with the animals in your care.
            </p>
          </div>
          <div className="space-y-3 self-start rounded-2xl bg-sage-50 p-6 ring-1 ring-sage-200">
            <p className="flex items-center gap-2 font-serif text-xl text-stone-800">
              <BadgeCheck className="h-5 w-5 text-sage-600" aria-hidden /> IPHMA Accredited
            </p>
            <p className="text-sm leading-relaxed text-stone-600">
              Usui / Animal Reiki training courses are accredited by the International Practitioners of Holistic Medicine (IPHMA), as part of a commitment to
              structured Reiki education.
            </p>
            <ul className="space-y-1 text-sm text-stone-700">
              <li>✓ Accredited certification by IPHMA</li>
              <li>✓ You are automatically entitled to become an IPHMA member</li>
            </ul>
          </div>
        </div>
      </section>

      {/* What we offer */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-10 text-center font-serif text-3xl text-stone-800 lg:text-4xl">What We Offer</h2>
          <div className="mx-auto max-w-6xl">
            <CardCarousel label="What we offer">
            {OFFER.map((x) => (
              <div key={x.title} className="h-full space-y-3 rounded-2xl bg-white p-6 ring-1 ring-stone-200">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sage-100 text-sage-700">
                  <x.icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="font-serif text-xl text-stone-800">{x.title}</h3>
                <p className="text-sm leading-relaxed text-stone-600">{x.text}</p>
              </div>
            ))}
            </CardCarousel>
          </div>
        </div>
      </section>

      {/* The training (price + enrol) */}
      <section id="training" className="scroll-mt-24 bg-white py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 flex max-w-7xl flex-wrap items-end justify-between gap-4">
            <h2 className="font-serif text-3xl text-stone-800 lg:text-4xl">Join the Training</h2>
            <CurrencySwitch current={currency} />
          </div>
          {classes.length === 0 ? (
            <p className="mx-auto max-w-xl rounded-2xl bg-stone-50 p-8 text-center text-stone-600 ring-1 ring-stone-200">
              New dates are coming soon. Please{" "}
              <Link href={enquiryHref("Animal Reiki & Communication Training")} className="text-sage-700 underline">
                send us an enquiry
              </Link>{" "}
              to hear about the next training.
            </p>
          ) : (
            <ClassGrid classes={classes} currency={currency} promotedId={promotedId} promoFree={Boolean(promo?.free)} promoDiscount={promoDiscount(promo)} />
          )}
        </div>
      </section>

      {/* Who can benefit */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="mb-10 space-y-3 text-center">
            <h2 className="font-serif text-3xl text-stone-800 lg:text-4xl">Who Can Benefit?</h2>
            <p className="text-stone-600">
              Our learning experiences are designed for anyone who wants to deepen their understanding of animals and develop compassionate ways of connecting
              with them.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {WHO.map(([who, text]) => (
              <li key={who} className="flex gap-3 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
                <Heart className="mt-0.5 h-5 w-5 shrink-0 text-sage-600" aria-hidden />
                <span className="text-sm leading-relaxed text-stone-600">
                  <strong className="block font-medium text-stone-800">{who}</strong>
                  {text}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-center font-serif text-xl italic text-sage-800">
            No matter where you are on your journey, there is always more to learn about the animals who share our lives.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-sage-600 text-white hover:bg-sage-700">
              <a href="#training">Book your place</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-sage-300 text-sage-800 hover:bg-sage-50">
              <Link href={enquiryHref("Animal Reiki & Communication Training")}>Need more clarity? Send us an enquiry</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
