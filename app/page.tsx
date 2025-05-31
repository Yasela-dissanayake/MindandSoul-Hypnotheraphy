import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Phone, Mail, MapPin, Clock, Star, Leaf, Heart, Brain, Calendar, CheckCircle, Quote } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-stone-100 to-sage-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-sage-100 text-sage-700 hover:bg-sage-100">
                  Professional Hypnotherapy Services
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-serif text-stone-800 leading-tight">
                  Transform Your Mind,
                  <span className="text-sage-600"> Heal Your Soul</span>
                </h1>
                <p className="text-lg text-stone-600 leading-relaxed">
                  Discover the power of your subconscious mind through gentle, effective hypnotherapy. Based in
                  Australia, helping you overcome challenges and achieve lasting positive change.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-sage-600 hover:bg-sage-700 text-white">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Free Consultation
                </Button>
                <Button size="lg" variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50">
                  Learn More
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-sage-600" />
                  <span className="text-sm text-stone-600">Certified Practitioner</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-sage-600" />
                  <span className="text-sm text-stone-600">100% Confidential</span>
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
                      <div key={i} className="w-8 h-8 rounded-full bg-sage-200 border-2 border-white" />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-stone-600">50+ Happy Clients</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-stone-100 text-stone-700">About Mind and Soul</Badge>
                <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
                  Your Journey to Inner Peace Starts Here
                </h2>
                <p className="text-stone-600 leading-relaxed">
                  Welcome to Mind and Soul, where transformation meets tranquility. As a certified hypnotherapist based
                  in Australia, I'm dedicated to helping you unlock your inner potential and overcome the barriers that
                  hold you back.
                </p>
                <p className="text-stone-600 leading-relaxed">
                  With years of experience and a gentle, compassionate approach, I guide clients through personalized
                  hypnotherapy sessions designed to create lasting positive change in their lives.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-sage-600">5+</div>
                  <div className="text-sm text-stone-600">Years Experience</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-sage-600">200+</div>
                  <div className="text-sm text-stone-600">Sessions Completed</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <Image
                src="https://mindandsoulworks.ae/wp-content/uploads/2024/06/meditation-2-new.jpg"
                alt="Professional hypnotherapist in peaceful setting"
                width={500}
                height={500}
                className="rounded-2xl object-cover w-full h-[500px] shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-sage-100 text-sage-700">Our Services</Badge>
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">Personalized Hypnotherapy Solutions</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Each session is tailored to your unique needs, helping you achieve your goals through the power of your
              subconscious mind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Anxiety & Stress Relief",
                description:
                  "Find calm and peace through targeted hypnotherapy techniques designed to reduce anxiety and manage stress effectively.",
                duration: "60-90 minutes",
                price: "From $120",
              },
              {
                icon: Heart,
                title: "Confidence Building",
                description:
                  "Unlock your inner confidence and self-esteem with personalized sessions that reprogram limiting beliefs.",
                duration: "60-90 minutes",
                price: "From $120",
              },
              {
                icon: Leaf,
                title: "Habit Change",
                description:
                  "Break free from unwanted habits and create positive new patterns that support your wellbeing.",
                duration: "60-90 minutes",
                price: "From $120",
              },
              {
                icon: CheckCircle,
                title: "Weight Management",
                description:
                  "Develop a healthy relationship with food and your body through subconscious mind programming.",
                duration: "60-90 minutes",
                price: "From $120",
              },
              {
                icon: Star,
                title: "Sleep Improvement",
                description:
                  "Overcome insomnia and sleep issues with relaxation techniques and subconscious reprogramming.",
                duration: "60-90 minutes",
                price: "From $120",
              },
              {
                icon: Calendar,
                title: "Pain Management",
                description:
                  "Learn to manage chronic pain through the mind-body connection and hypnotic pain relief techniques.",
                duration: "60-90 minutes",
                price: "From $120",
              },
            ].map((service, index) => (
              <Card key={index} className="border-stone-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sage-100 rounded-lg">
                      <service.icon className="h-6 w-6 text-sage-600" />
                    </div>
                    <h3 className="font-semibold text-stone-800">{service.title}</h3>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">{service.description}</p>
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

          <div className="text-center mt-12">
            <Button size="lg" className="bg-sage-600 hover:bg-sage-700 text-white">
              View All Services
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-stone-100 text-stone-700">Client Stories</Badge>
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">Transformations That Inspire</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah M.",
                location: "Sydney, NSW",
                text: "After struggling with anxiety for years, the sessions at Mind and Soul have been life-changing. I feel more confident and at peace than I have in years.",
                rating: 5,
              },
              {
                name: "James T.",
                location: "Melbourne, VIC",
                text: "The weight management program helped me develop a completely new relationship with food. I've lost 15kg and kept it off for over a year now.",
                rating: 5,
              },
              {
                name: "Emma L.",
                location: "Brisbane, QLD",
                text: "I was skeptical about hypnotherapy, but the professional and caring approach made all the difference. My sleep has improved dramatically.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-stone-200">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-stone-300" />
                  <p className="text-stone-600 italic leading-relaxed">"{testimonial.text}"</p>
                  <div className="pt-4 border-t border-stone-100">
                    <div className="font-semibold text-stone-800">{testimonial.name}</div>
                    <div className="text-sm text-stone-500">{testimonial.location}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-sage-100 text-sage-700">Get In Touch</Badge>
                <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">Ready to Begin Your Journey?</h2>
                <p className="text-stone-600 leading-relaxed">
                  Take the first step towards positive change. Book your free consultation today and discover how
                  hypnotherapy can help you achieve your goals.
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
                    <div className="text-stone-600">hello@mindandsoul.com.au</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sage-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-sage-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-800">Location</div>
                    <div className="text-stone-600">Sydney & Online Sessions Available</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sage-100 rounded-lg">
                    <Clock className="h-5 w-5 text-sage-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-800">Hours</div>
                    <div className="text-stone-600">Mon-Fri: 9AM-6PM | Sat: 9AM-2PM</div>
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-stone-200">
              <CardContent className="p-8 space-y-6">
                <h3 className="text-xl font-semibold text-stone-800">Book Your Free Consultation</h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">First Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                        placeholder="Your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                        placeholder="Your last name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                      placeholder="+61 xxx xxx xxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">How can we help you?</label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                      placeholder="Tell us about your goals and what you'd like to achieve..."
                    />
                  </div>
                  <Button className="w-full bg-sage-600 hover:bg-sage-700 text-white">Send Message</Button>
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
                <h3 className="text-xl font-serif">Mind and Soul</h3>
              </div>
              <p className="text-stone-300 text-sm leading-relaxed">
                Professional hypnotherapy services helping Australians achieve positive change and inner peace through
                the power of the subconscious mind.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <Link href="/about" className="block text-stone-300 hover:text-white transition-colors">
                  About
                </Link>
                <Link href="/services" className="block text-stone-300 hover:text-white transition-colors">
                  Services
                </Link>
                <Link href="/testimonials" className="block text-stone-300 hover:text-white transition-colors">
                  Testimonials
                </Link>
                <Link href="/contact" className="block text-stone-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Contact Info</h4>
              <div className="space-y-2 text-sm text-stone-300">
                <div>+61 2 1234 5678</div>
                <div>hello@mindandsoul.com.au</div>
                <div>Sydney, Australia</div>
              </div>
            </div>
          </div>

          <Separator className="my-8 bg-stone-700" />

          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-stone-400">
            <div>© 2024 Mind and Soul Hypnotherapy. All rights reserved.</div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
