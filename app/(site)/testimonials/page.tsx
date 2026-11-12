import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Quote,
  MapPin,
  Calendar,
  Heart,
  CheckCircle,
  Brain,
  Sparkles,
  Leaf,
  Eye,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function TestimonialsPage() {
  const testimonials = [
    {
      name: "Shabeena Packeerally",
      location: "Dubai, UAE",
      service: "Meditation Coaching",
      rating: 5,
      date: "Recent client",
      image: "/placeholder.svg?height=80&width=80",
      testimonial:
        "Having attended a meditation session instructed by Rangi, I experienced an amazing sense of calm and relaxation that eased my inner worry. She has mastered the art of meditation and was able to deliver it beautifully. This platform is truly a sanctuary for healing and self-discovery, and I highly recommend it to anyone seeking inner peace.",
      result: "Amazing sense of calm and relaxation, eased inner worry",
      icon: Heart,
    },
    {
      name: "Joe",
      location: "International Client",
      service: "Healing Meditation",
      rating: 5,
      date: "Recent client",
      image: "/placeholder.svg?height=80&width=80",
      testimonial:
        "The healing meditation done with Rangika was mind-blowing. Seeking validation all the time, I wasn't sure what was expected from the session. I'm pleased with the result and totally owe the comfort I feel from eased up migraine to her, may you be blessed to carry on your valuable work to make this world a better place.",
      result: "Mind-blowing healing experience, migraine relief",
      icon: Brain,
    },
    {
      name: "Ruth Mascarenhas",
      location: "Pet Parent",
      service: "Animal Reiki (Remote)",
      rating: 5,
      date: "Recent client",
      image: "/placeholder.svg?height=80&width=80",
      testimonial:
        "My pet and I have never been this happy! My dog Bella is much calmer, less aggressive, and responds to her trainer well whom she used to hate before. All thanks to the Reiki session performed remotely by Rangi and the crystal she wears recommended by Rangi. Your hands are indeed magical. Thank you so much.",
      result: "Dog became calmer, less aggressive, better training response",
      icon: Leaf,
    },
    {
      name: "Rehan Stewart",
      location: "Professional Client",
      service: "Clinical Hypnotherapy - Anger Management",
      rating: 5,
      date: "Recent client",
      image: "/placeholder.svg?height=80&width=80",
      testimonial:
        "I recently had the privilege of working with Mrs. Rangika Mathew for hypnotherapy sessions focused on anger management. From the very first session, I felt a deep sense of trust and professionalism in her approach. Her techniques helped me uncover and address the root causes of my emotions, allowing me to develop a calmer, more balanced mindset. Through guided hypnosis, I gained valuable tools to handle stress and triggers more effectively, leading to noticeable improvements in my daily interactions and overall well-being. I highly recommend her services to anyone seeking emotional healing, self-awareness, or a deeper connection with their inner self.",
      result:
        "Calmer mindset, better stress management, improved daily interactions",
      icon: Brain,
    },
    {
      name: "A.K.",
      location: "Confidential Client",
      service: "Past Life Regression Therapy",
      rating: 5,
      date: "Recent client",
      image: "/placeholder.svg?height=80&width=80",
      testimonial:
        "I didn't know what to expect from Past Life Regression, but what I experienced was deeply healing and eye-opening. The session gently guided me into a past life that helped me understand patterns I've been struggling with for years—especially around fear and relationships. I came away with a sense of peace, clarity, and even forgiveness I didn't know I needed. The way the session was held—with such safety, warmth, and compassion—made all the difference. It was truly a turning point in my healing journey. I'm truly grateful to you.",
      result: "Understanding of life patterns, peace, clarity, and forgiveness",
      icon: Eye,
    },
    {
      name: "Emma R.",
      location: "Australia",
      service: "Reiki Energy Healing",
      rating: 5,
      date: "Recent client",
      image: "/placeholder.svg?height=80&width=80",
      testimonial:
        "I began Reiki sessions hoping to feel more relaxed, but I didn't expect how much it would help with my anger and emotional overwhelm. I used to react quickly and carry so much tension in my body, but after a few sessions, I noticed a real shift. The energy work helped me release built-up emotions I didn't even know I was holding. I feel calmer, more in control, and more connected to myself. Each session brings a sense of peace I hadn't felt in years. This has been a truly transformative part of my healing journey. Rangika's super intuitive guidance is nothing less than a path to total healing and understanding.",
      result:
        "Released emotional tension, calmer reactions, deeper self-connection",
      icon: Sparkles,
    },
  ];

  const serviceStats = [
    { number: "100%", label: "Client Satisfaction Rate" },
    { number: "Global", label: "Clientele Reach" },
    { number: "5/5", label: "Average Rating" },
    { number: "Multiple", label: "Healing Modalities" },
  ];

  const serviceCategories = [
    {
      category: "Clinical Hypnotherapy",
      icon: Brain,
      color: "bg-blue-50 border-blue-200 text-blue-700",
      testimonials: testimonials.filter((t) =>
        t.service.includes("Hypnotherapy")
      ),
    },
    {
      category: "Energy Healing",
      icon: Sparkles,
      color: "bg-purple-50 border-purple-200 text-purple-700",
      testimonials: testimonials.filter((t) => t.service.includes("Reiki")),
    },
    {
      category: "Meditation & Mindfulness",
      icon: Heart,
      color: "bg-green-50 border-green-200 text-green-700",
      testimonials: testimonials.filter((t) =>
        t.service.includes("Meditation")
      ),
    },
    {
      category: "Past Life Regression",
      icon: Eye,
      color: "bg-amber-50 border-amber-200 text-amber-700",
      testimonials: testimonials.filter((t) => t.service.includes("Past Life")),
    },
    {
      category: "Animal ReikiF Healing",
      icon: Leaf,
      color: "bg-emerald-50 border-emerald-200 text-emerald-700",
      testimonials: testimonials.filter((t) => t.service.includes("Animal")),
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-stone-100 to-sage-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <Badge className="bg-sage-100 text-sage-700">Client Stories</Badge>
            <h1 className="text-4xl lg:text-6xl font-serif text-stone-800 leading-tight">
              Real Healing,
              <span className="text-sage-600"> Real Transformations</span>
            </h1>
            <p className="text-lg text-stone-600 leading-relaxed">
              Discover how Rangika's holistic healing approach has helped
              clients from around the world achieve lasting transformation
              through mind, body, and soul integration.
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-6 w-6 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <span className="text-stone-600 ml-2">
                5/5 from authentic client reviews
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {serviceStats.map((stat, index) => (
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

      {/* Featured Testimonials */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
              Transformational Stories
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Read authentic stories from clients who have experienced profound
              healing through Rangika's diverse range of therapeutic modalities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-stone-200 hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Image
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        width={50}
                        height={50}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-stone-800">
                          {testimonial.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-stone-500">
                          <MapPin className="h-3 w-3" />
                          {testimonial.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Service Badge */}
                  <div className="flex items-center gap-2">
                    <testimonial.icon className="h-4 w-4 text-sage-600" />
                    <Badge
                      variant="outline"
                      className="text-sage-600 border-sage-200"
                    >
                      {testimonial.service}
                    </Badge>
                  </div>

                  {/* Quote */}
                  <div className="relative">
                    <Quote className="h-6 w-6 text-stone-300 mb-2" />
                    <p className="text-stone-600 italic leading-relaxed text-sm">
                      "{testimonial.testimonial}"
                    </p>
                  </div>

                  {/* Result */}
                  <div className="bg-sage-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-sage-600" />
                      <span className="text-sm font-medium text-stone-700">
                        Result:
                      </span>
                    </div>
                    <p className="text-sm text-stone-600">
                      {testimonial.result}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1 text-xs text-stone-500 pt-2 border-t border-stone-100">
                    <Calendar className="h-3 w-3" />
                    {testimonial.date}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials by Service */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
              Stories by Healing Modality
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Explore how different healing approaches have created
              transformation across various aspects of life.
            </p>
          </div>

          <div className="space-y-12">
            {serviceCategories.map((category, index) => (
              <div key={index} className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sage-100 rounded-lg">
                    <category.icon className="h-6 w-6 text-sage-600" />
                  </div>
                  <h3 className="text-2xl font-serif text-stone-800">
                    {category.category}
                  </h3>
                  <Badge className={category.color}>
                    {category.testimonials.length} Stories
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {category.testimonials.map((testimonial, idx) => (
                    <Card key={idx} className="border-stone-200">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-stone-800">
                              {testimonial.name}
                            </h4>
                            <p className="text-sm text-stone-500">
                              {testimonial.location}
                            </p>
                          </div>
                          <div className="flex">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4 fill-amber-400 text-amber-400"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-stone-600 italic text-sm leading-relaxed">
                          "{testimonial.testimonial}"
                        </p>
                        <div className="bg-stone-50 p-3 rounded-lg">
                          <p className="text-sm text-stone-600">
                            <strong>Outcome:</strong> {testimonial.result}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Reach Section */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
              Global Healing Community
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              From Dubai to Australia and beyond, Rangika's healing work has
              touched lives across continents through both in-person and remote
              sessions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                region: "Middle East",
                description:
                  "Established practice in Dubai, UAE serving diverse international community",
                highlight: "Meditation mastery and professional approach",
              },
              {
                region: "Australia",
                description:
                  "Now bringing holistic healing practices to Australian clients",
                highlight: "Energy healing and emotional transformation",
              },
              {
                region: "Remote Healing",
                description:
                  "Distance healing sessions reaching clients worldwide",
                highlight: "Animal Reiki and energy work across borders",
              },
            ].map((region, index) => (
              <Card key={index} className="border-stone-200 text-center">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mx-auto">
                    <MapPin className="h-6 w-6 text-sage-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-stone-800">
                    {region.region}
                  </h3>
                  <p className="text-stone-600 text-sm">{region.description}</p>
                  <div className="bg-sage-50 p-3 rounded-lg">
                    <p className="text-sm text-sage-700 font-medium">
                      {region.highlight}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What Clients Say About Rangika */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
              What Clients Say About Rangika
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                quality: "Professional Approach",
                description:
                  "Deep sense of trust and professionalism from the very first session",
                icon: CheckCircle,
              },
              {
                quality: "Intuitive Guidance",
                description:
                  "Super intuitive guidance that leads to total healing and understanding",
                icon: Heart,
              },
              {
                quality: "Magical Hands",
                description:
                  "Clients describe her healing touch as truly magical and transformative",
                icon: Sparkles,
              },
              {
                quality: "Safe Space",
                description:
                  "Creates sessions with safety, warmth, and compassion that make all the difference",
                icon: Leaf,
              },
            ].map((quality, index) => (
              <Card key={index} className="border-stone-200 text-center">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mx-auto">
                    <quality.icon className="h-6 w-6 text-sage-600" />
                  </div>
                  <h3 className="font-semibold text-stone-800">
                    {quality.quality}
                  </h3>
                  <p className="text-stone-600 text-sm">
                    {quality.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-sage-600 text-white">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl lg:text-4xl font-serif">
            Ready to Write Your Transformation Story?
          </h2>
          <p className="text-sage-100 max-w-2xl mx-auto">
            Join the global community of clients who have experienced profound
            healing through Rangika's holistic approach. Your journey to
            transformation starts with a single step.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-white text-sage-600 hover:bg-stone-50"
              >
                Book Free Consultation
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-black hover:bg-white/10"
              >
                Ask Questions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
