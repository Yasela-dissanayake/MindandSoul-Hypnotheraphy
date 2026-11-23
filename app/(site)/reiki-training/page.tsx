import Link from "next/link";
import type { Metadata } from "next";
import { Award, BadgeCheck, BookOpen, HandHeart, MessageCircle, MonitorPlay, PawPrint, Sparkles, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { onSaleWhere } from "@/lib/course-sales";
import { viewerCurrency } from "@/lib/currency";
import { getActivePromotion, promotedFirst, promotionLink } from "@/lib/promotions";
import { enquiryHref } from "@/lib/site-routes";
import { CurrencySwitch } from "@/components/site/currency-switch";
import { ClassGrid, classCardInclude } from "@/components/site/class-grid";
import { Expandable } from "@/components/site/expandable";
import { CardCarousel } from "@/components/site/card-carousel";

export const metadata: Metadata = {
  title: "Usui Reiki Training · Mind & Soul Works",
  description: "IPHMA accredited Usui Reiki training with Rangika: Level 1 (Shoden), Level 2 (Okuden) and Level 3 (Shinpiden, Master Practitioner / Teacher).",
};
export const dynamic = "force-dynamic";

// Page text from "website content revised" (Usui Reiki Training). The classes come from the admin (Reiki Training).
const LEARNING = [
  { icon: BookOpen, title: "Theory & Understanding", text: "Explore Reiki history, philosophy, principles and foundational teachings." },
  { icon: HandHeart, title: "Practical Learning", text: "Develop your understanding through guided practice and practical exercises." },
  { icon: Sparkles, title: "Attunement & Initiation", text: "Experience the traditional Reiki attunement or initiation associated with your level and teaching lineage." },
  { icon: MessageCircle, title: "Guidance & Support", text: "Ask questions, share experiences and receive guidance throughout your learning journey." },
  { icon: Award, title: "Certification", text: "Receive a certificate of completion for the relevant level, subject to meeting the course requirements." },
];
const FAQS = [
  { q: "Do I need previous experience to study Reiki Level 1?", a: "No. Level 1 is designed as an introduction for beginners." },
  {
    q: "Can I progress from Level 1 to Level 2?",
    a: "Yes. Students who have completed the required Level 1 training can progress to Level 2, subject to the relevant course prerequisites.",
  },
  { q: "Do I need to complete Level 2 before Level 3?", a: "Yes, the required previous training must be completed before progressing to the advanced level." },
  {
    q: "Can I become a Reiki practitioner after Level 2?",
    a: "Level 2 is commonly considered practitioner-level training in many Reiki traditions. However, professional practice requirements, insurance and recognition vary. Additional training and experience may be recommended.",
  },
  {
    q: "Does Level 3 automatically qualify me to teach Reiki?",
    a: "Not necessarily. Some Reiki traditions distinguish between Master Practitioner and Master Teacher training. Teaching qualifications and requirements depend on the lineage and course completed. In my courses, performing attunements for all 3 levels is included in the master level course, which makes it possible to teach and attune students.",
  },
  { q: "Can I learn Reiki for my own personal development?", a: "Absolutely. Reiki can be explored as a personal practice without any intention of becoming a professional practitioner." },
];

export default async function ReikiTrainingPage() {
  const [all, currency, promo] = await Promise.all([
    db.course.findMany({ where: { ...onSaleWhere, track: "REIKI" }, orderBy: [{ order: "asc" }, { title: "asc" }], include: classCardInclude }),
    viewerCurrency(),
    getActivePromotion(),
  ]);
  const link = promo ? promotionLink(promo) : null;
  const promotedId = link?.kind === "class" ? link.id : null;
  const classes = promotedFirst(all, promotedId);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-sage-100 via-sage-50 to-amber-50 py-16 lg:py-24">
        <div className="container mx-auto max-w-4xl space-y-6 px-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-sage-800 ring-1 ring-sage-200">
            <BadgeCheck className="h-4 w-4" aria-hidden /> IPHMA Accredited
          </span>
          <h1 className="font-serif text-4xl leading-tight text-stone-800 lg:text-6xl">Usui Reiki Training</h1>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sage-700">Level 1 · Level 2 · Level 3</p>
          <p className="font-serif text-2xl italic text-sage-800">Discover Reiki. Deepen Your Connection. Embrace Your Journey.</p>
          <p className="mx-auto max-w-2xl text-lg text-stone-600">Learn the beautiful tradition of Usui Reiki through structured, accredited training with Mind &amp; Soul Works.</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-sage-600 text-white hover:bg-sage-700">
              <a href="#levels">See the levels</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-sage-300 bg-white text-sage-800 hover:bg-sage-50">
              <Link href="/reiki-training/animal">
                <PawPrint className="mr-2 h-4 w-4" /> Animal Reiki training
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What is Reiki + Usui tradition */}
      <section className="bg-white py-16 lg:py-20">
        <div className="container mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2">
          <div className="space-y-4 leading-relaxed text-stone-700">
            <h2 className="font-serif text-3xl text-stone-800">What Is Reiki?</h2>
            <p>Reiki is a traditional Japanese energy healing practice that originated with Mikao Usui in the early 20th century. The word Reiki is commonly understood as a combination of two Japanese words:</p>
            <ul className="space-y-1 pl-1">
              <li>
                <strong className="text-stone-800">Rei</strong> – Universal or spiritual wisdom.
              </li>
              <li>
                <strong className="text-stone-800">Ki</strong> – Life force energy.
              </li>
            </ul>
            <p>
              Reiki is based on the traditional understanding that life force energy is connected with our overall sense of wellbeing and vitality. Practised
              through gentle hand placements, either on or just above the body or remotely, Reiki offers an opportunity for relaxation, stillness and personal
              reflection.
            </p>
            <p>
              Beyond the practice itself, Reiki is also a philosophy centred around compassion, mindfulness, kindness and living with greater awareness. For many
              people, learning Reiki becomes more than acquiring a healing technique. It becomes a journey of self-discovery, personal development and spiritual
              exploration.
            </p>
          </div>
          <div className="space-y-6">
            <div className="space-y-4 leading-relaxed text-stone-700">
              <h2 className="font-serif text-3xl text-stone-800">The Usui Reiki Tradition</h2>
              <p>
                At Mind &amp; Soul Works, I teach Usui Reiki, following the traditional Reiki lineage originating with Mikao Usui. Usui Reiki provides the
                foundation for the teachings, principles and practices explored throughout my Reiki courses.
              </p>
              <p>
                My training incorporates an appreciation of Reiki&apos;s traditional philosophy alongside practical learning, personal development and the
                understanding of responsible Reiki practice. Whether you are beginning with Level 1 or progressing towards Master Level, you will be guided
                through your learning journey with respect for the tradition and its teachings.
              </p>
            </div>
            <div className="space-y-3 rounded-2xl bg-sage-50 p-6 ring-1 ring-sage-200">
              <p className="flex items-center gap-2 font-serif text-xl text-stone-800">
                <BadgeCheck className="h-5 w-5 text-sage-600" aria-hidden /> IPHMA Accredited Courses
              </p>
              <p className="text-sm leading-relaxed text-stone-600">
                My Usui / Animal Reiki training courses are accredited by the International Practitioners of Holistic Medicine (IPHMA). This accreditation forms
                part of my commitment to providing structured Reiki education, supporting students in developing their knowledge, practical skills and
                understanding of Reiki.
              </p>
              <ul className="space-y-1 text-sm text-stone-700">
                <li>✓ Accredited certification by IPHMA</li>
                <li>✓ You are automatically entitled to become an IPHMA member</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Levels */}
      <section id="levels" className="scroll-mt-24 py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 flex max-w-7xl flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-serif text-3xl text-stone-800 lg:text-4xl">Your Reiki Learning Journey</h2>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-600">
                <span className="flex items-center gap-1.5">
                  <MonitorPlay className="h-4 w-4 text-sage-600" aria-hidden /> Live online group classes
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-sage-600" aria-hidden /> Certificate for each level
                </span>
              </p>
            </div>
            <CurrencySwitch current={currency} />
          </div>
          {classes.length === 0 ? (
            <p className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center text-stone-600 ring-1 ring-stone-200">
              New class dates are coming soon. Please{" "}
              <Link href={enquiryHref("Usui Reiki Training")} className="text-sage-700 underline">
                send us an enquiry
              </Link>{" "}
              to hear about the next class.
            </p>
          ) : (
            <ClassGrid classes={classes} currency={currency} promotedId={promotedId} promoFree={Boolean(promo?.free)} />
          )}
        </div>
      </section>

      {/* Learning with Mind & Soul Works */}
      <section className="bg-white py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-3xl space-y-3 text-center">
            <Sprout className="mx-auto h-8 w-8 text-sage-600" aria-hidden />
            <h2 className="font-serif text-3xl text-stone-800 lg:text-4xl">Learning with Mind &amp; Soul Works</h2>
            <p className="font-serif text-xl text-sage-700">A Supportive, Personal &amp; Heart-Centred Learning Experience</p>
            <p className="text-stone-600">
              I believe learning Reiki is not simply about memorising techniques or receiving an attunement. It is also about understanding the philosophy,
              developing personal awareness and allowing yourself the space to learn and grow. My intention is to create a supportive environment where
              students feel comfortable asking questions, exploring their experiences and developing confidence in their practice.
            </p>
          </div>
          <div className="mx-auto max-w-6xl">
            <CardCarousel label="Learning with Mind & Soul Works">
            {LEARNING.map((x) => (
              <div key={x.title} className="h-full space-y-3 rounded-2xl bg-stone-50 p-6 ring-1 ring-stone-200">
                <x.icon className="h-6 w-6 text-sage-600" aria-hidden />
                <h3 className="font-serif text-lg text-stone-800">{x.title}</h3>
                <p className="text-sm leading-relaxed text-stone-600">{x.text}</p>
              </div>
            ))}
            </CardCarousel>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto max-w-3xl space-y-8 px-4">
          <h2 className="text-center font-serif text-3xl text-stone-800 lg:text-4xl">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <Expandable key={f.q} title={f.q} size="md" defaultOpen={i === 0}>
                <p className="text-stone-600">{f.a}</p>
              </Expandable>
            ))}
          </div>
        </div>
      </section>

      {/* Begin */}
      <section className="bg-sage-600 py-16 text-white">
        <div className="container mx-auto max-w-3xl space-y-5 px-4 text-center">
          <h2 className="font-serif text-3xl lg:text-4xl">Begin Your Reiki Journey</h2>
          <p className="font-serif text-xl italic text-sage-100">Perhaps this is the beginning of something beautiful.</p>
          <p className="text-sage-100">
            Whether you are discovering Reiki for the first time or feel ready to deepen your existing practice, I warmly invite you to explore the learning
            opportunities at Mind &amp; Soul Works. Take your time, follow what resonates with you and allow your journey to unfold at its own pace.
          </p>
          <p className="font-medium">Learn. Grow. Connect. Embrace the journey.</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-white text-sage-700 hover:bg-stone-50">
              <a href="#levels">Choose your level</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-sage-700">
              <Link href={enquiryHref("Usui Reiki Training")}>Need more clarity? Send us an enquiry</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
