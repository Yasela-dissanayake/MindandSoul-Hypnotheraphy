import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Calendar,
  CheckCircle,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      question: formData.get("question"),
    };

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMessage("✅ Your question has been sent successfully!");
        e.currentTarget.reset();
      } else {
        setMessage("❌ Failed to send. Please try again later.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-stone-100 to-sage-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-sage-100 text-sage-700">
                  Get In Touch
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-serif text-stone-800 leading-tight">
                  Ready to Begin Your
                  <span className="text-sage-600"> Transformation?</span>
                </h1>
                <p className="text-lg text-stone-600 leading-relaxed">
                  Take the first step towards positive change. Book your free
                  consultation today and discover how hypnotherapy can help you
                  achieve your goals.
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-sage-600" />
                  <span className="text-sm text-stone-600">
                    Free 30-minute consultation
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-sage-600" />
                  <span className="text-sm text-stone-600">No obligation</span>
                </div>
              </div>
            </div>
            <div className="relative ">
              <Image
                src="rangika1.jpeg"
                alt="Peaceful consultation room"
                width={500}
                height={500}
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg border border-stone-200">
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
                    <p className="text-sm text-stone-600">50+ Happy Clients</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
              Multiple Ways to Connect
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Choose the method that feels most comfortable for you. I'm here to
              answer your questions and help you get started.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Phone,
                title: "Phone Call",
                description: "Speak directly for immediate answers",
                contact: "+61 429 940 130",
                action: "Call Now",
                available: "Mon-Sat: 8AM-6.30PM",
                link: "tel:+61429940130",
              },
              {
                icon: Mail,
                title: "Email",
                description: "Send detailed questions anytime",
                contact: "healwithrangika@gmail.com",
                action: "Send Email",
                available: "Response within 24 hours",
                link: "mailto:healwithrangika@gmail.com",
              },
              {
                icon: MessageCircle,
                title: "Text Message",
                description: "Quick questions via SMS",
                contact: "+61 429 940 130",
                action: "Send SMS",
                available: "Response same day",
                link: "tel:+61429940130",
              },
              {
                icon: Calendar,
                title: "Online Booking",
                description: "Schedule your free consultation",
                contact: "Book instantly online",
                action: "Book Now",
                available: "Available 24/7",
                link: "/booking",
              },
            ].map((method, index) => (
              <Card
                key={index}
                className="border-stone-200 hover:shadow-lg transition-shadow text-center"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="mx-auto w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center">
                    <method.icon className="h-6 w-6 text-sage-600" />
                  </div>
                  <h3 className="font-semibold text-stone-800">
                    {method.title}
                  </h3>
                  <p className="text-stone-600 text-sm">{method.description}</p>
                  <div className="text-sage-600 font-medium text-sm">
                    {method.contact}
                  </div>
                  <div className="text-xs text-stone-500">
                    {method.available}
                  </div>
                  <Link href={method.link}>
                    <Button className="w-full bg-sage-600 hover:bg-sage-700 text-white">
                      {method.action}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Forms */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
                Send Me a Message
              </h2>
              <p className="text-stone-600">
                Choose the type of inquiry that best matches your needs.
              </p>
            </div>

            <Tabs defaultValue="consultation" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="consultation">
                  Free Consultation
                </TabsTrigger>
                <TabsTrigger value="question">General Question</TabsTrigger>
                {/* <TabsTrigger value="booking">Book Session</TabsTrigger> */}
              </TabsList>

              <TabsContent value="consultation" className="mt-8">
                <Card className="border-stone-200">
                  <CardContent className="p-8">
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

                      <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                              First Name *
                            </label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                              placeholder="Your first name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                              Last Name *
                            </label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                              placeholder="Your last name"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                            placeholder="your.email@example.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                            placeholder="+61 xxx xxx xxx"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            Preferred Contact Method
                          </label>
                          <select className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500">
                            <option>Phone Call</option>
                            <option>Email</option>
                            <option>Text Message</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            What would you like to work on?
                          </label>
                          <select className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500">
                            <option>Anxiety & Stress Relief</option>
                            <option>Confidence Building</option>
                            <option>Habit Change</option>
                            <option>Weight Management</option>
                            <option>Sleep Improvement</option>
                            <option>Pain Management</option>
                            <option>Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            Tell me more about your situation
                          </label>
                          <textarea
                            rows={4}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                            placeholder="Share what you'd like to achieve and any questions you have..."
                          />
                        </div>

                        <Button className="w-full bg-sage-600 hover:bg-sage-700 text-white">
                          Request Free Consultation
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="question" className="mt-8">
                <Card className="border-stone-200">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-semibold text-stone-800">
                          Ask a Question
                        </h3>
                        <p className="text-stone-600 text-sm">
                          Have questions about hypnotherapy? I'm here to help
                          with any concerns.
                        </p>
                      </div>

                      <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                              Name *
                            </label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                              placeholder="Your name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                              Email *
                            </label>
                            <input
                              type="email"
                              required
                              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                              placeholder="your.email@example.com"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            Subject
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                            placeholder="What's your question about?"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            Your Question *
                          </label>
                          <textarea
                            rows={6}
                            required
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                            placeholder="Please share your question or concern in detail..."
                          />
                        </div>

                        <Button className="w-full bg-sage-600 hover:bg-sage-700 text-white">
                          Send Question
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* <TabsContent value="booking" className="mt-8">
                <Card className="border-stone-200">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-semibold text-stone-800">
                          Book a Session
                        </h3>
                        <p className="text-stone-600 text-sm">
                          Ready to start? Book your first hypnotherapy session
                          directly.
                        </p>
                      </div>

                      <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                              First Name *
                            </label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                              placeholder="Your first name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                              Last Name *
                            </label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                              placeholder="Your last name"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            Service Needed *
                          </label>
                          <select
                            required
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                          >
                            <option value="">Select a service</option>
                            <option>Anxiety & Stress Relief ($120)</option>
                            <option>Confidence Building ($120)</option>
                            <option>Habit Change ($120)</option>
                            <option>Weight Management ($120)</option>
                            <option>Sleep Improvement ($120)</option>
                            <option>Pain Management ($120)</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                              Preferred Date
                            </label>
                            <input
                              type="date"
                              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                              Preferred Time
                            </label>
                            <select className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500">
                              <option>Morning (9AM-12PM)</option>
                              <option>Afternoon (12PM-5PM)</option>
                              <option>Evening (5PM-7PM)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            Session Type
                          </label>
                          <select className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500">
                            <option>In-Person (Perth)</option>
                            <option>Online Session</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            Additional Information
                          </label>
                          <textarea
                            rows={3}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                            placeholder="Any specific concerns or goals you'd like to share..."
                          />
                        </div>

                        <Button className="w-full bg-sage-600 hover:bg-sage-700 text-white">
                          Book Session
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent> */}
            </Tabs>
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
                  Visit Our Practice
                </h2>
                <p className="text-stone-600 leading-relaxed">
                  Located in the heart of Perth, our practice offers a peaceful,
                  private environment designed for your comfort and relaxation.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-sage-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-sage-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-800">Address</div>
                    <div className="text-stone-600">
                      Perth Healthcare Centre
                      <br />
                      Ground floor
                      <br />
                      Shop 2/1260
                      <br />
                      Hay Street
                      <br />
                      West Perth WA 6005
                      <br />
                      Australia
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-sage-100 rounded-lg">
                    <Phone className="h-5 w-5 text-sage-600 mx-auto" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-800">Phone</div>
                    <div className="text-stone-600">+61 429 940 130</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-sage-100 rounded-lg">
                    <Mail className="h-5 w-5 text-sage-600 mx-auto" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-800">Email</div>
                    <div className="text-stone-600">
                      healwithrangika@gmail.com
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-sage-100 rounded-lg">
                    <Clock className="h-5 w-5 text-sage-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-800">
                      Practice Hours
                    </div>
                    <div className="text-stone-600 space-y-1">
                      <div>Monday - Saturday: 8:00 AM - 6:30 PM</div>
                      {/* <div>Saturday: 9:00 AM - 2:00 PM</div> */}
                      <div>Sunday: Closed</div>
                      <div className="text-sage-600 text-sm mt-2">
                        Evening appointments available by request
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-sage-100 rounded-lg">
                    <Users className="h-5 w-5 text-sage-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-800">
                      Online Sessions
                    </div>
                    <div className="text-stone-600">
                      Available Australia-wide via secure video call
                      <br />
                      Same quality care from the comfort of your home
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-stone-100 rounded-2xl p-8 h-64 flex items-center justify-center">
                <div className="text-center text-stone-500">
                  <MapPin className="h-12 w-12 mx-auto mb-4" />
                  <p>Interactive Map</p>
                  {/* <p className="text-sm">
                    Google Maps integration would go here
                  </p> */}
                </div>
              </div>

              {/* <Card className="border-stone-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-stone-800 mb-4">
                    Getting Here
                  </h3>
                  <div className="space-y-3 text-sm text-stone-600">
                    <div>
                      <strong>Public Transport:</strong> 2-minute walk from Town
                      Hall Station
                    </div>
                    <div>
                      <strong>Parking:</strong> Secure parking available in
                      building
                    </div>
                    <div>
                      <strong>Accessibility:</strong> Wheelchair accessible with
                      lift access
                    </div>
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
                Common Questions
              </h2>
              <p className="text-stone-600">
                Quick answers to help you feel confident about taking the next
                step.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  question: "How long is the free consultation?",
                  answer:
                    "The free consultation is 15 minutes via phone or video call. It's a no-pressure conversation to discuss your goals and see if we're a good fit.",
                },
                {
                  question: "Do you offer online sessions?",
                  answer:
                    "Yes! Online sessions are just as effective as in-person sessions. I work with clients across Australia via secure video calls.",
                },
                {
                  question: "What should I expect in my first session?",
                  answer:
                    "Your sessions begin with a relaxed conversation in a safe judgements free space. I'll briefly explain how hypnotherapy works, explore your specific needs and create a plan tailored to you.",
                },
                {
                  question: "How do I prepare for a session?",
                  answer:
                    "Just come as you are! Wear comfortable clothes, avoid caffeine beforehand, and come with an open mind. I'll guide you through everything.",
                },
                {
                  question: "What if I can't be hypnotized?",
                  answer:
                    "Almost everyone can experience hypnosis to some degree. It's simply a natural state of focused relaxation that we all experience daily.",
                },
                {
                  question: "Is everything confidential?",
                  answer:
                    "Absolutely. Everything we discuss is completely confidential and protected by professional privacy standards.",
                },
              ].map((faq, index) => (
                <Card key={index} className="border-stone-200">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-stone-800 mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-stone-600 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      {/* <section className="py-12 bg-amber-50 border-t border-amber-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h3 className="text-xl font-semibold text-amber-800">
              Need Immediate Support?
            </h3>
            <p className="text-amber-700">
              If you're experiencing a mental health emergency, please contact:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-amber-800">
                <strong>Lifeline:</strong> 13 11 14
              </div>
              <div className="text-amber-800">
                <strong>Emergency:</strong> 000
              </div>
              <div className="text-amber-800">
                <strong>Beyond Blue:</strong> 1300 22 4636
              </div>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
}
