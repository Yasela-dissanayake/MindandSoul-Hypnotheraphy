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
  Calendar,
  CheckCircle,
  Quote,
  Users,
  Zap,
  GraduationCap,
  Building,
  School,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
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
                <Badge className="bg-sage-100 text-sage-700 hover:bg-sage-100">
                  🌿 Welcome to Mind & Soul Works Australia
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-serif text-stone-800 leading-tight">
                  Where Healing
                  <span className="text-sage-600"> Meets Wholeness</span>
                </h1>
                <p className="text-lg text-stone-600 leading-relaxed">
                  At Mind and Soul Works, we believe true wellness is more than
                  the absence of illness—it's a deep alignment of mind, body,
                  and soul. Our holistic healing platform brings together
                  compassionate therapeutic techniques and ancient healing
                  practices to support your journey toward balance and
                  self-discovery.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/booking">
                  <Button
                    size="lg"
                    className="bg-sage-600 hover:bg-sage-700 text-white"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Free Consultation
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
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.pexels.com/photos/6932123/pexels-photo-6932123.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Peaceful meditation and hypnotherapy session"
                  width={500}
                  height={600}
                  className="object-cover w-full h-[600px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-6 shadow-lg border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-sage-200 border-2 border-white"
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
                  Meet Your Healing Partner
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
                  Rangika Mathew - Founder
                </h2>
                <p className="text-stone-600 leading-relaxed">
                  I'm a Certified Clinical Hypnotherapist, Certified Energy
                  Healer, Meditation Coach, and Life Coach, with a passion for
                  guiding individuals toward deep, lasting
                  transformation—mentally, emotionally, and spiritually.
                </p>
                <p className="text-stone-600 leading-relaxed">
                  Having gone through difficult and dark phases in my own life,
                  I was guided to this path not just through study, but through
                  experience. It was in those challenging seasons that I
                  discovered the true power of healing, self-awareness, and the
                  mind-body-spirit connection.
                </p>
                <p className="text-stone-600 leading-relaxed">
                  As the Founder of Mind and Soul Works in Dubai, UAE, I have
                  had the privilege of supporting a diverse, global clientele
                  through holistic and evidence-based approaches to wellness and
                  now spreading my healing wings in Australia to share my unique
                  gifts.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-sage-600">17+</div>
                  <div className="text-sm text-stone-600">
                    Years Professional Experience
                  </div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-sage-600">Global</div>
                  <div className="text-sm text-stone-600">Clientele Served</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <Image
                src="https://mindandsoulworks.ae/wp-content/uploads/2024/06/meditation-2-new.jpg"
                alt="Rangika Mathew - Professional hypnotherapist and energy healer"
                width={500}
                height={500}
                className="rounded-2xl object-cover w-full h-[500px] shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Approach Section */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
              Our Healing Philosophy
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              My mission is to hold space for healing that bridges science and
              spirit, empowering clients to reconnect with their inner wisdom,
              release what no longer serves them, and live with intention and
              purpose.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-stone-200 text-center">
              <CardContent className="p-8 space-y-4">
                <div className="mx-auto w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center">
                  <Heart className="h-8 w-8 text-sage-600" />
                </div>
                <h3 className="text-xl font-semibold text-stone-800">
                  Holistic & Empowering
                </h3>
                <p className="text-stone-600">
                  Mind and Soul Work's mission is to guide individuals on a
                  journey of self-discovery and healing by integrating therapy,
                  mindfulness and energy healing—empowering mind, body, and soul
                  to restore balance and live with greater clarity, peace, and
                  purpose.
                </p>
              </CardContent>
            </Card>

            <Card className="border-stone-200 text-center">
              <CardContent className="p-8 space-y-4">
                <div className="mx-auto w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center">
                  <Brain className="h-8 w-8 text-sage-600" />
                </div>
                <h3 className="text-xl font-semibold text-stone-800">
                  Therapeutic & Transformational
                </h3>
                <p className="text-stone-600">
                  Committed to offering evidence-informed therapies that support
                  emotional release, inner calm, and personal
                  transformation—through a unique blend of hypnotherapy,
                  mindfulness practices, expressive art, and energetic
                  alignment.
                </p>
              </CardContent>
            </Card>

            <Card className="border-stone-200 text-center">
              <CardContent className="p-8 space-y-4">
                <div className="mx-auto w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-sage-600" />
                </div>
                <h3 className="text-xl font-semibold text-stone-800">
                  Creative & Nurturing
                </h3>
                <p className="text-stone-600">
                  Our purpose is to create a safe, compassionate space where
                  healing unfolds naturally—through creative expression,
                  subconscious exploration, and energetic balance—helping
                  individuals reconnect with their inner strength and wisdom.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-sage-100 text-sage-700">
              Our Core Services
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
              Holistic Healing for Mind, Body & Soul
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Each service is tailored to your unique needs, helping you achieve
              your goals through the transformative power of holistic healing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Clinical Hypnotherapy */}
            <Card className="border-stone-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sage-100 rounded-lg">
                    <Brain className="h-6 w-6 text-sage-600" />
                  </div>
                  <h3 className="font-semibold text-stone-800">
                    Clinical Hypnotherapy
                  </h3>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Empowering you through subconscious healing and
                  transformation. Safe, effective therapeutic technique for
                  lasting change.
                </p>

                {/* Main Service Options */}
                <div className="space-y-3">
                  <div className="border border-stone-100 rounded-lg p-3">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="font-medium text-stone-700">
                        Single Session
                      </span>
                      <span className="font-semibold text-sage-600">$140</span>
                    </div>
                    <div className="text-xs text-stone-500 mb-2">
                      Duration: 60-90 minutes
                    </div>
                    <Link href="/booking?service=clinical-hypnotherapy&package=single">
                      <Button
                        size="sm"
                        className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                      >
                        Book Single Session
                      </Button>
                    </Link>
                  </div>

                  <div className="border border-stone-100 rounded-lg p-3">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="font-medium text-stone-700">
                        3 Sessions Package
                      </span>
                      <span className="font-semibold text-sage-600">$390</span>
                    </div>
                    <div className="text-xs text-stone-500 mb-2">
                      Save $30 • Duration: 60-90 minutes each
                    </div>
                    <Link href="/booking?service=clinical-hypnotherapy&package=3-sessions">
                      <Button
                        size="sm"
                        className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                      >
                        Book 3 Sessions
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="space-y-1">
                  {[
                    "Anxiety & stress relief",
                    "Confidence building",
                    "Habit change",
                    "Emotional trauma healing",
                  ].map((benefit, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-stone-600"
                    >
                      <CheckCircle className="h-3 w-3 text-sage-600" />
                      {benefit}
                    </div>
                  ))}
                </div>

                {/* Special Programs */}
                <div className="border-t border-stone-100 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-stone-700 mb-3">
                    Special Programs:
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-600">
                        Age Regression Therapy
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sage-600 font-medium">$190</span>
                        <Link href="/booking?service=clinical-hypnotherapy&program=age-regression">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs bg-transparent"
                          >
                            Book
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-600">
                        Past Life Regression
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sage-600 font-medium">$235</span>
                        <Link href="/booking?service=clinical-hypnotherapy&program=past-life">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs bg-transparent"
                          >
                            Book
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-600">
                        Weight Loss Program (12 weeks)
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sage-600 font-medium">$1450</span>
                        <Link href="/booking?service=clinical-hypnotherapy&program=weight-loss">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs bg-transparent"
                          >
                            Book
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-600">
                        Sleep Program (12 weeks)
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sage-600 font-medium">$1350</span>
                        <Link href="/booking?service=clinical-hypnotherapy&program=sleep-program">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs bg-transparent"
                          >
                            Book
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-600">
                        IBS Freedom Program (12 weeks)
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sage-600 font-medium">$1350</span>
                        <Link href="/booking?service=clinical-hypnotherapy&program=ibs-program">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs bg-transparent"
                          >
                            Book
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reiki Healing */}
            <Card className="border-stone-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sage-100 rounded-lg">
                    <Heart className="h-6 w-6 text-sage-600" />
                  </div>
                  <h3 className="font-semibold text-stone-800">
                    Reiki Healing
                  </h3>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Restore balance, renew energy, reconnect with your inner peace
                  through gentle energy healing.
                </p>

                {/* In-Person Sessions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-stone-700">
                    In-Person Sessions
                  </h4>

                  <div className="border border-stone-100 rounded-lg p-3">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="font-medium text-stone-700">
                        Single Session
                      </span>
                      <span className="font-semibold text-sage-600">$120</span>
                    </div>
                    <div className="text-xs text-stone-500 mb-2">
                      Duration: 60 minutes
                    </div>
                    <Link href="/booking?service=reiki-healing&type=in-person&package=single">
                      <Button
                        size="sm"
                        className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                      >
                        Book In-Person Single
                      </Button>
                    </Link>
                  </div>

                  <div className="border border-stone-100 rounded-lg p-3">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="font-medium text-stone-700">
                        3 Sessions Package
                      </span>
                      <span className="font-semibold text-sage-600">$320</span>
                    </div>
                    <div className="text-xs text-stone-500 mb-2">
                      Save $40 • Duration: 60 minutes each
                    </div>
                    <Link href="/booking?service=reiki-healing&type=in-person&package=3-sessions">
                      <Button
                        size="sm"
                        className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                      >
                        Book In-Person 3 Sessions
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Distance Sessions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-stone-700">
                    Distance Sessions
                  </h4>

                  <div className="border border-stone-100 rounded-lg p-3">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="font-medium text-stone-700">
                        Single Session
                      </span>
                      <span className="font-semibold text-sage-600">$90</span>
                    </div>
                    <div className="text-xs text-stone-500 mb-2">
                      Duration: 60 minutes
                    </div>
                    <Link href="/booking?service=reiki-healing&type=distance&package=single">
                      <Button
                        size="sm"
                        className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                      >
                        Book Distance Single
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="border border-stone-100 rounded-lg p-2">
                      <div className="text-xs text-stone-700 mb-1">
                        3 Sessions
                      </div>
                      <div className="text-sm font-semibold text-sage-600 mb-2">
                        $250
                      </div>
                      <Link href="/booking?service=reiki-healing&type=distance&package=3-sessions">
                        <Button
                          size="sm"
                          className="w-full text-xs bg-sage-600 hover:bg-sage-700 text-white"
                        >
                          Book 3
                        </Button>
                      </Link>
                    </div>
                    <div className="border border-stone-100 rounded-lg p-2">
                      <div className="text-xs text-stone-700 mb-1">
                        5 Sessions
                      </div>
                      <div className="text-sm font-semibold text-sage-600 mb-2">
                        $420
                      </div>
                      <Link href="/booking?service=reiki-healing&type=distance&package=5-sessions">
                        <Button
                          size="sm"
                          className="w-full text-xs bg-sage-600 hover:bg-sage-700 text-white"
                        >
                          Book 5
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  {[
                    "Release tension & stress",
                    "Mental clarity",
                    "Physical healing support",
                    "Chakra balancing",
                  ].map((benefit, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-stone-600"
                    >
                      <CheckCircle className="h-3 w-3 text-sage-600" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Animal Reiki & Communication */}
            <Card className="border-stone-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sage-100 rounded-lg">
                    <Leaf className="h-6 w-6 text-sage-600" />
                  </div>
                  <h3 className="font-semibold text-stone-800">
                    Animal Reiki & Communication
                  </h3>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Healing, understanding, and connection for your beloved
                  companions through energy work.
                </p>

                {/* In-Person Sessions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-stone-700">
                    In-Person Sessions
                  </h4>

                  <div className="border border-stone-100 rounded-lg p-3">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="font-medium text-stone-700">
                        Single Session
                      </span>
                      <span className="font-semibold text-sage-600">$160</span>
                    </div>
                    <div className="text-xs text-stone-500 mb-2">
                      Duration: 45-60 minutes
                    </div>
                    <Link href="/booking?service=animal-reiki&type=in-person&package=single">
                      <Button
                        size="sm"
                        className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                      >
                        Book In-Person Single
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="border border-stone-100 rounded-lg p-2">
                      <div className="text-xs text-stone-700 mb-1">
                        3 Sessions
                      </div>
                      <div className="text-sm font-semibold text-sage-600 mb-2">
                        $450
                      </div>
                      <Link href="/booking?service=animal-reiki&type=in-person&package=3-sessions">
                        <Button
                          size="sm"
                          className="w-full text-xs bg-sage-600 hover:bg-sage-700 text-white"
                        >
                          Book 3
                        </Button>
                      </Link>
                    </div>
                    <div className="border border-stone-100 rounded-lg p-2">
                      <div className="text-xs text-stone-700 mb-1">
                        5 Sessions
                      </div>
                      <div className="text-sm font-semibold text-sage-600 mb-2">
                        $750
                      </div>
                      <Link href="/booking?service=animal-reiki&type=in-person&package=5-sessions">
                        <Button
                          size="sm"
                          className="w-full text-xs bg-sage-600 hover:bg-sage-700 text-white"
                        >
                          Book 5
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Distance Sessions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-stone-700">
                    Distance Sessions
                  </h4>

                  <div className="border border-stone-100 rounded-lg p-3">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="font-medium text-stone-700">
                        Single Session
                      </span>
                      <span className="font-semibold text-sage-600">$110</span>
                    </div>
                    <div className="text-xs text-stone-500 mb-2">
                      Duration: 45-60 minutes
                    </div>
                    <Link href="/booking?service=animal-reiki&type=distance&package=single">
                      <Button
                        size="sm"
                        className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                      >
                        Book Distance Single
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="border border-stone-100 rounded-lg p-2">
                      <div className="text-xs text-stone-700 mb-1">
                        3 Sessions
                      </div>
                      <div className="text-sm font-semibold text-sage-600 mb-2">
                        $300
                      </div>
                      <Link href="/booking?service=animal-reiki&type=distance&package=3-sessions">
                        <Button
                          size="sm"
                          className="w-full text-xs bg-sage-600 hover:bg-sage-700 text-white"
                        >
                          Book 3
                        </Button>
                      </Link>
                    </div>
                    <div className="border border-stone-100 rounded-lg p-2">
                      <div className="text-xs text-stone-700 mb-1">
                        5 Sessions
                      </div>
                      <div className="text-sm font-semibold text-sage-600 mb-2">
                        $500
                      </div>
                      <Link href="/booking?service=animal-reiki&type=distance&package=5-sessions">
                        <Button
                          size="sm"
                          className="w-full text-xs bg-sage-600 hover:bg-sage-700 text-white"
                        >
                          Book 5
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Pet & Parent Package */}
                <div className="border-t border-stone-100 pt-3">
                  <h4 className="text-sm font-medium text-stone-700 mb-3">
                    Pet & Parent Package
                  </h4>
                  <div className="space-y-2">
                    <div className="text-xs text-stone-600 mb-2">
                      Healing for both you and your pet
                    </div>

                    {/* In-Person Pet & Parent */}
                    <div className="border border-amber-100 rounded-lg p-2 bg-amber-50">
                      <div className="text-xs font-medium text-amber-800 mb-2">
                        In-Person Package
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <div className="text-center">
                          <div className="text-sage-600 font-medium">$250</div>
                          <Link href="/booking?service=animal-reiki&type=pet-parent-in-person&package=single">
                            <Button
                              size="sm"
                              className="w-full text-xs mt-1 bg-sage-600 hover:bg-sage-700 text-white"
                            >
                              1 Session
                            </Button>
                          </Link>
                        </div>
                        <div className="text-center">
                          <div className="text-sage-600 font-medium">$700</div>
                          <Link href="/booking?service=animal-reiki&type=pet-parent-in-person&package=3-sessions">
                            <Button
                              size="sm"
                              className="w-full text-xs mt-1 bg-sage-600 hover:bg-sage-700 text-white"
                            >
                              3 Sessions
                            </Button>
                          </Link>
                        </div>
                        <div className="text-center">
                          <div className="text-sage-600 font-medium">$1000</div>
                          <Link href="/booking?service=animal-reiki&type=pet-parent-in-person&package=5-sessions">
                            <Button
                              size="sm"
                              className="w-full text-xs mt-1 bg-sage-600 hover:bg-sage-700 text-white"
                            >
                              5 Sessions
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Distance Pet & Parent */}
                    <div className="border border-blue-100 rounded-lg p-2 bg-blue-50">
                      <div className="text-xs font-medium text-blue-800 mb-2">
                        Distance Package
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <div className="text-center">
                          <div className="text-sage-600 font-medium">$200</div>
                          <Link href="/booking?service=animal-reiki&type=pet-parent-distance&package=single">
                            <Button
                              size="sm"
                              className="w-full text-xs mt-1 bg-sage-600 hover:bg-sage-700 text-white"
                            >
                              1 Session
                            </Button>
                          </Link>
                        </div>
                        <div className="text-center">
                          <div className="text-sage-600 font-medium">$550</div>
                          <Link href="/booking?service=animal-reiki&type=pet-parent-distance&package=3-sessions">
                            <Button
                              size="sm"
                              className="w-full text-xs mt-1 bg-sage-600 hover:bg-sage-700 text-white"
                            >
                              3 Sessions
                            </Button>
                          </Link>
                        </div>
                        <div className="text-center">
                          <div className="text-sage-600 font-medium">$950</div>
                          <Link href="/booking?service=animal-reiki&type=pet-parent-distance&package=5-sessions">
                            <Button
                              size="sm"
                              className="w-full text-xs mt-1 bg-sage-600 hover:bg-sage-700 text-white"
                            >
                              5 Sessions
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  {[
                    "Pet anxiety relief",
                    "Behavioral understanding",
                    "Emotional balance",
                    "Stronger bonds",
                  ].map((benefit, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-stone-600"
                    >
                      <CheckCircle className="h-3 w-3 text-sage-600" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Lama Fera Healing */}
            <Card className="border-stone-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sage-100 rounded-lg">
                    <Zap className="h-6 w-6 text-sage-600" />
                  </div>
                  <h3 className="font-semibold text-stone-800">
                    Lama Fera Healing
                  </h3>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Ancient Tibetan healing for deep spiritual & energetic
                  transformation from Buddhist monasteries.
                </p>

                <div className="space-y-3">
                  <div className="border border-stone-100 rounded-lg p-3">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="font-medium text-stone-700">
                        In-Person Session
                      </span>
                      <span className="font-semibold text-sage-600">$150</span>
                    </div>
                    <div className="text-xs text-stone-500 mb-2">
                      Duration: 30-45 minutes
                    </div>
                    <Link href="/booking?service=lama-fera&type=in-person">
                      <Button
                        size="sm"
                        className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                      >
                        Book In-Person
                      </Button>
                    </Link>
                  </div>

                  <div className="border border-stone-100 rounded-lg p-3">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="font-medium text-stone-700">
                        Distance Session
                      </span>
                      <span className="font-semibold text-sage-600">$120</span>
                    </div>
                    <div className="text-xs text-stone-500 mb-2">
                      Duration: 30-45 minutes
                    </div>
                    <Link href="/booking?service=lama-fera&type=distance">
                      <Button
                        size="sm"
                        className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                      >
                        Book Distance
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  {[
                    "Remove negative energy",
                    "Clear karmic blocks",
                    "Spiritual growth",
                    "Aura protection",
                  ].map((benefit, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-stone-600"
                    >
                      <CheckCircle className="h-3 w-3 text-sage-600" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link href="/services">
              <Button
                size="lg"
                className="bg-sage-600 hover:bg-sage-700 text-white"
              >
                View All Services & Programs
              </Button>
            </Link>
          </div>
        </div>
      </section>

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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-stone-200">
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
          </div>

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

      {/* Specialized Programs Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
              Specialized Programs
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Comprehensive wellness programs designed for organizations,
              schools, and those seeking to become healers themselves.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Building,
                title: "Corporate Wellness",
                description:
                  "Empowering teams with mindful tools for a healthier, happier workplace",
                features: [
                  "Guided Meditation",
                  "Group Hypnosis",
                  "Art Therapy",
                  "Therapeutic Baking",
                ],
              },
              {
                icon: School,
                title: "School Programs",
                description:
                  "Holistic wellbeing programs for students and educators",
                features: [
                  "Student Wellbeing",
                  "Educator Support",
                  "Mindfulness Training",
                  "Creative Expression",
                ],
              },
              {
                icon: GraduationCap,
                title: "Reiki Training",
                description:
                  "Learn Reiki with confidence and care - Levels 1, 2 & 3 (Master)",
                features: [
                  "Level 1: Self-Healing",
                  "Level 2: Practitioner",
                  "Level 3: Master/Teacher",
                  "Certification",
                ],
              },
              {
                icon: Users,
                title: "Group Programs",
                description:
                  "Community-based healing circles and meditation groups",
                features: [
                  "Meditation Circles",
                  "8-Week Programs",
                  "Morning Sessions",
                  "Community Support",
                ],
              },
            ].map((program, index) => (
              <Card
                key={index}
                className="border-stone-200 hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-sage-100 rounded-lg">
                      <program.icon className="h-6 w-6 text-sage-600" />
                    </div>
                    <h3 className="font-semibold text-stone-800">
                      {program.title}
                    </h3>
                  </div>
                  <p className="text-stone-600 text-sm">
                    {program.description}
                  </p>
                  <div className="space-y-1">
                    {program.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-stone-600"
                      >
                        <CheckCircle className="h-3 w-3 text-sage-600" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-sage-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
              Why Choose Mind & Soul Works?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: CheckCircle,
                title: "Online & In-Person Options",
                description:
                  "Flexible delivery to meet your needs, whether you prefer face-to-face or remote sessions",
              },
              {
                icon: Heart,
                title: "Certified & Trauma-Informed",
                description:
                  "All practitioners are certified in their modalities and trained in trauma-informed care",
              },
              {
                icon: Users,
                title: "Personalized Care",
                description:
                  "Tailored healing journeys designed specifically for your unique needs and goals",
              },
              {
                icon: Leaf,
                title: "Safe & Inclusive Space",
                description:
                  "Judgment-free environment where healing unfolds naturally with compassion and understanding",
              },
            ].map((feature, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <feature.icon className="h-8 w-8 text-sage-600" />
                </div>
                <h3 className="text-xl font-semibold text-stone-800">
                  {feature.title}
                </h3>
                <p className="text-stone-600">{feature.description}</p>
              </div>
            ))}
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
                  Take the first step towards positive change. Book your free
                  consultation today and discover how holistic healing can help
                  you achieve your goals. You are your own healer—we're here to
                  guide and support you.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sage-100 rounded-lg">
                    <Phone className="h-5 w-5 text-sage-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-800">Phone</div>
                    <div className="text-stone-600">+61 2 1234 5678</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sage-100 rounded-lg">
                    <Mail className="h-5 w-5 text-sage-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-800">Email</div>
                    <div className="text-stone-600">
                      hello@mindandsoul.com.au
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
                      Australia & Online Sessions Available
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
                <h3 className="text-xl font-semibold text-stone-800">
                  Book Your Free Consultation
                </h3>
                <p className="text-stone-600 text-sm">
                  30-minute online consultation to discuss your goals and find
                  the right healing approach for you.
                </p>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                        placeholder="Your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                        placeholder="Your last name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                      placeholder="+61 xxx xxx xxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      How can we help you?
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                      placeholder="Tell us about your goals and what you'd like to achieve..."
                    />
                  </div>
                  <Button className="w-full bg-sage-600 hover:bg-sage-700 text-white">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Leaf className="h-6 w-6 text-sage-400" />
                <h3 className="text-xl font-serif">Mind and Soul Works</h3>
              </div>
              <p className="text-stone-300 text-sm leading-relaxed">
                Your partner in healing, growth, and inner transformation.
                Bridging science and spirit to empower you to reconnect with
                your inner wisdom and live with intention and purpose.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <Link
                  href="/about"
                  className="block text-stone-300 hover:text-white transition-colors"
                >
                  About Rangika
                </Link>
                <Link
                  href="/services"
                  className="block text-stone-300 hover:text-white transition-colors"
                >
                  Services
                </Link>
                <Link
                  href="/testimonials"
                  className="block text-stone-300 hover:text-white transition-colors"
                >
                  Testimonials
                </Link>
                <Link
                  href="/contact"
                  className="block text-stone-300 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Contact Info</h4>
              <div className="space-y-2 text-sm text-stone-300">
                <div>+61 2 1234 5678</div>
                <div>hello@mindandsoul.com.au</div>
                <div>Australia & Online Worldwide</div>
              </div>
            </div>
          </div>

          <Separator className="my-8 bg-stone-700" />

          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-stone-400">
            <div>
              © 2024 Mind and Soul Works Australia. All rights reserved.
            </div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
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
