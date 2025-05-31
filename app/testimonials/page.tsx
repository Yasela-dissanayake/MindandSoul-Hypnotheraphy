import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Quote, MapPin, Calendar, Heart, CheckCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function TestimonialsPage() {
  const testimonials = [
    {
      name: "Sarah Mitchell",
      location: "Sydney, NSW",
      service: "Anxiety & Stress Relief",
      rating: 5,
      date: "3 months ago",
      image: "/placeholder.svg?height=80&width=80",
      testimonial:
        "After struggling with anxiety for years, the sessions at Mind and Soul have been absolutely life-changing. I feel more confident and at peace than I have in years. The gentle approach made me feel safe and supported throughout the entire process.",
      result: "Reduced anxiety by 80% and improved sleep quality",
    },
    {
      name: "James Thompson",
      location: "Melbourne, VIC",
      service: "Weight Management",
      rating: 5,
      date: "6 months ago",
      image: "/placeholder.svg?height=80&width=80",
      testimonial:
        "The weight management program helped me develop a completely new relationship with food. I've lost 15kg and kept it off for over a year now. More importantly, I've learned to love and respect my body again.",
      result: "Lost 15kg and maintained healthy weight for 12+ months",
    },
    {
      name: "Emma Louise",
      location: "Brisbane, QLD",
      service: "Sleep Improvement",
      rating: 5,
      date: "4 months ago",
      image: "/placeholder.svg?height=80&width=80",
      testimonial:
        "I was skeptical about hypnotherapy, but the professional and caring approach made all the difference. My sleep has improved dramatically - I now fall asleep within minutes instead of lying awake for hours.",
      result: "Sleep onset time reduced from 2+ hours to under 10 minutes",
    },
    {
      name: "Michael Chen",
      location: "Perth, WA",
      service: "Confidence Building",
      rating: 5,
      date: "5 months ago",
      image: "/placeholder.svg?height=80&width=80",
      testimonial:
        "Public speaking used to terrify me, but after working with Mind and Soul, I recently gave a presentation to 200 people and felt completely confident. The transformation has been incredible.",
      result: "Successfully presented to large audiences without anxiety",
    },
    {
      name: "Lisa Rodriguez",
      location: "Adelaide, SA",
      service: "Habit Change",
      rating: 5,
      date: "8 months ago",
      image: "/placeholder.svg?height=80&width=80",
      testimonial:
        "I quit smoking after 15 years thanks to the hypnotherapy sessions. What amazed me most was how natural it felt - no cravings, no withdrawal symptoms. I haven't touched a cigarette since my third session.",
      result: "Smoke-free for 8+ months after 15 years of smoking",
    },
    {
      name: "David Wilson",
      location: "Gold Coast, QLD",
      service: "Pain Management",
      rating: 5,
      date: "7 months ago",
      image: "/placeholder.svg?height=80&width=80",
      testimonial:
        "Chronic back pain had controlled my life for years. Through hypnotherapy, I've learned to manage my pain naturally and have reduced my medication by 70%. I can enjoy activities with my family again.",
      result: "70% reduction in pain medication and improved mobility",
    },
    {
      name: "Rachel Green",
      location: "Canberra, ACT",
      service: "Anxiety & Stress Relief",
      rating: 5,
      date: "2 months ago",
      image: "/placeholder.svg?height=80&width=80",
      testimonial:
        "The panic attacks that plagued me for months have completely stopped. I feel like I have my life back. The sessions were so relaxing and the results have been lasting.",
      result: "Zero panic attacks for 2+ months",
    },
    {
      name: "Tom Anderson",
      location: "Newcastle, NSW",
      service: "Confidence Building",
      rating: 5,
      date: "9 months ago",
      image: "/placeholder.svg?height=80&width=80",
      testimonial:
        "I was promoted to a management position after gaining the confidence to apply for roles I never thought I deserved. The sessions helped me recognize my worth and capabilities.",
      result: "Achieved career promotion and increased salary",
    },
    {
      name: "Sophie Martin",
      location: "Hobart, TAS",
      service: "Sleep Improvement",
      rating: 5,
      date: "6 months ago",
      image: "/placeholder.svg?height=80&width=80",
      testimonial:
        "After years of insomnia, I now sleep 7-8 hours every night. My energy levels have improved dramatically, and I feel like a completely different person during the day.",
      result: "Consistent 7-8 hours of quality sleep nightly",
    },
  ]

  const stats = [
    { number: "95%", label: "Client Satisfaction Rate" },
    { number: "200+", label: "Successful Sessions" },
    { number: "4.9/5", label: "Average Rating" },
    { number: "85%", label: "Achieve Goals in 6 Sessions" },
  ]

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-stone-100 to-sage-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <Badge className="bg-sage-100 text-sage-700">Client Stories</Badge>
            <h1 className="text-4xl lg:text-6xl font-serif text-stone-800 leading-tight">
              Real Stories,
              <span className="text-sage-600"> Real Transformations</span>
            </h1>
            <p className="text-lg text-stone-600 leading-relaxed">
              Discover how hypnotherapy has helped Australians just like you overcome challenges and achieve lasting
              positive change in their lives.
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-6 w-6 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-stone-600 ml-2">4.9/5 from 50+ reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-4xl font-bold text-sage-600">{stat.number}</div>
                <div className="text-stone-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">What Our Clients Say</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Read authentic stories from clients who have experienced transformation through hypnotherapy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-stone-200 hover:shadow-lg transition-shadow">
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
                        <h3 className="font-semibold text-stone-800">{testimonial.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-stone-500">
                          <MapPin className="h-3 w-3" />
                          {testimonial.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  {/* Service Badge */}
                  <Badge variant="outline" className="text-sage-600 border-sage-200">
                    {testimonial.service}
                  </Badge>

                  {/* Quote */}
                  <div className="relative">
                    <Quote className="h-6 w-6 text-stone-300 mb-2" />
                    <p className="text-stone-600 italic leading-relaxed text-sm">"{testimonial.testimonial}"</p>
                  </div>

                  {/* Result */}
                  <div className="bg-sage-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-sage-600" />
                      <span className="text-sm font-medium text-stone-700">Result:</span>
                    </div>
                    <p className="text-sm text-stone-600">{testimonial.result}</p>
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

      {/* Video Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">Video Testimonials</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Hear directly from our clients about their transformation journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Sarah's Anxiety Recovery",
                description: "Watch Sarah share her journey from daily panic attacks to complete peace of mind.",
                thumbnail: "/placeholder.svg?height=300&width=400",
              },
              {
                name: "James's Weight Loss Success",
                description: "James explains how hypnotherapy helped him lose 15kg and keep it off permanently.",
                thumbnail: "/placeholder.svg?height=300&width=400",
              },
            ].map((video, index) => (
              <Card
                key={index}
                className="border-stone-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="relative">
                  <Image
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.name}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[12px] border-l-sage-600 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-stone-800 mb-2">{video.name}</h3>
                  <p className="text-stone-600 text-sm">{video.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Before & After Section */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">Transformation Results</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              See the measurable improvements our clients have achieved through hypnotherapy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                category: "Anxiety Relief",
                before: "Daily panic attacks",
                after: "Calm and confident",
                improvement: "90% reduction in anxiety",
              },
              {
                category: "Sleep Quality",
                before: "2+ hours to fall asleep",
                after: "Asleep within 10 minutes",
                improvement: "8 hours quality sleep nightly",
              },
              {
                category: "Weight Management",
                before: "Emotional eating patterns",
                after: "Healthy relationship with food",
                improvement: "15kg sustainable weight loss",
              },
            ].map((result, index) => (
              <Card key={index} className="border-stone-200 text-center">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-stone-800">{result.category}</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="text-sm font-medium text-red-700">Before</div>
                      <div className="text-red-600">{result.before}</div>
                    </div>
                    <div className="flex justify-center">
                      <div className="w-8 h-8 bg-sage-100 rounded-full flex items-center justify-center">
                        <Heart className="h-4 w-4 text-sage-600" />
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-700">After</div>
                      <div className="text-green-600">{result.after}</div>
                    </div>
                  </div>
                  <Badge className="bg-sage-100 text-sage-700">{result.improvement}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-sage-600 text-white">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl lg:text-4xl font-serif">Ready to Write Your Success Story?</h2>
          <p className="text-sage-100 max-w-2xl mx-auto">
            Join the hundreds of Australians who have transformed their lives through hypnotherapy. Your journey to
            positive change starts with a single step.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking">
              <Button size="lg" className="bg-white text-sage-600 hover:bg-stone-50">
                Book Free Consultation
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Ask Questions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
