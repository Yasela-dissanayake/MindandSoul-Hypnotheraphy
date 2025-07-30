import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Heart,
  Leaf,
  CheckCircle,
  Star,
  Clock,
  Users,
  Zap,
  Waves,
  GraduationCap,
  Building,
  MapPin,
  Globe,
  Package,
} from "lucide-react";
import Link from "next/link";
import { ServiceImageSlider } from "@/components/service-image-slider";
import Image from "next/image";

export default function ServicesPage() {
  // Service images for the slider
  const serviceImages = [
    {
      src: "https://images.unsplash.com/photo-1600618528240-fb9fc964b853?q=80&w=1200&auto=format&fit=crop",
      alt: "Clinical Hypnotherapy session in a peaceful setting",
    },
    {
      src: "therapy1.jpg",
      alt: "Reiki energy healing session with crystals",
    },
    {
      src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop",
      alt: "Meditation and mindfulness practice in a serene environment",
    },
    {
      src: "https://images.unsplash.com/photo-1604881991720-f91add269bed?q=80&w=1200&auto=format&fit=crop",
      alt: "Animal Reiki healing session with a calm dog",
    },
  ];

  const coreServices = [
    {
      id: "clinical-hypnotherapy",
      icon: Brain,
      image: "service_hypnotherapy.jpeg",
      title: "Clinical Hypnotherapy",
      shortDesc:
        "Empowering you through subconscious healing and transformation.",
      fullDesc:
        "Hypnotherapy is a safe, effective therapeutic technique that uses the power of the subconscious mind to support lasting change. Unlike myths from movies, it's a deeply relaxed and focused state where your mind becomes more open to positive suggestions and deeper insight.",
      duration: "60-90 minutes",
      pricing: {
        single: 140,
        package: { sessions: 3, price: 390 },
      },
      sessions: "Single or packages available",
      benefits: [
        "Anxiety, stress, and overwhelm relief",
        "Insomnia and sleep disturbances",
        "Phobias and fears resolution",
        "Confidence and self-worth building",
        "Emotional trauma and grief healing",
        "Habit change (smoking, nail biting)",
        "Emotional eating & weight management",
        "Narcissistic abuse recovery",
        "Childhood trauma and age regression",
        "Anger management and relationship issues",
      ],
      specialPrograms: [
        {
          id: "age-regression",
          name: "Age Regression Therapy",
          price: 190,
          note: "per session",
          description:
            "Explore and heal childhood experiences that may be affecting your present life",
        },
        {
          id: "weight-loss",
          name: "Time to Lose Weight",
          price: 1450,
          note: "12-week program",
          description:
            "Comprehensive program to develop a healthy relationship with food and sustainable weight management",
        },
        {
          id: "sleep-program",
          name: "Time to Sleep",
          price: 1350,
          note: "12-week program",
          description:
            "Overcome insomnia and develop healthy sleep patterns for restorative rest",
        },
        {
          id: "ibs-program",
          name: "Freedom from IBS",
          price: 1350,
          note: "12-week program",
          description:
            "Address the mind-body connection to manage IBS symptoms and improve digestive health",
        },
        {
          id: "past-life",
          name: "Past Life Regression Therapy",
          price: 235,
          note: "per session",
          description:
            "Explore past life memories to understand current patterns and relationships",
        },
      ],
      bookable: true,
    },
    {
      id: "reiki-healing",
      icon: Heart,
      image: "reiki1.jpeg",
      title: "Reiki Healing",
      shortDesc:
        "Restore balance, renew energy, reconnect with your inner peace.",
      fullDesc:
        "Reiki is a gentle, non-invasive energy healing technique that promotes relaxation, reduces stress, and supports your body's natural ability to heal itself. By channeling universal life force energy, Reiki helps clear blockages and rebalance your physical, emotional, and spiritual well-being.",
      duration: "60 minutes",
      pricing: {
        inPerson: {
          single: 120,
          packages: [{ sessions: 3, price: 320 }],
        },
        distance: {
          single: 90,
          packages: [
            { sessions: 3, price: 250 },
            { sessions: 5, price: 420 },
          ],
        },
      },
      sessions: "Single or packages available",
      benefits: [
        "Release tension, stress and anxiety",
        "Enhance mental clarity and emotional calm",
        "Support physical healing and pain relief",
        "Boost your immune system",
        "Promote restful sleep and deep relaxation",
        "Balance your chakras and energy flow",
        "Deepen intuition and spiritual connection",
        "Guide you to your spiritual path",
      ],
      bookable: true,
    },
    {
      id: "animal-reiki",
      icon: Leaf,
      image: "animal reiki 2.jpeg",
      title: "Animal Reiki & Communication",
      shortDesc:
        "Healing, understanding, and connection for your beloved companions.",
      fullDesc:
        "Animals have emotions, energy, and unique stories. Through Animal Reiki and Communication, we create a safe, nurturing space for your beloved companion to heal, express, and be truly heard. Perfect for pets recovering from illness, coping with anxiety, or nearing end-of-life.",
      duration: "45-60 minutes",
      pricing: {
        inPerson: {
          single: 160,
          packages: [
            { sessions: 3, price: 450 },
            { sessions: 5, price: 750 },
          ],
        },
        distance: {
          single: 110,
          packages: [
            { sessions: 3, price: 300 },
            { sessions: 5, price: 500 },
          ],
        },
        petParentPackage: {
          inPerson: {
            single: 250,
            packages: [
              { sessions: 3, price: 700 },
              { sessions: 5, price: 1000 },
            ],
          },
          distance: {
            single: 200,
            packages: [
              { sessions: 3, price: 550 },
              { sessions: 5, price: 950 },
            ],
          },
        },
      },
      sessions: "Single or packages available",
      benefits: [
        "Eases pain, anxiety, and restlessness in pets",
        "Understand your pet's needs and behaviors",
        "Support rescue animals settling into new homes",
        "Navigate grief, loss, or end-of-life decisions",
        "Strengthen bond through mutual understanding",
        "Prepare pets for changes (moving, new animals)",
        "Promote emotional balance and healing",
      ],
      specialNote:
        "Pet & Parent Package includes healing for both you and your pet",
      bookable: true,
    },
    {
      id: "lama-fera",
      icon: Zap,
      image: "lama1.jpeg",
      title: "Lama Fera Healing",
      shortDesc:
        "Ancient Tibetan healing for deep spiritual & energetic transformation.",
      fullDesc:
        "Lama Fera is a powerful energy healing system from Himalayan Buddhist monasteries. Used by monks for centuries, it channels high-vibrational healing energy from Lord Buddha to release negative energies, clear karmic blocks, and accelerate spiritual growth.",
      duration: "30-45 minutes",
      pricing: {
        inPerson: { single: 150 },
        distance: { single: 120 },
      },
      sessions: "Single sessions",
      benefits: [
        "Remove negative energy and psychic disturbances",
        "Clear past life karmic imprints",
        "Boost spiritual growth and inner peace",
        "Promote emotional release and mental calmness",
        "Enhance physical healing and energy balance",
        "Protect aura from harmful influences",
        "Clear spaces like homes and offices",
      ],
      bookable: true,
    },
    {
      id: "meditation",
      icon: Waves,
      image: "meditation group 2.jpeg",
      title: "Meditation Programs",
      shortDesc: "Quiet the mind, open the heart, return to stillness.",
      fullDesc:
        "Our meditation offerings include guided sessions, transformational programs, and community circles designed to support both beginners and experienced meditators in developing sustainable, nourishing practices.",
      duration: "30-60 minutes",
      pricing: {
        eightWeekProgram: { price: 325, note: "8-week program" },
        recordedSessions: { price: 75, note: "per week" },
        groupMeditation: { note: "Inquire for details" },
      },
      sessions: "Various program options",
      benefits: [
        "Reduce stress, anxiety, and overwhelm",
        "Improve focus, clarity, and mental resilience",
        "Support better sleep and nervous system regulation",
        "Increase emotional awareness and self-compassion",
        "Deepen spiritual connection and inner wisdom",
        "Create greater peace and presence in daily life",
        "Open paths to spiritual journeys",
      ],
      bookable: false,
    },
  ];

  const specializedServices = [
    {
      id: "corporate-wellness",
      icon: Building,
      title: "Corporate Wellness",
      description: `Empowering teams with mindful tools for a healthier, happier workplace`,
      offerings: [
        "Guided Meditation",
        "Group Hypnosis",
        "Art Therapy",
        "Baking for Stress Relief",
      ],
      note: "Customizable programs for on-site or virtual delivery",
      bookable: false,
    },
    {
      id: "reiki-training",
      icon: GraduationCap,
      title: "Reiki Training",
      description:
        "Learn Reiki with confidence and care - Levels 1, 2 & 3 (Master)",
      offerings: [
        "Level 1: Self-Healing",
        "Level 2: Practitioner",
        "Level 3: Master/Teacher",
      ],
      note: "Certified training with ongoing mentorship and support",
      bookable: false,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-stone-100 to-sage-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <Badge className="bg-sage-100 text-sage-700">
              Heal With Rangika
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-serif text-stone-800 leading-tight">
              Holistic Healing
              <span className="text-sage-600"> for Mind, Body & Soul</span>
            </h1>
            <p className="text-lg text-stone-600 leading-relaxed">
              Where healing meets wholeness. Our integrative approach combines
              modern therapeutic techniques with ancient healing practices to
              support your journey toward balance, self-discovery, and
              transformation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking">
                <Button
                  size="lg"
                  className="bg-sage-600 hover:bg-sage-700 text-white"
                >
                  Book Free Consultation
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-stone-300 text-stone-700 hover:bg-stone-50 bg-transparent"
                >
                  Ask Questions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Service Image Slider */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <ServiceImageSlider images={serviceImages} interval={6000} />
          </div>
        </div>
      </section>

      {/* Core Services Overview */}
      {/* <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
              Core Healing Services
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Each service is tailored to your unique needs, helping you achieve
              your goals through the transformative power of holistic healing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreServices.map((service, index) => (
              <Card
                key={index}
                className="border-stone-200 hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sage-100 rounded-lg">
                      <service.icon className="h-6 w-6 text-sage-600" />
                    </div>
                    <h3 className="font-semibold text-stone-800">
                      {service.title}
                    </h3>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {service.shortDesc}
                  </p>

                  
                  <div className="space-y-2 text-xs text-stone-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{service.duration}</span>
                    </div>

                    {service.pricing.single && (
                      <div className="font-semibold text-sage-600">
                        ${service.pricing.single} per session
                      </div>
                    )}

                    {service.pricing.inPerson && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="font-semibold text-sage-600">
                            In-Person: ${service.pricing.inPerson.single}
                          </span>
                        </div>
                        {service.pricing.distance && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            <span className="font-semibold text-sage-600">
                              Distance: ${service.pricing.distance.single}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {service.pricing.eightWeekProgram && (
                      <div className="font-semibold text-sage-600">
                        8-Week Program: $
                        {service.pricing.eightWeekProgram.price}
                      </div>
                    )}
                  </div>

                  {service.bookable ? (
                    <Link href={`/booking?service=${service.id}`}>
                      <Button className="w-full bg-sage-600 hover:bg-sage-700 text-white">
                        Book Now
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/contact">
                      <Button className="w-full bg-stone-600 hover:bg-stone-700 text-white">
                        Inquire
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* Detailed Services */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
              Detailed Service Information
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Learn more about each healing modality and how it can support your
              wellness journey.
            </p>
          </div>

          <Tabs
            defaultValue="clinical-hypnotherapy"
            className="max-w-6xl mx-auto"
          >
            <TabsList className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
              {coreServices.map((service) => (
                <TabsTrigger
                  key={service.id}
                  value={service.id}
                  className="text-xs"
                >
                  {service.title.split(" ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {coreServices.map((service) => (
              <TabsContent key={service.id} value={service.id}>
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-sage-100 rounded-lg">
                        <service.icon className="h-8 w-8 text-sage-600" />
                      </div>
                      <h3 className="text-2xl font-serif text-stone-800">
                        {service.title}
                      </h3>
                    </div>
                    <p className="text-stone-600 leading-relaxed">
                      {service.fullDesc}
                    </p>

                    {/* Detailed Pricing with Individual Booking Buttons */}
                    <div className="space-y-4 p-4 bg-sage-50 rounded-lg">
                      <h4 className="font-semibold text-stone-800">
                        Pricing & Booking Options
                      </h4>

                      {service.pricing.single && (
                        <div className="space-y-3">
                          <div className="border border-sage-200 rounded-lg p-3 bg-white">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-stone-700 font-medium">
                                Single Session
                              </span>
                              <span className="font-semibold text-sage-600">
                                ${service.pricing.single}
                              </span>
                            </div>
                            <Link
                              href={`/booking?service=${service.id}&package=single`}
                            >
                              <Button
                                size="sm"
                                className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                              >
                                Book Single Session
                              </Button>
                            </Link>
                          </div>
                          {service.pricing.package && (
                            <div className="border border-sage-200 rounded-lg p-3 bg-white">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-stone-700 font-medium">
                                  {service.pricing.package.sessions} Sessions
                                  Package
                                </span>
                                <span className="font-semibold text-sage-600">
                                  ${service.pricing.package.price}
                                </span>
                              </div>
                              <div className="text-xs text-stone-500 mb-2">
                                Save $
                                {service.pricing.single *
                                  service.pricing.package.sessions -
                                  service.pricing.package.price}
                              </div>
                              <Link
                                href={`/booking?service=${service.id}&package=${service.pricing.package.sessions}-sessions`}
                              >
                                <Button
                                  size="sm"
                                  className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                                >
                                  Book {service.pricing.package.sessions}{" "}
                                  Sessions
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      )}

                      {service.pricing.inPerson && (
                        <div className="space-y-3">
                          <div className="border-b border-sage-200 pb-2">
                            <h5 className="font-medium text-stone-800 flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              In-Person Sessions
                            </h5>
                          </div>
                          <div className="space-y-2">
                            <div className="border border-sage-200 rounded-lg p-3 bg-white">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-stone-700">
                                  Single Session
                                </span>
                                <span className="font-semibold text-sage-600">
                                  ${service.pricing.inPerson.single}
                                </span>
                              </div>
                              <Link
                                href={`/booking?service=${service.id}&type=in-person&package=single`}
                              >
                                <Button
                                  size="sm"
                                  className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                                >
                                  Book In-Person Single
                                </Button>
                              </Link>
                            </div>
                            {service.pricing.inPerson.packages?.map(
                              (pkg, idx) => (
                                <div
                                  key={idx}
                                  className="border border-sage-200 rounded-lg p-3 bg-white"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-stone-700">
                                      {pkg.sessions} Sessions Package
                                    </span>
                                    <span className="font-semibold text-sage-600">
                                      ${pkg.price}
                                    </span>
                                  </div>
                                  <div className="text-xs text-stone-500 mb-2">
                                    Save $
                                    {service.pricing.inPerson.single *
                                      pkg.sessions -
                                      pkg.price}
                                  </div>
                                  <Link
                                    href={`/booking?service=${service.id}&type=in-person&package=${pkg.sessions}-sessions`}
                                  >
                                    <Button
                                      size="sm"
                                      className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                                    >
                                      Book In-Person {pkg.sessions} Sessions
                                    </Button>
                                  </Link>
                                </div>
                              )
                            )}
                          </div>

                          {service.pricing.distance && (
                            <>
                              <div className="border-b border-sage-200 pb-2 pt-4">
                                <h5 className="font-medium text-stone-800 flex items-center gap-2">
                                  <Globe className="h-4 w-4" />
                                  Distance Healing
                                </h5>
                              </div>
                              <div className="space-y-2">
                                <div className="border border-sage-200 rounded-lg p-3 bg-white">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-stone-700">
                                      Single Session
                                    </span>
                                    <span className="font-semibold text-sage-600">
                                      ${service.pricing.distance.single}
                                    </span>
                                  </div>
                                  <Link
                                    href={`/booking?service=${service.id}&type=distance&package=single`}
                                  >
                                    <Button
                                      size="sm"
                                      className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                                    >
                                      Book Distance Single
                                    </Button>
                                  </Link>
                                </div>
                                {service.pricing.distance.packages?.map(
                                  (pkg, idx) => (
                                    <div
                                      key={idx}
                                      className="border border-sage-200 rounded-lg p-3 bg-white"
                                    >
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-stone-700">
                                          {pkg.sessions} Sessions Package
                                        </span>
                                        <span className="font-semibold text-sage-600">
                                          ${pkg.price}
                                        </span>
                                      </div>
                                      <div className="text-xs text-stone-500 mb-2">
                                        Save $
                                        {service.pricing.distance.single *
                                          pkg.sessions -
                                          pkg.price}
                                      </div>
                                      <Link
                                        href={`/booking?service=${service.id}&type=distance&package=${pkg.sessions}-sessions`}
                                      >
                                        <Button
                                          size="sm"
                                          className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                                        >
                                          Book Distance {pkg.sessions} Sessions
                                        </Button>
                                      </Link>
                                    </div>
                                  )
                                )}
                              </div>
                            </>
                          )}

                          {service.pricing.petParentPackage && (
                            <>
                              <div className="border-b border-sage-200 pb-2 pt-4">
                                <h5 className="font-medium text-stone-800 flex items-center gap-2">
                                  <Package className="h-4 w-4" />
                                  Pet & Parent Package
                                </h5>
                              </div>
                              <div className="space-y-3">
                                <div className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
                                  Healing sessions for both you and your pet
                                </div>

                                <div className="space-y-2">
                                  <div className="text-sm text-stone-600 font-medium">
                                    In-Person Package:
                                  </div>
                                  <div className="border border-sage-200 rounded-lg p-3 bg-white">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-stone-700">
                                        Single Session
                                      </span>
                                      <span className="font-semibold text-sage-600">
                                        $
                                        {
                                          service.pricing.petParentPackage
                                            .inPerson.single
                                        }
                                      </span>
                                    </div>
                                    <Link
                                      href={`/booking?service=${service.id}&type=pet-parent-in-person&package=single`}
                                    >
                                      <Button
                                        size="sm"
                                        className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                                      >
                                        Book Pet & Parent In-Person
                                      </Button>
                                    </Link>
                                  </div>
                                  {service.pricing.petParentPackage.inPerson.packages?.map(
                                    (pkg, idx) => (
                                      <div
                                        key={idx}
                                        className="border border-sage-200 rounded-lg p-3 bg-white"
                                      >
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="text-stone-700">
                                            {pkg.sessions} Sessions Package
                                          </span>
                                          <span className="font-semibold text-sage-600">
                                            ${pkg.price}
                                          </span>
                                        </div>
                                        <Link
                                          href={`/booking?service=${service.id}&type=pet-parent-in-person&package=${pkg.sessions}-sessions`}
                                        >
                                          <Button
                                            size="sm"
                                            className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                                          >
                                            Book Pet & Parent {pkg.sessions}{" "}
                                            Sessions
                                          </Button>
                                        </Link>
                                      </div>
                                    )
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <div className="text-sm text-stone-600 font-medium">
                                    Distance Package:
                                  </div>
                                  <div className="border border-sage-200 rounded-lg p-3 bg-white">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-stone-700">
                                        Single Session
                                      </span>
                                      <span className="font-semibold text-sage-600">
                                        $
                                        {
                                          service.pricing.petParentPackage
                                            .distance.single
                                        }
                                      </span>
                                    </div>
                                    <Link
                                      href={`/booking?service=${service.id}&type=pet-parent-distance&package=single`}
                                    >
                                      <Button
                                        size="sm"
                                        className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                                      >
                                        Book Pet & Parent Distance
                                      </Button>
                                    </Link>
                                  </div>
                                  {service.pricing.petParentPackage.distance.packages?.map(
                                    (pkg, idx) => (
                                      <div
                                        key={idx}
                                        className="border border-sage-200 rounded-lg p-3 bg-white"
                                      >
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="text-stone-700">
                                            {pkg.sessions} Sessions Package
                                          </span>
                                          <span className="font-semibold text-sage-600">
                                            ${pkg.price}
                                          </span>
                                        </div>
                                        <Link
                                          href={`/booking?service=${service.id}&type=pet-parent-distance&package=${pkg.sessions}-sessions`}
                                        >
                                          <Button
                                            size="sm"
                                            className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                                          >
                                            Book Pet & Parent Distance{" "}
                                            {pkg.sessions}
                                          </Button>
                                        </Link>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {service.pricing.eightWeekProgram && (
                        <div className="space-y-2">
                          <div className="border border-sage-200 rounded-lg p-3 bg-white">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-stone-700">
                                8-Week Program
                              </span>
                              <span className="font-semibold text-sage-600">
                                ${service.pricing.eightWeekProgram.price}
                              </span>
                            </div>

                            <Link href="/contact">
                              <Button className="w-full bg-stone-600 hover:bg-stone-700 text-white">
                                Inquire About This Service
                              </Button>
                            </Link>
                          </div>
                          {service.pricing.recordedSessions && (
                            <div className="border border-sage-200 rounded-lg p-3 bg-white">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-stone-700">
                                  Recorded Sessions
                                </span>
                                <span className="font-semibold text-sage-600">
                                  ${service.pricing.recordedSessions.price} per
                                  week
                                </span>
                              </div>

                              <Link href="/contact">
                                <Button className="w-full bg-stone-600 hover:bg-stone-700 text-white">
                                  Inquire About This Service
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      )}

                      {service.specialPrograms && (
                        <div className="border-t border-sage-200 pt-4">
                          <h5 className="font-medium text-stone-800 mb-3">
                            Special Programs
                          </h5>
                          <div className="space-y-3">
                            {service.specialPrograms.map((program, idx) => (
                              <div
                                key={idx}
                                className="border border-sage-200 rounded-lg p-3 bg-white"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <h6 className="font-medium text-stone-800">
                                      {program.name}
                                    </h6>
                                    <p className="text-xs text-stone-600 mt-1">
                                      {program.description}
                                    </p>
                                  </div>
                                  <span className="font-semibold text-sage-600 text-sm whitespace-nowrap ml-2">
                                    ${program.price} {program.note}
                                  </span>
                                </div>
                                <Link
                                  href={`/booking?service=${service.id}&program=${program.id}`}
                                >
                                  <Button
                                    size="sm"
                                    className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                                  >
                                    Book {program.name}
                                  </Button>
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {service.specialNote && (
                        <div className="bg-amber-50 border border-amber-200 rounded p-3">
                          <div className="text-sm text-amber-700">
                            {service.specialNote}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Image
                        src={service.image}
                        alt={service.image}
                        width={350}
                        height={250}
                        className="rounded-md border-4 border-[#CDDBC2]"
                      />{" "}
                    </div>
                    <h4 className="text-xl font-semibold text-stone-800">
                      What You Can Expect
                    </h4>
                    <ul className="space-y-3">
                      {service.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-sage-600 mt-0.5 flex-shrink-0" />
                          <span className="text-stone-600">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href={`/services/detailed#${service.id}`}>
                      <Button
                        variant="outline"
                        className="w-full my-6 border-sage-300 text-sage-700 hover:bg-sage-50 bg-transparent"
                      >
                        Learn More
                      </Button>
                    </Link>

                    {service.bookable ? (
                      <Link href={`/booking?service=${service.id}`}>
                        <Button className="w-full bg-sage-600 hover:bg-sage-700 text-white">
                          Book This Service
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/contact">
                        <Button className="w-full bg-stone-600 hover:bg-stone-700 text-white">
                          Inquire About This Service
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Specialized Services */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
              Specialized Programs
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Comprehensive programs designed for organizations, schools, and
              those seeking to become healers themselves.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {specializedServices.map((service, index) => (
              <Card
                key={index}
                className="border-stone-200 hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-sage-100 rounded-lg">
                      <service.icon className="h-8 w-8 text-sage-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-stone-800">
                      {service.title}
                    </h3>
                  </div>
                  <p className="text-stone-600">{service.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-medium text-stone-800">Includes:</h4>
                    <ul className="space-y-1">
                      {service.offerings.map((offering, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-stone-600 flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4 text-sage-600" />
                          {offering}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-sage-50 p-3 rounded-lg">
                    <p className="text-sm text-sage-700">{service.note}</p>
                  </div>

                  <Link href={`/services/detailed#${service.id}`}>
                    <Button
                      variant="outline"
                      className="w-full my-6 border-sage-300 text-sage-700 hover:bg-sage-50 bg-transparent"
                    >
                      Learn More
                    </Button>
                  </Link>

                  <Link href="/contact">
                    <Button className="w-full bg-stone-600 hover:bg-stone-700 text-white">
                      Send Inquiry
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
              Your Healing Journey
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Every healing journey is unique. Our integrative approach meets
              you where you are and walks beside you at every step.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Free Consultation",
                description:
                  "We discuss your goals and determine which healing modalities are right for you.",
                icon: Users,
              },
              {
                step: "02",
                title: "Personalized Plan",
                description:
                  "I create a tailored healing plan combining the most suitable therapies for your needs.",
                icon: Brain,
              },
              {
                step: "03",
                title: "Healing Sessions",
                description:
                  "Gentle, supportive sessions in a safe environment, whether in-person or online.",
                icon: Heart,
              },
              {
                step: "04",
                title: "Integration & Growth",
                description:
                  "Ongoing support and integration practices to maintain your transformation.",
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
                <h3 className="text-xl font-semibold text-stone-800">
                  {step.title}
                </h3>
                <p className="text-stone-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  question: "What makes your approach different?",
                  answer:
                    "We integrate multiple healing modalities - from clinical hypnotherapy to ancient energy healing practices - creating a personalized approach that addresses mind, body, and soul.",
                },
                {
                  question: "Do you offer online sessions?",
                  answer:
                    "Yes! Most of our services are available online with the same effectiveness as in-person sessions. We serve clients across Australia and internationally.",
                },
                {
                  question: "How do I know which service is right for me?",
                  answer:
                    "We offer a free 30-minute consultation to discuss your goals and recommend the most suitable healing modalities for your unique situation.",
                },
                {
                  question: "Are your practitioners qualified?",
                  answer:
                    "All our practitioners are certified to practice mentioned modalities, trauma-informed, and committed to ongoing professional development and ethical practice.",
                },
                {
                  question: "Can I combine different healing modalities?",
                  answer:
                    "We often recommend combining therapies for a more comprehensive healing experience. For example, hypnotherapy with Reiki, or meditation with energy healing.",
                },
                {
                  question: "What should I expect in my first session?",
                  answer:
                    "Your first session begins with a warm conversation about your goals and concerns. We'll explain the process and ensure you feel comfortable before beginning any therapeutic work.",
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

      {/* CTA Section */}
      <section className="py-20 bg-sage-600 text-white">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl lg:text-4xl font-serif">
            Ready to Begin Your Healing Journey?
          </h2>
          <p className="text-sage-100 max-w-2xl mx-auto">
            True wellness is more than the absence of illness—it's a deep
            alignment of mind, body, and soul. Take the first step toward
            wholeness today.
          </p>
          <Link href="/booking">
            <Button
              size="lg"
              className="bg-white text-sage-600 hover:bg-stone-50"
            >
              Book Your Free Consultation Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
