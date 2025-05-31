import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Heart, Leaf, CheckCircle, Star, Calendar, Clock, Users } from "lucide-react"
import Link from "next/link"

export default function ServicesPage() {
  const services = [
    {
      id: "anxiety",
      icon: Brain,
      title: "Anxiety & Stress Relief",
      shortDesc: "Find calm and peace through targeted hypnotherapy techniques.",
      fullDesc:
        "Anxiety and stress can feel overwhelming, but you don't have to face them alone. Through gentle hypnotherapy techniques, we'll work together to reprogram your subconscious responses to stress triggers, helping you develop lasting coping strategies and inner calm.",
      duration: "60-90 minutes",
      price: "From $120",
      sessions: "4-6 sessions recommended",
      benefits: [
        "Reduced anxiety and panic attacks",
        "Better stress management",
        "Improved sleep quality",
        "Enhanced emotional regulation",
        "Increased confidence in challenging situations",
      ],
    },
    {
      id: "confidence",
      icon: Heart,
      title: "Confidence Building",
      shortDesc: "Unlock your inner confidence and self-esteem.",
      fullDesc:
        "Low self-confidence can hold you back from achieving your dreams. Using powerful hypnotherapy techniques, we'll identify and transform limiting beliefs, helping you build unshakeable self-confidence and self-worth from within.",
      duration: "60-90 minutes",
      price: "From $120",
      sessions: "3-5 sessions recommended",
      benefits: [
        "Increased self-confidence",
        "Better public speaking abilities",
        "Improved social interactions",
        "Enhanced self-worth",
        "Greater willingness to take positive risks",
      ],
    },
    {
      id: "habits",
      icon: Leaf,
      title: "Habit Change",
      shortDesc: "Break free from unwanted habits and create positive patterns.",
      fullDesc:
        "Whether it's smoking, nail-biting, or other unwanted behaviors, hypnotherapy can help you break free from habits that no longer serve you. We'll work with your subconscious mind to create new, positive patterns that support your wellbeing.",
      duration: "60-90 minutes",
      price: "From $120",
      sessions: "3-6 sessions recommended",
      benefits: [
        "Freedom from unwanted habits",
        "Stronger willpower and self-control",
        "Healthier lifestyle choices",
        "Reduced cravings and urges",
        "Long-lasting behavioral change",
      ],
    },
    {
      id: "weight",
      icon: CheckCircle,
      title: "Weight Management",
      shortDesc: "Develop a healthy relationship with food and your body.",
      fullDesc:
        "Weight management isn't just about willpower—it's about changing your relationship with food at a subconscious level. Through hypnotherapy, we'll address emotional eating patterns and help you develop a healthy, sustainable approach to nutrition and body image.",
      duration: "60-90 minutes",
      price: "From $120",
      sessions: "6-8 sessions recommended",
      benefits: [
        "Healthier relationship with food",
        "Reduced emotional eating",
        "Increased motivation for exercise",
        "Better portion control",
        "Sustainable weight management",
      ],
    },
    {
      id: "sleep",
      icon: Star,
      title: "Sleep Improvement",
      shortDesc: "Overcome insomnia and sleep issues naturally.",
      fullDesc:
        "Quality sleep is essential for your physical and mental wellbeing. If you're struggling with insomnia or poor sleep quality, hypnotherapy can help you develop healthy sleep patterns and overcome the mental barriers that keep you awake.",
      duration: "60-90 minutes",
      price: "From $120",
      sessions: "3-5 sessions recommended",
      benefits: [
        "Faster sleep onset",
        "Deeper, more restful sleep",
        "Reduced nighttime anxiety",
        "Better sleep routine",
        "Increased daytime energy",
      ],
    },
    {
      id: "pain",
      icon: Calendar,
      title: "Pain Management",
      shortDesc: "Learn to manage chronic pain through mind-body connection.",
      fullDesc:
        "Chronic pain affects every aspect of your life, but your mind has incredible power to influence your pain experience. Through specialized hypnotherapy techniques, we'll help you develop effective pain management strategies and improve your quality of life.",
      duration: "60-90 minutes",
      price: "From $120",
      sessions: "4-8 sessions recommended",
      benefits: [
        "Reduced pain intensity",
        "Better pain coping strategies",
        "Improved quality of life",
        "Reduced reliance on medication",
        "Enhanced relaxation and comfort",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-stone-100 to-sage-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <Badge className="bg-sage-100 text-sage-700">Our Services</Badge>
            <h1 className="text-4xl lg:text-6xl font-serif text-stone-800 leading-tight">
              Personalized
              <span className="text-sage-600"> Hypnotherapy Solutions</span>
            </h1>
            <p className="text-lg text-stone-600 leading-relaxed">
              Each session is tailored to your unique needs, helping you achieve your goals through the transformative
              power of your subconscious mind.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking">
                <Button size="lg" className="bg-sage-600 hover:bg-sage-700 text-white">
                  Book Free Consultation
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50">
                  Ask Questions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="border-stone-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sage-100 rounded-lg">
                      <service.icon className="h-6 w-6 text-sage-600" />
                    </div>
                    <h3 className="font-semibold text-stone-800">{service.title}</h3>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">{service.shortDesc}</p>
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-stone-500">
                      <Clock className="inline h-3 w-3 mr-1" />
                      {service.duration}
                    </div>
                    <div className="font-semibold text-sage-600">{service.price}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Services */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">Detailed Service Information</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Learn more about each service and how it can help you achieve your goals.
            </p>
          </div>

          <Tabs defaultValue="anxiety" className="max-w-6xl mx-auto">
            <TabsList className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
              {services.map((service) => (
                <TabsTrigger key={service.id} value={service.id} className="text-xs">
                  {service.title.split(" ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {services.map((service) => (
              <TabsContent key={service.id} value={service.id}>
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-sage-100 rounded-lg">
                        <service.icon className="h-8 w-8 text-sage-600" />
                      </div>
                      <h3 className="text-2xl font-serif text-stone-800">{service.title}</h3>
                    </div>
                    <p className="text-stone-600 leading-relaxed">{service.fullDesc}</p>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-sage-50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-stone-700">Duration</div>
                        <div className="text-stone-600">{service.duration}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-stone-700">Investment</div>
                        <div className="text-sage-600 font-semibold">{service.price}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm font-medium text-stone-700">Recommended</div>
                        <div className="text-stone-600">{service.sessions}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xl font-semibold text-stone-800">What You Can Expect</h4>
                    <ul className="space-y-3">
                      {service.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-sage-600 mt-0.5 flex-shrink-0" />
                          <span className="text-stone-600">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full bg-sage-600 hover:bg-sage-700 text-white">Book This Service</Button>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">How It Works</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Your journey to transformation follows a proven, gentle process designed for lasting results.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Free Consultation",
                description: "We discuss your goals and determine if hypnotherapy is right for you.",
                icon: Users,
              },
              {
                step: "02",
                title: "Personalized Plan",
                description: "I create a tailored treatment plan based on your specific needs.",
                icon: Brain,
              },
              {
                step: "03",
                title: "Gentle Sessions",
                description: "Relaxing hypnotherapy sessions in a safe, comfortable environment.",
                icon: Leaf,
              },
              {
                step: "04",
                title: "Lasting Change",
                description: "Experience positive transformation that continues beyond our sessions.",
                icon: Star,
              },
            ].map((step, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto">
                    <step.icon className="h-8 w-8 text-sage-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-sage-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-stone-800">{step.title}</h3>
                <p className="text-stone-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">Frequently Asked Questions</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  question: "Is hypnotherapy safe?",
                  answer:
                    "Yes, hypnotherapy is completely safe when conducted by a qualified practitioner. You remain in control throughout the session and cannot be made to do anything against your will.",
                },
                {
                  question: "How many sessions will I need?",
                  answer:
                    "This varies depending on your goals and individual circumstances. Most clients see significant improvement within 3-6 sessions, though some may need more or fewer.",
                },
                {
                  question: "Will I remember the session?",
                  answer:
                    "Most people remember everything that happens during hypnosis. You'll be in a relaxed, focused state but remain aware of your surroundings.",
                },
                {
                  question: "Can anyone be hypnotized?",
                  answer:
                    "Most people can be hypnotized to some degree. Your willingness to participate and trust in the process are the most important factors for success.",
                },
              ].map((faq, index) => (
                <Card key={index} className="border-stone-200">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-stone-800 mb-3">{faq.question}</h3>
                    <p className="text-stone-600 text-sm leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-sage-600 text-white">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl lg:text-4xl font-serif">Ready to Transform Your Life?</h2>
          <p className="text-sage-100 max-w-2xl mx-auto">
            Don't let another day pass feeling stuck. Take the first step towards positive change with a free
            consultation.
          </p>
          <Link href="/booking">
            <Button size="lg" className="bg-white text-sage-600 hover:bg-stone-50">
              Book Your Free Consultation Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
