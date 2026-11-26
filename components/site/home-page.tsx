"use client";

import { useClientViewer } from "@/components/site/viewer-context";
import { useState } from "react";
import { toast } from "sonner";
import { EnquirySent, sentFrom, type SentEnquiry } from "@/components/site/enquiry-sent";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  Leaf,
  Heart,
  Brain,
  CheckCircle,
  Quote,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { WaysToWork } from "@/components/site/ways-to-work";
import { ENQUIRY_TOPICS } from "@/lib/enquiry-topics";
import { PromotionPopup, PromotionSection } from "@/components/site/promotion";
import { CardCarousel } from "@/components/site/card-carousel";
import type { HomePromotion } from "@/lib/promotions";
import { friendlyError } from "@/lib/friendly-error";

/** The home page. `promotion` = the promotion running now (shown as a pop-up and as the 3rd section), if any. */
export function HomePage({ promotion }: { promotion: HomePromotion | null }) {
  const me = useClientViewer(); // signed in: their details are filled in
  const [loading, setLoading] = useState(false);
  // The enquiry that was just sent: the form shows a thank-you message instead.
  const [sent, setSent] = useState<SentEnquiry | null>(null);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    type: "question" | "consultation"
  ) => {
    e.preventDefault();
    setLoading(true);
    // setMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    // const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData.entries());
    body.formType = type;

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        // Show a thank-you message in place of the form.
        form.reset();
        setSent(sentFrom(type, body));
      } else {
        toast.error("Your message wasn't sent", {
          description: (await res.json().catch(() => ({}))).error || "Please check your details and try again.",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Your message wasn't sent", {
        description: friendlyError(err, "We couldn't send your message. Please try again in a moment."),
      });
    } finally {
      setLoading(false);
    }
  };

  const testimonials = [
    {
      name: "Shabeena Packeerally",
      service: "Meditation Session",
      text: "Having attended a meditation session instructed by Rangi, I experienced an amazing sense of calm and relaxation that eased my inner worry. She has mastered the art of meditation and was able to deliver it beautifully. This platform is truly a sanctuary for healing and self-discovery, and I highly recommend it to anyone seeking inner peace.",
      rating: 5,
    },
    {
      name: "Joe",
      service: "Healing Meditation",
      text: "The healing meditation done with Rangika was mind-blowing. Seeking validation all the time, I wasn't sure what was expected from the session. I'm pleased with the result and totally owe the comfort I feel from eased up migraine to her, may you be blessed to carry on your valuable work to make this world a better place.",
      rating: 5,
    },
    {
      name: "Ruth Mascarenhas",
      service: "Animal Reiki (Remote)",
      text: "My pet and I have never been this happy! My dog Bella is much calmer, less aggressive, and responds to her trainer well whom she used to hate before. All thanks to the Reiki session performed remotely by Rangi and the crystal she wears recommended by Rangi. Your hands are indeed magical. Thank you so much.",
      rating: 5,
    },
    {
      name: "Rehan Stewart",
      service: "Clinical Hypnotherapy - Anger Management",
      text: "I recently had the privilege of working with Mrs. Rangika Mathew for hypnotherapy sessions focused on anger management. From the very first session, I felt a deep sense of trust and professionalism in her approach. Her techniques helped me uncover and address the root causes of my emotions, allowing me to develop a calmer, more balanced mindset. Through guided hypnosis, I gained valuable tools to handle stress and triggers more effectively, leading to noticeable improvements in my daily interactions and overall well-being. I highly recommend her services to anyone seeking emotional healing, self-awareness, or a deeper connection with their inner self.",
      rating: 5,
    },
    {
      name: "A.K.",
      service: "Past Life Regression Therapy",
      text: "I didn't know what to expect from Past Life Regression, but what I experienced was deeply healing and eye-opening. The session gently guided me into a past life that helped me understand patterns I've been struggling with for years—especially around fear and relationships. I came away with a sense of peace, clarity, and even forgiveness I didn't know I needed. The way the session was held—with such safety, warmth, and compassion—made all the difference. It was truly a turning point in my healing journey. I'm truly grateful to you.",
      rating: 5,
    },
    {
      name: "Emma R.",
      service: "Reiki Energy Healing",
      text: "I began Reiki sessions hoping to feel more relaxed, but I didn't expect how much it would help with my anger and emotional overwhelm. I used to react quickly and carry so much tension in my body, but after a few sessions, I noticed a real shift. The energy work helped me release built-up emotions I didn't even know I was holding. I feel calmer, more in control, and more connected to myself. Each session brings a sense of peace I hadn't felt in years. This has been a truly transformative part of my healing journey. Rangika's super intuitive guidance is nothing less than a path to total healing and understanding.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-stone-100 to-sage-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="gap-2 bg-gold-50 py-1 font-medium tracking-wide text-gold-800 ring-1 ring-gold-200 hover:bg-gold-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/lotus.svg" alt="" width={18} height={11} className="h-[11px] w-[18px]" />
                  Heal Within. Grow Beyond.
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-serif text-stone-800 leading-tight">
                  A nurturing space for
                  <span className="text-sage-600"> mind, body and soul</span>
                </h1>
                <p className="text-lg text-stone-600 leading-relaxed">
                  Supporting your journey towards inner balance, emotional
                  wellbeing, spiritual connection and personal transformation.
                </p>
                <p className="text-sm font-medium tracking-wide text-sage-700">
                  Clinical Hypnotherapy · Reiki Energy Healing · Animal
                  Reiki/Communication · Reiki Training
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="#journey">
                  <Button
                    size="lg"
                    className="bg-sage-600 hover:bg-sage-700 text-white"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Explore Your Healing Journey
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-stone-300 text-stone-700 hover:bg-stone-50 bg-transparent"
                  >
                    Meet Rangika
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-sage-600" />
                  <span className="text-sm text-stone-600">
                    Certified Clinical Hypnotherapist
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-sage-600" />
                  <span className="text-sm text-stone-600">
                    Certified Energy Healer
                  </span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative h-[600px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/rangika3.jpeg"
                  alt="Peaceful meditation and hypnotherapy session"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-6 shadow-lg border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {/* Placeholder portraits (AI-generated, not real people); swap for real client photos (with their permission). */}
                    {[1, 2, 3].map((i) => (
                      <Image
                        key={i}
                        src={`/avatars/client-${i}.jpg`}
                        alt=""
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full border-2 border-white bg-sage-200 object-cover"
                      />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-stone-600">Global Clientele</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Rangika Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-stone-100 text-stone-700">
                  A gentle space to pause, reconnect and rediscover yourself
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
                  Welcome. I&apos;m Rangika, and I&apos;m so glad you&apos;ve
                  found your way here.
                </h2>
                <p className="text-stone-600 leading-relaxed">
                  Life can sometimes leave us feeling overwhelmed, disconnected
                  or searching for something more. Sometimes we simply need a
                  little space to breathe, reflect, release and reconnect with
                  who we truly are.
                </p>
                <p className="text-stone-600 leading-relaxed">
                  At Mind &amp; Soul Works, I believe that wellbeing is about
                  more than just the mind or the body. It is about nurturing the
                  whole person — mind, body, energy and soul. Through the
                  integration of clinical hypnotherapy, Reiki energy healing and
                  holistic spiritual practices, I offer a compassionate and
                  supportive space for you to explore your own journey of
                  healing, growth and self-discovery.
                </p>
                <p className="text-stone-600 leading-relaxed">
                  Whether you are seeking emotional support, positive personal
                  change, energetic balance, spiritual development or simply a
                  moment of stillness, you are welcome here.
                </p>
              </div>
            </div>
            <div className="relative h-[500px] overflow-hidden rounded-2xl shadow-lg">
              <Image
                src="/meditation group.jpeg"
                alt="Rangika Mathew - Professional hypnotherapist and energy healer"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Promotion (3rd section): only while a promotion is running, for anyone who closed the pop-up */}
      {promotion && <PromotionSection promotion={promotion} />}
      {promotion && <PromotionPopup promotion={promotion} />}

      {/* Mission & Approach Section */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
              Healing is not about becoming someone else.
              <span className="block text-sage-600">
                It is about reconnecting with yourself.
              </span>
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              I believe every individual has their own story, their own
              experiences and their own unique path. There is no single
              approach to wellbeing, and there is no timetable for personal
              growth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-stone-200 text-center">
              <CardContent className="p-8 space-y-4">
                <div className="mx-auto w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center">
                  <Heart className="h-8 w-8 text-sage-600" />
                </div>
                <h3 className="text-xl font-semibold text-stone-800">
                  The Therapeutic &amp; the Spiritual
                </h3>
                <p className="text-stone-600">
                  My philosophy brings together the therapeutic and the
                  spiritual, recognising that we can benefit from different
                  approaches at different stages of our lives.
                </p>
              </CardContent>
            </Card>

            <Card className="border-stone-200 text-center">
              <CardContent className="p-8 space-y-4">
                <div className="mx-auto w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center">
                  <Brain className="h-8 w-8 text-sage-600" />
                </div>
                <h3 className="text-xl font-semibold text-stone-800">
                  Welcomed Without Judgement
                </h3>
                <p className="text-stone-600">
                  At Mind &amp; Soul Works, you will be welcomed without
                  judgement, supported with compassion and encouraged to explore
                  what feels right for you.
                </p>
              </CardContent>
            </Card>

            <Card className="border-stone-200 text-center">
              <CardContent className="p-8 space-y-4">
                <div className="mx-auto w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-sage-600" />
                </div>
                <h3 className="text-xl font-semibold text-stone-800">
                  Honouring Every Journey
                </h3>
                <p className="text-stone-600">
                  I honour the uniqueness of every journey, whether it involves
                  working with the mind, nurturing the energy, exploring
                  spirituality or deepening our connection with the animals we
                  love.
                </p>
              </CardContent>
            </Card>
          </div>
          <p className="mt-12 text-center font-serif text-xl italic text-sage-700">
            A little more awareness. A little more balance. A little more
            connection with the beautiful person you already are.
          </p>
        </div>
      </section>

      <WaysToWork />

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-stone-100 text-stone-700">
              Client Stories
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
              Real Transformations, Real Healing
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Discover how Rangika's holistic healing approach has helped
              clients from around the world achieve lasting transformation.
            </p>
          </div>

          <CardCarousel label="Client testimonials" interval={6000}>
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="h-full border-stone-200">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-stone-300" />
                  <p className="text-stone-600 italic leading-relaxed text-sm">
                    "{testimonial.text}"
                  </p>
                  <div className="pt-4 border-t border-stone-100">
                    <div className="font-semibold text-stone-800">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-sage-600">
                      {testimonial.service}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardCarousel>

          <div className="text-center mt-12">
            <Link href="/testimonials">
              <Button
                size="lg"
                variant="outline"
                className="border-stone-300 text-stone-700 hover:bg-stone-50 bg-transparent"
              >
                Read More Stories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-sage-100 text-sage-700">
                  Get In Touch
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
                  Ready to Begin Your Journey?
                </h2>
                <p className="text-stone-600 leading-relaxed">
                  There is no single pathway that is right for everyone. What
                  matters is finding an approach that resonates with you and
                  supports your individual needs. Whether your journey begins
                  with the mind, the energy or the special connection you share
                  with your animal companion, I welcome you with warmth,
                  compassion and an open heart.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sage-100 rounded-lg">
                    <Phone className="h-5 w-5 text-sage-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-800">Phone</div>
                    <div className="text-stone-600">+61 429 940 130</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sage-100 rounded-lg">
                    <Mail className="h-5 w-5 text-sage-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-800">Email</div>
                    <div className="text-stone-600">
                      mindandsoulworks@gmail.com
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sage-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-sage-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-800">Location</div>
                    <div className="text-stone-600">
                      Perth, Western Australia &amp; online
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sage-100 rounded-lg">
                    <Clock className="h-5 w-5 text-sage-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-800">Hours</div>
                    <div className="text-stone-600">
                      Flexible scheduling to suit your needs
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-stone-200">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold text-stone-800">
                      Book Your Free Consultation
                    </h3>
                    {/* <p className="text-stone-600 text-sm">
                          15-minute phone call to discuss your goals and see if
                          hypnotherapy is right for you.
                        </p> */}
                  </div>

                  {sent?.type === "consultation" ? (
                    <EnquirySent sent={sent} onAgain={() => setSent(null)} />
                  ) : (
                  <form
                    onSubmit={(e) => handleSubmit(e, "consultation")}
                    className="space-y-4"
                  >
                    <input suppressHydrationWarning type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          First Name *
                        </label>
                        <input suppressHydrationWarning
                          type="text"
                          required
                          name="firstName"
                          defaultValue={me?.firstName ?? undefined}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                          placeholder="Your first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Last Name *
                        </label>
                        <input suppressHydrationWarning
                          type="text"
                          required
                          name="lastName"
                          defaultValue={me?.lastName ?? undefined}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                          placeholder="Your last name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Email Address *
                      </label>
                      <input suppressHydrationWarning
                        type="email"
                        required
                        name="email"
                        defaultValue={me?.email ?? undefined}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Phone Number *
                      </label>
                      <input suppressHydrationWarning
                        type="tel"
                        required
                        name="phone"
                        defaultValue={me?.phone ?? undefined}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                        placeholder="+61 xxx xxx xxx"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Preferred Contact Method
                      </label>
                      <select suppressHydrationWarning
                        name="contactMethod"
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                      >
                        <option>Phone Call</option>
                        <option>Email</option>
                        <option>Text Message</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        What would you like to work on?
                      </label>
                      <select suppressHydrationWarning
                        name="workOn"
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                      >
                        {ENQUIRY_TOPICS.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Tell me more about your situation
                      </label>
                      <textarea suppressHydrationWarning
                        name="details"
                        rows={4}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                        placeholder="Share what you'd like to achieve and any questions you have..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                    >
                      Request Free Consultation
                    </Button>
                  </form>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-green py-14 text-brand-cream">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-horizontal.svg" alt="Mind & Soul Works · Heal Within. Grow Beyond." width={260} height={68} className="h-auto w-[240px] sm:w-[260px]" />
              <p className="text-brand-cream/70 text-sm leading-relaxed">
                Heal within. Grow beyond. A nurturing space for the mind, body
                and soul: clinical hypnotherapy, Reiki energy healing, Animal
                Reiki &amp; communication and Reiki training.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <Link
                  href="/about"
                  className="block text-brand-cream/70 hover:text-brand-gold transition-colors"
                >
                  About Rangika
                </Link>
                {[
                  ["/hypnotherapy", "Clinical Hypnotherapy"],
                  ["/reiki-healing", "Reiki Energy Healing"],
                  ["/reiki-training", "Reiki Training"],
                  ["/courses", "Courses"],
                ].map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className="block text-brand-cream/70 hover:text-brand-gold transition-colors"
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  href="/testimonials"
                  className="block text-brand-cream/70 hover:text-brand-gold transition-colors"
                >
                  Testimonials
                </Link>
                <Link
                  href="/contact"
                  className="block text-brand-cream/70 hover:text-brand-gold transition-colors"
                >
                  Contact
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">Contact Info</h4>
              <div className="space-y-2 text-sm text-brand-cream/70">
                <div>+61 429 940 130</div>
                <div>mindandsoulworks@gmail.com</div>
                <div>Perth, Western Australia &amp; online worldwide</div>
              </div>
            </div>
          </div>

          <Separator className="my-8 bg-brand-gold/20" />

          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-brand-cream/55">
            <div>© {new Date().getFullYear()} Mind & Soul Works. All rights reserved.</div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="hover:text-brand-gold transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-brand-gold transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
