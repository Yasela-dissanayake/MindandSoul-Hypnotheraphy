import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Award, BadgeCheck, GraduationCap, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Meet Rangika · Mind & Soul Works",
  description:
    "Rangika is a Certified Clinical Hypnotherapist, Certified Energy Healer, Animal Reiki Practitioner and Reiki Trainer in Perth, Western Australia.",
};

// Page text from "website content revised" (Meet Rangika, My Philosophy, Professional Qualifications & Memberships).
const ROLES = [
  "Certified Clinical Hypnotherapist",
  "Certified Energy Healer",
  "Meditation Coach",
  "Life Coach",
  "Therapeutic Arts Practitioner",
  "EFT Practitioner",
  "Animal Reiki Practitioner",
  "Reiki Trainer",
  "Lama Fera Healing Practitioner",
];
const QUALIFICATIONS = [
  "Diploma in Clinical Hypnotherapy and Applied Psychotherapy",
  "Master's Study of Advanced Application of Clinical Hypnotherapy and Integrative Psychotherapy",
  "Reiki Master – Usui Reiki / Kundalini Reiki",
  "Diploma in Animal Reiki & Communication",
  "Therapeutic Arts Practitioner Certification",
  "Life Coach Certification",
  "EFT Practitioner Certification",
];
const MEMBERSHIPS = [
  ["AACHP", "Australian Association of Clinical Hypnotherapy and Psychotherapy"],
  ["IPHM", "International Practitioners of Holistic Medicine"],
  ["IICT", "International Institute for Complementary Therapists"],
  ["IARP", "International Institute for Reiki Practitioners"],
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Meet Rangika */}
      <section className="bg-gradient-to-br from-stone-100 to-sage-50 py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <Badge className="bg-sage-100 text-sage-700">About Mind &amp; Soul Works</Badge>
              <h1 className="font-serif text-4xl leading-tight text-stone-800 lg:text-6xl">
                Meet <span className="text-sage-600">Rangika</span>
              </h1>
              <p className="font-serif text-xl italic text-sage-700">The heart, the journey and the passion behind Mind &amp; Soul Works.</p>
              <p className="text-lg leading-relaxed text-stone-600">Welcome to Mind &amp; Soul Works. I&apos;m so glad you&apos;re here.</p>
              <p className="leading-relaxed text-stone-600">
                I&apos;m a certified practitioner with a deep passion for guiding individuals towards greater self-awareness, personal growth and holistic
                wellbeing.
              </p>
              <ul className="flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <li key={r} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-sage-800 ring-1 ring-sage-200">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative mx-auto h-[560px] w-full max-w-[460px] overflow-hidden rounded-2xl shadow-2xl">
              <Image src="/prof3.jpeg" alt="Rangika, founder of Mind & Soul Works" fill priority sizes="(min-width: 1024px) 460px, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* My journey */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-[1fr_20rem]">
            <div className="space-y-5 leading-relaxed text-stone-700">
              <h2 className="font-serif text-3xl text-stone-800 lg:text-4xl">My Journey</h2>
              <p>
                My journey into healing and personal transformation has been shaped not only by learning and professional study, but also by my own life
                experiences.
              </p>
              <p>
                Having navigated difficult and challenging phases in my life, I came to understand that sometimes our greatest periods of growth can emerge
                from our most difficult experiences.
              </p>
              <p>
                It was through those seasons that I was drawn to explore the deeper connection between the mind, emotions, energy and spirit. I discovered the
                importance of self-awareness, inner healing, personal resilience and the beautiful relationship between mind, body and soul.
              </p>
              <p>These experiences helped shape the person and practitioner I am today and deepened my desire to support others as they navigate their own journeys.</p>
              <p>
                I believe that sometimes we need to look beyond what is immediately visible and explore the deeper patterns, beliefs and experiences that
                influence how we think, feel and experience life. This is where my passion for bringing together therapeutic approaches, holistic healing and
                spiritual exploration comes from.
              </p>
            </div>
            <Image src="/rangika_profile.jpeg" alt="Rangika" width={400} height={400} className="w-full rounded-xl object-cover shadow-lg" />
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-stone-50 py-20">
        <div className="container mx-auto max-w-4xl space-y-6 px-4">
          <div className="space-y-3 text-center">
            <Heart className="mx-auto h-8 w-8 text-sage-600" aria-hidden />
            <h2 className="font-serif text-3xl text-stone-800 lg:text-4xl">My Philosophy – Healing Beyond the Surface</h2>
          </div>
          <div className="space-y-5 rounded-2xl bg-white p-6 leading-relaxed text-stone-700 ring-1 ring-stone-200 md:p-10">
            <p>
              I believe wellbeing is not simply about addressing one aspect of ourselves. It is about recognising the connection between our thoughts,
              emotions, physical experiences, energy and spiritual wellbeing.
            </p>
            <p>
              There is no single pathway to healing, growth or transformation. Every individual has their own story, their own challenges and their own unique
              needs. My approach brings together the therapeutic and the spiritual, creating a space where both can be explored with compassion, understanding
              and respect.
            </p>
            <p>
              I believe one of the most meaningful things we can offer another person is a space where they feel heard, understood, respected and accepted
              without judgement.
            </p>
            <p>
              If there is one thing my own journey has taught me, it is that growth and transformation are deeply personal. Sometimes we need guidance.
              Sometimes we need understanding. Sometimes we simply need a safe space to pause, breathe and reconnect with ourselves.
            </p>
            <p>
              I don&apos;t believe in a one-size-fits-all approach. I believe in meeting each person where they are, honouring their experiences and supporting
              them as they discover their own possibilities.
            </p>
            <p className="font-serif text-xl italic text-sage-700">At Mind &amp; Soul Works, you are welcomed exactly as you are.</p>
          </div>
        </div>
      </section>

      {/* Qualifications & memberships */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 space-y-3 text-center">
            <Badge className="bg-sage-100 text-sage-700">Qualifications &amp; Training</Badge>
            <h2 className="font-serif text-3xl text-stone-800 lg:text-4xl">Professional Qualifications &amp; Memberships</h2>
            <p className="text-stone-600">A commitment to learning, professional development and holistic wellbeing.</p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
            <div className="space-y-4 rounded-2xl bg-stone-50 p-6 ring-1 ring-stone-200">
              <h3 className="flex items-center gap-2 font-serif text-2xl text-stone-800">
                <GraduationCap className="h-6 w-6 text-sage-600" aria-hidden /> Academic Qualifications
              </h3>
              <ul className="space-y-3">
                {QUALIFICATIONS.map((q) => (
                  <li key={q} className="flex gap-3 text-stone-700">
                    <Award className="mt-0.5 h-5 w-5 shrink-0 text-sage-600" aria-hidden />
                    {q}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4 rounded-2xl bg-stone-50 p-6 ring-1 ring-stone-200">
              <h3 className="flex items-center gap-2 font-serif text-2xl text-stone-800">
                <BadgeCheck className="h-6 w-6 text-sage-600" aria-hidden /> Professional Associations
              </h3>
              <ul className="space-y-3">
                {MEMBERSHIPS.map(([code, name]) => (
                  <li key={code} className="flex gap-3 text-stone-700">
                    <span className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-semibold text-sage-800 ring-1 ring-sage-200">
                      {code}
                    </span>
                    <span className="self-center">{name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Begin */}
      <section className="bg-sage-600 py-20 text-white">
        <div className="container mx-auto max-w-3xl space-y-6 px-4 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-sage-200" aria-hidden />
          <h2 className="font-serif text-3xl lg:text-4xl">Your Journey, Your Way</h2>
          <p className="text-sage-100">
            There is no single pathway that is right for everyone. What matters is finding an approach that resonates with you and supports your individual
            needs. Whether your journey begins with the mind, the energy or the special connection you share with your animal companion, I welcome you with
            warmth, compassion and an open heart.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-white text-sage-700 hover:bg-stone-50">
              <Link href="/#journey">Explore my services</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-sage-700">
              <Link href="/contact#enquiry">Send an enquiry</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
