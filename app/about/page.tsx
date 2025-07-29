import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Award,
  Users,
  Heart,
  Brain,
  Leaf,
  Star,
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
                  Like many of my clients, I once struggled with anxiety and
                  self-doubt. Traditional approaches helped to some extent, but
                  it wasn't until I discovered hypnotherapy that I experienced
                  the profound transformation I had been seeking.
                </p>
                <p className="text-stone-600 leading-relaxed">
                  The power of the subconscious mind fascinated me so much that
                  I decided to dedicate my life to helping others experience the
                  same breakthrough. I completed my certification through the
                  Australian Hypnotherapists Association and have been
                  practicing for over 5 years.
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Award,
                title: "Certified Clinical Hypnotherapist",
                description: "Australian Hypnotherapists Association",
                year: "2019",
              },
              {
                icon: Brain,
                title: "Advanced NLP Practitioner",
                description: "Neuro-Linguistic Programming Certification",
                year: "2020",
              },
              {
                icon: Heart,
                title: "Trauma-Informed Care",
                description: "Specialized training in trauma recovery",
                year: "2021",
              },
              {
                icon: Users,
                title: "Ongoing Education",
                description: "Regular workshops and continued learning",
                year: "Ongoing",
              },
            ].map((qual, index) => (
              <Card key={index} className="border-stone-200 text-center">
                <CardContent className="p-6 space-y-4">
                  <div className="mx-auto w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center">
                    <qual.icon className="h-6 w-6 text-sage-600" />
                  </div>
                  <h3 className="font-semibold text-stone-800">{qual.title}</h3>
                  <p className="text-stone-600 text-sm">{qual.description}</p>
                  <Badge
                    variant="outline"
                    className="text-sage-600 border-sage-200"
                  >
                    {qual.year}
                  </Badge>
                </CardContent>
              </Card>
            ))}
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
            <Link href="/booking">
              <Button size="lg" className="bg-sage-600 hover:bg-sage-700">
                Book Free Consultation
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-stone-600 text-stone-300 hover:bg-stone-700"
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
