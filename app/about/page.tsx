import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Users,
  Heart,
  Brain,
  Leaf,
  Star,
  Sparkles,
  Zap,
  Clock,
  Cake,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-stone-100 to-sage-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-sage-100 text-sage-700">
                  About Heal With Rangika
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-serif text-stone-800 leading-tight">
                  Meet Your
                  <span className="text-sage-600"> Hypnotherapist</span>
                </h1>
                <p className="text-lg text-stone-600 leading-relaxed">
                  Dedicated to helping human kind unlock their potential through
                  the transformative power of hypnotherapy. With compassion,
                  expertise, and a gentle approach to healing.
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-sage-600" />
                  <span className="text-sm text-stone-600">
                    Certified Clinical Hypnotherapist
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-sage-600" />
                  <span className="text-sm text-stone-600">
                    5+ Years Experience
                  </span>
                </div>
              </div>
            </div>
            <div className="relative">
              <Image
                src="prof3.jpeg"
                alt="Professional hypnotherapist in peaceful setting"
                width={500}
                height={600}
                className="rounded-2xl object-fill w-auto h-[600px] shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
                My Journey to Hypnotherapy
              </h2>
              <p className="text-stone-600 text-lg leading-relaxed">
                Every journey begins with a single step, and mine started with a
                personal transformation that changed my life forever.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-2xl font-serif text-stone-800">
                  From Struggle to Strength
                </h3>
                <p className="text-stone-600 leading-relaxed">
                  My path into healing work was born not only through study but
                  through lived experience. Like many, I’ve navigated dark and
                  difficult chapters. Those personal struggles awakened me to
                  the profound power of self-awareness, inner healing, and the
                  deep connection between the mind, body, and spirit. They’ve
                  shaped my mission: to support others through their own moments
                  of pain, transformation, and awakening.
                </p>
                <p className="text-stone-600 leading-relaxed">
                  I’m here to hold sacred space for your healing—a space where
                  science meets spirit, and where transformation is possible on
                  every level. My goal is to help you reconnect with your inner
                  wisdom, release what no longer serves you, and step forward
                  with clarity, intention,
                </p>
              </div>
              <div className="relative">
                <Image
                  src="rangika_profile.jpeg"
                  alt="Peaceful meditation space"
                  width={400}
                  height={400}
                  className="rounded-xl object-cover w-full shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Qualifications Section */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-sage-100 text-sage-700">
              Qualifications & Training
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
              Professional Excellence
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "Clinical Hypnotherapy & Applied Psychotherapy",
                description:
                  "Diploma holder from Hypnotherapy Training College - Australia",
                category: "Clinical Training",
              },
              {
                icon: Sparkles,
                title:
                  "Advanced Clinical Hypnotherapy & Integrative Psychotherapy",
                description:
                  "Masters Study from Hypnotherapy Training College Australia",
                category: "Advanced Studies",
              },
              {
                icon: Heart,
                title: "Kundalini Reiki Master/Teacher",
                description:
                  "Certified practitioner and teacher of Kundalini Reiki healing",
                category: "Energy Healing",
              },
              {
                icon: Leaf,
                title: "Usui Reiki Master",
                description:
                  "Level I, II & Master Level certification in traditional Usui Reiki",
                category: "Energy Healing",
              },
              {
                icon: Users,
                title: "Animal Reiki Healing & Communication",
                description:
                  "Diploma in healing and communicating with animals",
                category: "Animal Healing",
              },
              {
                icon: Star,
                title: "Therapeutic Arts Practitioner",
                description:
                  "Certified in using creative arts for healing and therapy",
                category: "Creative Therapy",
              },
              {
                icon: Clock,
                title: "Meditation Teaching",
                description:
                  "Diploma in guiding others through meditation practices",
                category: "Mindfulness",
              },
              {
                icon: Zap,
                title: "Life Coach",
                description:
                  "Certified to support personal development and goal achievement",
                category: "Life Coaching",
              },
              {
                icon: Brain,
                title: "Past Life Regression Therapist",
                description:
                  "Certified in accessing and healing past life experiences",
                category: "Regression Therapy",
              },
              {
                icon: CheckCircle,
                title: "Professional Memberships",
                description:
                  "Member of International Institute of Complimentary Therapists & Reiki Professionals",
                category: "Professional Bodies",
              },
              {
                icon: Heart,
                title: "First Aid Provider",
                description:
                  "Certified to provide emergency first aid assistance",
                category: "Safety & Care",
              },
            ].map((qual, index) => (
              <Card
                key={index}
                className="border-stone-200 text-left hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-sage-100 rounded-lg flex-shrink-0 mt-1">
                      <qual.icon className="h-5 w-5 text-sage-600" />
                    </div>
                    <div className="space-y-2">
                      <Badge
                        variant="outline"
                        className="text-xs text-sage-600 border-sage-200"
                      >
                        {qual.category}
                      </Badge>
                      <h3 className="font-semibold text-stone-800 text-sm leading-tight">
                        {qual.title}
                      </h3>
                      <p className="text-stone-600 text-xs leading-relaxed">
                        {qual.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-16 flex col-span-2 gap-10">
            <div className="w-full flex items-center justify-center ">
              <Image src="badge1.jpg" width={200} height={200} alt="badge1" />
            </div>
            <div className="w-full flex items-center justify-center">
              <Image src="badge2.jpeg" width={200} height={100} alt="badge1" />
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
                My Philosophy
              </h2>
              <p className="text-stone-600 text-lg leading-relaxed">
                I believe that every person has the innate ability to heal,
                grow, and transform. My role is simply to guide you to that
                place of inner wisdom and strength that already exists within
                you.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              {[
                {
                  icon: Heart,
                  title: "Compassionate Care",
                  description:
                    "Every session is conducted with empathy, understanding, and complete confidentiality.",
                },
                {
                  icon: Leaf,
                  title: "Gentle Approach",
                  description:
                    "Healing happens at your pace, in a safe and nurturing environment.",
                },
                {
                  icon: Star,
                  title: "Lasting Change",
                  description:
                    "Focus on creating sustainable transformation that enhances your quality of life.",
                },
              ].map((value, index) => (
                <div key={index} className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center">
                    <value.icon className="h-8 w-8 text-sage-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-stone-800">
                    {value.title}
                  </h3>
                  <p className="text-stone-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-sage-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "200+", label: "Sessions Completed" },
              { number: "95%", label: "Client Satisfaction" },
              { number: "5+", label: "Years Experience" },
              { number: "150+", label: "Lives Transformed" },
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-4xl font-bold text-sage-600">
                  {stat.number}
                </div>
                <div className="text-stone-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-stone-800 text-white">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl lg:text-4xl font-serif">
            Ready to Begin Your Transformation?
          </h2>
          <p className="text-stone-300 max-w-2xl mx-auto">
            Take the first step towards positive change. Book your free
            consultation and discover how hypnotherapy can help you achieve your
            goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-sage-600 hover:bg-sage-700">
                Book Free Consultation
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-stone-600 text-black hover:bg-stone-700"
              >
                Contact Me
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
