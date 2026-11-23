import Link from "next/link";
import type { Metadata } from "next";
import { Brain, Flower2, Heart, Leaf, MessageCircle, PawPrint, Scale, Sparkles, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { serviceWithOptions } from "@/lib/session-catalog";
import { viewerCurrency } from "@/lib/currency";
import { getActivePromotion, promotedFirst, promotionLink } from "@/lib/promotions";
import { enquiryHref } from "@/lib/site-routes";
import { CurrencySwitch } from "@/components/site/currency-switch";
import { ServiceCard } from "@/components/site/service-card";
import { CardCarousel } from "@/components/site/card-carousel";

export const metadata: Metadata = {
  title: "Reiki Energy Healing · Mind & Soul Works",
  description:
    "Reiki energy healing with Rangika, in person in Perth or at a distance, plus Animal Reiki and Animal Communication for your animal companions.",
};
export const dynamic = "force-dynamic";

// Page text from "website content revised" (Reiki Energy Healing, Animal Reiki & Animal Communication).
const SUPPORT = [
  { icon: Sun, title: "Relaxation & Stress Relief", text: "A dedicated opportunity to slow down, quiet the mind and experience deep relaxation." },
  { icon: Heart, title: "Emotional Wellbeing", text: "A gentle space to acknowledge your feelings, nurture self-compassion and reconnect with yourself." },
  { icon: Scale, title: "Inner Balance & Harmony", text: "An opportunity to explore your sense of energetic balance and personal wellbeing." },
  { icon: Sparkles, title: "Spiritual Connection", text: "For those drawn to spirituality, Reiki can become part of a journey of self-awareness, reflection and spiritual development." },
  { icon: Brain, title: "Mind-Body Awareness", text: "Develop a greater appreciation of the relationship between relaxation, emotions and your overall sense of wellbeing." },
  { icon: Leaf, title: "Self-Care & Reconnection", text: "Make time for yourself, step away from everyday demands and prioritise your own wellbeing." },
];

export default async function ReikiHealingPage() {
  const [all, currency, promo] = await Promise.all([
    db.sessionService.findMany({
      where: { published: true, category: { in: ["REIKI_HEALING", "ANIMAL_REIKI"] } },
      orderBy: [{ order: "asc" }, { title: "asc" }],
      include: serviceWithOptions,
    }),
    viewerCurrency(),
    getActivePromotion(),
  ]);
  const link = promo ? promotionLink(promo) : null;
  const promotedId = link?.kind === "session" ? link.id : null;
  const sorted = promotedFirst(all, promotedId);
  const reiki = sorted.filter((s) => s.category === "REIKI_HEALING");
  const animal = sorted.filter((s) => s.category === "ANIMAL_REIKI");
  const card = (s: (typeof all)[number]) => (
    <ServiceCard key={s.id} s={s} currency={currency} photo promoted={s.id === promotedId} free={s.id === promotedId && Boolean(promo?.free)} />
  );

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/session-covers/reiki-energy-healing.jpg" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-stone-900/80 via-stone-900/55 to-stone-900/25" />
        <div className="container mx-auto px-4 py-20 lg:py-28">
          <div className="max-w-3xl space-y-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sage-200">Reiki Energy Healing</p>
            <h1 className="font-serif text-4xl leading-tight lg:text-6xl">Restore. Reconnect. Rebalance.</h1>
            <p className="font-serif text-xl italic text-sage-100">A gentle journey towards inner harmony, relaxation and spiritual connection.</p>
            <p className="text-lg leading-relaxed text-stone-100">
              Allow yourself a moment to pause, breathe and reconnect with your inner self. Experience the gentle practice of Reiki in a nurturing space where
              your wellbeing, energy and personal journey are honoured.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-sage-600 text-white hover:bg-sage-700">
                <a href="#reiki">Reiki for you</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/80 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-stone-800">
                <a href="#animals">
                  <PawPrint className="mr-2 h-4 w-4" /> Reiki for your animal companion
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Discover the Gentle Art of Reiki */}
      <section className="bg-white py-16 lg:py-20">
        <div className="container mx-auto max-w-4xl space-y-5 px-4 text-lg leading-relaxed text-stone-700">
          <h2 className="font-serif text-3xl text-stone-800 lg:text-4xl">Discover the Gentle Art of Reiki</h2>
          <p className="font-serif text-xl text-sage-700">Sometimes, we simply need to pause and allow ourselves to be.</p>
          <p>
            In the busyness of everyday life, it is easy to become disconnected from ourselves. Stress, emotional demands and the constant activity of our minds
            can leave us feeling overwhelmed, exhausted or out of balance. Reiki offers an opportunity to slow down, relax and reconnect.
          </p>
          <p>
            Usui Reiki is a traditional Japanese energy healing practice founded by Mikao Usui. It is based on the understanding that energy is an important
            aspect of our overall wellbeing. Through gentle hands-on / distance healing techniques, Reiki is traditionally practised with the intention of
            supporting relaxation, harmony and energetic wellbeing.
          </p>
          <p>
            At Mind &amp; Soul Works, I offer Reiki as a gentle, complementary holistic practice, creating a peaceful and supportive environment where you can
            take time for yourself. Whether you are new to Reiki or have experienced energy healing before, each session is approached with compassion, respect
            and an open heart.
          </p>
          <p className="font-serif text-xl italic text-sage-700">A moment of stillness. A space for reconnection. An opportunity to nurture yourself.</p>
        </div>
      </section>

      {/* How Reiki May Support Your Wellbeing */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-3xl space-y-3 text-center">
            <h2 className="font-serif text-3xl text-stone-800 lg:text-4xl">How Reiki May Support Your Wellbeing</h2>
            <p className="text-stone-600">
              Reiki is experienced differently by everyone. Some people describe feeling deeply relaxed, while others appreciate the opportunity to rest,
              reflect and simply enjoy a peaceful moment.
            </p>
          </div>
          <div className="mx-auto max-w-6xl">
            <CardCarousel label="How Reiki may support your wellbeing">
            {SUPPORT.map((x) => (
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

      {/* Reiki for you */}
      <section id="reiki" className="scroll-mt-24 bg-white py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 flex max-w-6xl flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-serif text-3xl text-stone-800 lg:text-4xl">Reiki Energy Healing</h2>
              <p className="text-stone-600">In person in Perth, or distance Reiki from wherever you are.</p>
            </div>
            <CurrencySwitch current={currency} />
          </div>
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">{reiki.map(card)}</div>
        </div>
      </section>

      {/* Animal Reiki & Animal Communication */}
      <section id="animals" className="scroll-mt-24 py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 grid max-w-6xl gap-8 lg:grid-cols-[1fr_20rem] lg:items-end">
            <div className="space-y-4 text-stone-700">
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-sage-700">
                <PawPrint className="h-4 w-4" aria-hidden /> For your animal companions
              </p>
              <h2 className="font-serif text-3xl text-stone-800 lg:text-4xl">Animal Reiki &amp; Animal Communication</h2>
              <p className="font-serif text-xl text-sage-700">Honouring the beautiful connection we share with animals.</p>
              <p className="leading-relaxed">
                Animals communicate with us in their own beautiful ways. They are our companions, our teachers and often our greatest sources of unconditional
                love. At Mind &amp; Soul Works, I offer Animal Reiki Energy Healing and Animal Communication as individual services, as well as the option to
                experience both together.
              </p>
              <p className="leading-relaxed">
                Each experience is approached with compassion, sensitivity and respect for your animal&apos;s individuality, comfort and boundaries. All animal
                sessions are offered remotely, so your companion can stay in familiar surroundings.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-5 text-sm leading-relaxed text-stone-600 ring-1 ring-stone-200">
              <Flower2 className="mb-2 h-6 w-6 text-sage-600" aria-hidden />
              Supporting our animal companions through every stage of life, including <strong className="text-stone-800">end-of-life Animal Reiki</strong>,
              offered with love, comfort and compassion when it matters most.
            </div>
          </div>
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">{animal.map(card)}</div>
          <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-3 text-center">
            <p className="text-sm text-stone-500">Not sure which is right for your animal?</p>
            <Button asChild size="lg" variant="outline" className="border-sage-300 bg-white text-sage-800 hover:bg-sage-50">
              <Link href={enquiryHref("Animal Reiki & Communication")}>
                <MessageCircle className="mr-2 h-4 w-4" aria-hidden /> Send us an enquiry
              </Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
