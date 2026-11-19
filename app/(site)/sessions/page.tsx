import Link from "next/link";
import type { Metadata } from "next";
import { Clock, Globe, Heart, MapPin, MessageCircle, Sparkles, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceImageSlider } from "@/components/service-image-slider";
import { CurrencySwitch } from "@/components/site/currency-switch";
import { loadPublishedServices, cheapest } from "@/lib/session-catalog";
import { classPrice, formatPrice, viewerCurrency } from "@/lib/currency";
import { coverUrl } from "@/lib/covers";

export const metadata: Metadata = {
  title: "Sessions · Heal With Rangika",
  description:
    "One-to-one sessions with Rangika: clinical hypnotherapy, age and past life regression, Reiki energy healing, Animal Reiki & communication, Lama Fera and more. In person in Perth or online.",
};
export const dynamic = "force-dynamic";

const SLIDES = [
  { src: "/service_hypnotherapy.jpeg", alt: "A clinical hypnotherapy session with Rangika" },
  { src: "/reiki1.jpeg", alt: "A Reiki energy healing session" },
  { src: "/animal3.jpeg", alt: "Animal Reiki and communication with a dog" },
  { src: "/lama1.jpeg", alt: "A calm space for healing and meditation" },
];

// "What happens during a session" and FAQs, from the website document.
const STEPS = [
  { icon: MessageCircle, title: "Understanding you", text: "Every session begins with a relaxed, confidential conversation about what has brought you here and what you'd like to change." },
  { icon: Sun, title: "Preparing", text: "Rangika explains the process and what to expect, and answers any questions, so you feel comfortable and informed." },
  { icon: Sparkles, title: "The session", text: "A gentle, guided experience tailored to you, whether hypnotherapy, Reiki or animal healing, in person or online." },
  { icon: Heart, title: "Rest and reflect", text: "Time to settle and return to everyday awareness, and to talk about your experience if you wish." },
];
const FAQS = [
  {
    q: "Will I lose control during hypnosis?",
    a: "No. Hypnosis is a natural state of focused attention, often with physical relaxation. It is not sleep or a loss of control: you remain aware, can hear Rangika's voice and can't be made to do anything against your values or wishes.",
  },
  {
    q: "Are sessions available online?",
    a: "Yes. Hypnotherapy, regression, Reiki and Lama Fera are available in person in Perth or online, and all animal sessions are remote. For online sessions you just need a quiet, private space and a reliable internet connection.",
  },
  {
    q: "How long is a session?",
    a: "Usually one hour. Age regression and past life regression sessions are about 1½ hours. The length of each session is shown on its page.",
  },
  {
    q: "How many sessions will I need?",
    a: "It depends on each person, but for hypnotherapy it is always advisable to book a minimum of three sessions. Packages save you money and you book each session whenever it suits you.",
  },
  {
    q: "Do I need to believe in Reiki for it to work?",
    a: "No particular spiritual or religious belief is required. You are welcome to approach it with curiosity and an open mind.",
  },
  {
    q: "Can sessions replace medical treatment?",
    a: "No. Hypnotherapy and Reiki are complementary to appropriate medical, psychological and veterinary care, and do not replace diagnosis, medication or specialist treatment.",
  },
];

export default async function SessionsPage() {
  const [services, currency] = await Promise.all([loadPublishedServices(), viewerCurrency()]);

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="bg-gradient-to-br from-stone-100 to-sage-50 py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl space-y-6">
            <h1 className="font-serif text-4xl leading-tight text-stone-800 lg:text-6xl">
              One-to-One Sessions
              <span className="text-sage-600"> for Mind, Body &amp; Soul</span>
            </h1>
            <p className="text-lg leading-relaxed text-stone-600">
              Different pathways, one intention: supporting your wellbeing with compassion, understanding and care. Every session is tailored to you, in person in
              Perth or online.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="bg-sage-600 text-white hover:bg-sage-700">
                <Link href="/booking">Book a session</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-stone-300 bg-transparent text-stone-700 hover:bg-stone-50">
                <Link href="/contact">Free consultation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <ServiceImageSlider images={SLIDES} interval={6000} />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 flex max-w-7xl flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl text-stone-800 lg:text-4xl">Choose your session</h2>
              <p className="text-stone-600">Each person is looked after individually, with their own private space for session notes and exercises.</p>
            </div>
            <CurrencySwitch current={currency} />
          </div>
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => {
              const from = cheapest(s.options);
              const price = from ? classPrice(from, currency) : null;
              const cover = coverUrl("session", s);
              return (
                <Link
                  key={s.id}
                  href={`/sessions/${s.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:shadow-md hover:ring-sage-300"
                >
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="h-52 w-full object-cover" />
                  ) : (
                    <div className="h-52 bg-gradient-to-br from-sage-100 to-sage-200" />
                  )}
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h3 className="font-serif text-xl text-stone-800 group-hover:text-sage-800">{s.title}</h3>
                    {s.summary && <p className="text-sm text-stone-600">{s.summary}</p>}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-xs text-stone-500">
                      {s.lengthLabel && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-sage-600" /> {s.lengthLabel}
                        </span>
                      )}
                      {s.inPerson && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-sage-600" /> In person
                        </span>
                      )}
                      {s.online && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5 text-sage-600" /> {s.inPerson ? "Online" : "Remote / online"}
                        </span>
                      )}
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-2 pt-3 text-sm">
                      <span className="text-sage-700">{s.enquiryOnly ? "Enquire" : s.options.length > 1 ? `${s.options.length} options` : "Book online"}</span>
                      {price && (
                        <span className="text-lg font-semibold text-stone-800">
                          {s.options.length > 1 && <span className="mr-1 text-xs font-normal text-stone-500">from</span>}
                          {formatPrice(price.amount, price.currency)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-3xl space-y-3 text-center">
            <h2 className="font-serif text-3xl text-stone-800 lg:text-4xl">What happens during a session?</h2>
            <p className="text-stone-600">A gentle journey towards understanding, awareness and positive change. It&apos;s natural to have questions, especially the first time.</p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="space-y-3 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-100 text-sage-700">
                  <step.icon className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold tracking-widest text-sage-600">0{i + 1}</p>
                <h3 className="font-serif text-xl text-stone-800">{step.title}</h3>
                <p className="text-sm text-stone-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-8">
            <h2 className="text-center font-serif text-3xl text-stone-800 lg:text-4xl">Frequently Asked Questions</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {FAQS.map((f) => (
                <div key={f.q} className="space-y-2 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
                  <h3 className="font-medium text-stone-800">{f.q}</h3>
                  <p className="text-sm leading-relaxed text-stone-600">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sage-600 py-16 text-white">
        <div className="container mx-auto space-y-6 px-4 text-center">
          <h2 className="font-serif text-3xl lg:text-4xl">Ready to begin your journey?</h2>
          <p className="mx-auto max-w-2xl text-sage-100">
            You don&apos;t need to have all the answers before you begin. Sometimes the first step is simply being open to exploring new possibilities.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-white text-sage-700 hover:bg-stone-50">
              <Link href="/booking">Book a session</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-sage-700">
              <Link href="/contact">Ask for a free consultation</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
