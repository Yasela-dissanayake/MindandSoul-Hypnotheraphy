import Link from "next/link";
import type { Metadata } from "next";
import { Brain, Heart, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { serviceWithOptions } from "@/lib/session-catalog";
import { viewerCurrency } from "@/lib/currency";
import { getActivePromotion, promoDiscount, promotedFirst, promotionLink } from "@/lib/promotions";
import { enquiryHref } from "@/lib/site-routes";
import { CurrencySwitch } from "@/components/site/currency-switch";
import { ServiceCard } from "@/components/site/service-card";
import { Expandable } from "@/components/site/expandable";

export const metadata: Metadata = {
  title: "Clinical Hypnotherapy · Mind & Soul Works",
  description:
    "Clinical hypnotherapy with Rangika: stress and anxiety, fears, confidence, smoking and alcohol cessation, sleep, IBS, weight management, grief and more. In person in Perth or online.",
};
export const dynamic = "force-dynamic";

// Page text from "website content revised" (Clinical Hypnotherapy). The areas themselves come from the admin (Sessions).
const FAQS = [
  {
    q: "What does hypnosis feel like?",
    a: [
      'One of the most common questions people ask is, "Will I lose control?" The answer is no.',
      "Hypnosis is not about giving up control or surrendering your mind to someone else. It involves focused attention and a state of awareness in which you can become more receptive to therapeutic suggestions.",
      "You may experience a feeling of physical relaxation, a quietening of everyday thoughts, greater focus on your imagination and inner experience, a sense of being deeply absorbed, and awareness of sounds and sensations around you.",
      "Some people describe it as similar to becoming absorbed in a good book, daydreaming or being deeply focused on something enjoyable. Every person's experience is different.",
    ],
  },
  {
    q: "Can I be hypnotised?",
    a: [
      "Most people who are willing to participate and can engage with focused attention and guided suggestions can experience some degree of hypnosis.",
      "There is no need to force the experience or try to achieve a particular state. My role is to guide and support you, while you remain an active participant throughout.",
    ],
  },
  {
    q: "Is hypnotherapy available online?",
    a: [
      "Yes. I offer online hypnotherapy sessions, depending on your needs and suitability. Kindly send an enquiry for details.",
      "Online sessions allow you to experience hypnotherapy from the comfort of your own home, provided you have a quiet, private and comfortable space with a reliable internet connection. Before an online session, we discuss how to prepare your environment to help you feel relaxed and uninterrupted.",
    ],
  },
  { q: "How long is a session?", a: ["Usually one hour. Age regressions and past life regressions can go up to 1½ to 2 hours."] },
  {
    q: "How many sessions are needed?",
    a: [
      "It totally depends on each case, but it's always advisable to book a minimum of three sessions.",
      "Your journey is unique. My intention is to provide a supportive space where you feel heard, respected and empowered to work towards positive change.",
    ],
  },
];

export default async function HypnotherapyPage() {
  const [all, currency, promo] = await Promise.all([
    db.sessionService.findMany({ where: { published: true, category: "HYPNOTHERAPY" }, orderBy: [{ order: "asc" }, { title: "asc" }], include: serviceWithOptions }),
    viewerCurrency(),
    getActivePromotion(),
  ]);
  const link = promo ? promotionLink(promo) : null;
  const promotedId = link?.kind === "session" ? link.id : null;
  const areas = promotedFirst(all, promotedId);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/session-covers/clinical-hypnotherapy.jpg" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-stone-900/80 via-stone-900/60 to-stone-900/30" />
        <div className="container mx-auto px-4 py-20 lg:py-28">
          <div className="max-w-3xl space-y-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sage-200">Clinical Hypnotherapy</p>
            <h1 className="font-serif text-4xl leading-tight lg:text-6xl">Create Space for Positive Change</h1>
            <p className="font-serif text-xl italic text-sage-100">Understanding the mind. Exploring possibilities. Supporting transformation.</p>
            <p className="text-lg leading-relaxed text-stone-100">
              A gentle, therapeutic approach to exploring subconscious patterns, developing self-awareness and working towards meaningful change.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-sage-600 text-white hover:bg-sage-700">
                <a href="#areas">Explore areas of support</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/80 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-stone-800">
                <Link href={enquiryHref("Clinical Hypnotherapy")}>Send an enquiry</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Understanding the Power of the Mind */}
      <section className="bg-white py-16 lg:py-20">
        <div className="container mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_22rem] lg:items-start">
          <div className="space-y-5 text-lg leading-relaxed text-stone-700">
            <h2 className="font-serif text-3xl text-stone-800 lg:text-4xl">Understanding the Power of the Mind</h2>
            <p className="font-serif text-xl text-sage-700">Our minds hold incredible potential.</p>
            <p>
              Sometimes, the thoughts, beliefs, emotions and patterns that influence our everyday lives can become difficult to understand or change. We may
              find ourselves repeating familiar behaviours, feeling held back by fears, struggling with confidence or carrying emotional experiences that
              continue to affect us.
            </p>
            <p>
              Clinical hypnotherapy offers a therapeutic approach that uses focused attention and relaxation to explore thoughts, feelings and patterns of
              behaviour. It can help create an opportunity to develop greater self-awareness, explore unhelpful patterns and work towards positive changes in the
              way we think, feel and respond.
            </p>
            <p>
              At Mind &amp; Soul Works, I believe that every person&apos;s experience is unique. My approach is compassionate, individualised and centred
              around your personal circumstances and goals. Whether you are looking to overcome a long-standing habit, improve your confidence, manage stress,
              work through difficult experiences or enhance your performance, sessions are tailored to meet you where you are.
            </p>
          </div>
          <div className="space-y-4 rounded-2xl bg-sage-50 p-6 ring-1 ring-sage-200">
            <Brain className="h-8 w-8 text-sage-600" aria-hidden />
            <p className="font-serif text-xl leading-snug text-stone-800">
              You don&apos;t have to remain defined by old patterns, limiting beliefs or past experiences.
            </p>
            <p className="text-stone-600">Change is possible, and every journey begins with a first step.</p>
          </div>
        </div>
      </section>

      {/* Areas of Support */}
      <section id="areas" className="scroll-mt-24 py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 flex max-w-7xl flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-serif text-3xl text-stone-800 lg:text-4xl">Areas of Support</h2>
              <p className="text-stone-600">I offer clinical hypnotherapy to support a range of personal, emotional and behavioural goals. Choose an area to read more and book.</p>
            </div>
            <CurrencySwitch current={currency} />
          </div>
          {areas.length === 0 ? (
            <p className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center text-stone-600 ring-1 ring-stone-200">
              Please <Link href={enquiryHref("Clinical Hypnotherapy")} className="text-sage-700 underline">send an enquiry</Link> to book a hypnotherapy session.
            </p>
          ) : (
            <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {areas.map((s) => (
                <ServiceCard key={s.id} s={s} currency={currency} photo promoted={s.id === promotedId} free={s.id === promotedId && Boolean(promo?.free)} discount={s.id === promotedId ? promoDiscount(promo) : 0} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 lg:py-20">
        <div className="container mx-auto max-w-3xl space-y-8 px-4">
          <div className="space-y-2 text-center">
            <h2 className="font-serif text-3xl text-stone-800 lg:text-4xl">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <Expandable key={f.q} title={f.q} size="md" defaultOpen={i === 0}>
                <div className="space-y-3 text-stone-600">
                  {f.a.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </Expandable>
            ))}
          </div>
        </div>
      </section>

      {/* Ready to begin + care note */}
      <section className="bg-sage-600 py-16 text-white">
        <div className="container mx-auto max-w-4xl space-y-6 px-4 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-sage-200" aria-hidden />
          <h2 className="font-serif text-3xl lg:text-4xl">Ready to Begin Your Journey?</h2>
          <p className="mx-auto max-w-2xl text-sage-100">
            You don&apos;t need to have all the answers before you begin. Sometimes the first step is simply being open to exploring new possibilities. If you
            are curious about hypnotherapy or would like to discuss whether it may be suitable for your needs, I warmly invite you to get in touch.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-white text-sage-700 hover:bg-stone-50">
              <a href="#areas">
                <Heart className="mr-2 h-4 w-4" /> Choose an area
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-sage-700">
              <Link href={enquiryHref("Clinical Hypnotherapy")}>
                <MessageCircle className="mr-2 h-4 w-4" /> Send an enquiry
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
