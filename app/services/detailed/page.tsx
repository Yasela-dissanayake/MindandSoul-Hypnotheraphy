"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  Target,
  Award,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";

export default function DetailedServicesPage() {
  const services = [
    {
      id: "clinical-hypnotherapy",
      icon: Brain,
      title: "Clinical Hypnotherapy",
      subtitle: "Empowering You Through Subconscious Healing",
      description:
        "Hypnotherapy is a safe, effective therapeutic technique that uses the power of the subconscious mind to support lasting change. Unlike the myths you may have seen in movies, hypnotherapy isn't about mind control or being 'put to sleep.' Instead, it's a deeply relaxed and focused state—similar to daydreaming—where your mind becomes more open to positive suggestions and deeper insight.",
      image: "/hypno1.jpeg",
      duration: "45-75 minutes",
      consultation: "30min Free online consultation prior booking",
      conditions: [
        "Anxiety, stress, and overwhelm",
        "Insomnia and sleep disturbances",
        "Phobias and fears",
        "Low confidence and self-worth",
        "Emotional trauma and unresolved grief",
        "Habits like smoking, nail biting and bed wetting",
        "Emotional eating & weight loss",
        "Irritable Bowel Syndrome",
        "Narcissistic abuse recovery",
        "Excessive control issues",
        "Teen behavioural issues",
        "Anger Management",
        "Childhood trauma and age regression",
        "Memory and concentration",
        "Relationship issues",
      ],
      pricing: {
        regular: {
          single: 140,
          package: { sessions: 3, price: 390 },
        },
        ageRegression: {
          price: 190,
          note: "per session (in-person)",
        },
      },
      process: [
        {
          step: "A Warm, Supportive Conversation",
          description:
            "Every session begins with a relaxed conversation to discuss your goals, challenges, and any concerns. As your hypnotherapist, I'll guide you through the process and customise the session to suit your individual needs.",
        },
        {
          step: "Guided Relaxation",
          description:
            "You'll be gently guided into a calm, focused, and deeply relaxed state—similar to meditation or daydreaming. You remain in control the entire time, fully aware and able to respond if needed.",
        },
        {
          step: "Subconscious Exploration & Suggestion Work",
          description:
            "While in this relaxed state, your subconscious mind becomes more open to positive suggestion and healing. I may use visualisation, affirmations, or other therapeutic techniques to help shift limiting beliefs, release emotional blocks, or reframe past experiences.",
        },
        {
          step: "Return to Full Awareness",
          description:
            "After the therapeutic work is complete, you'll be gently guided back to full awareness. Most people feel calm, refreshed, and often surprised at how natural the experience feels. You remain in control throughout the process.",
        },
      ],
      specialPrograms: [
        {
          id: "weight-loss",
          name: "Time to Lose Weight",
          duration: "12 Week Program",
          price: 1450,
          description:
            "Transform Your Mind. Transform Your Body. Transform Your Life. Are you tired of quick fixes, fad diets, and willpower battles that never seem to last? Real, sustainable weight loss starts from within—by shifting the subconscious patterns that drive your habits, cravings, and relationship with food.",
          includes: [
            "FREE online consultation",
            "6 hypnotherapy sessions",
            "Hypnotic Gastric band surgery",
            "Tool bag (arm band, fridge magnets, Journal, handouts, magic blue plate!)",
            "Guided subconscious reprogramming for healthy habits",
            "Tools for emotional regulation and stress reduction",
            "Visualization techniques for motivation and self-image",
            "Supportive strategies for long-term behavior change",
            "Optional journaling, mindfulness, and meal intention guidance",
            "Support throughout the program",
          ],
          benefits: [
            "Break free from self-sabotage",
            "Let go of guilt and shame around eating",
            "Build self-love and body confidence",
            "Reconnect with your inner wisdom and intuitive choices",
          ],
        },
        {
          id: "sleep-program",
          name: "Time to Sleep",
          duration: "12 Week Program",
          price: 1350,
          description:
            "A 12-Week Hypnotherapy Program to Help You Finally Rest. Are you exhausted from tossing and turning night after night? Struggling to quiet your mind at bedtime? Waking up feeling just as tired as when you went to sleep?",
          includes: [
            "FREE online consultation session",
            "6 Hypnotherapy sessions",
            "Sleep-focused guided hypnosis recordings",
            "Personalized techniques to improve sleep hygiene",
            "Tools to manage racing thoughts and nighttime anxiety",
            "Breathwork, relaxation, and visualization practices",
            "Progress tracking and gentle support between sessions",
            "Support throughout the program",
          ],
          benefits: [
            "Quiet the mental chatter that keeps you awake",
            "Reprogram limiting beliefs about sleep",
            "Release nighttime anxiety and stress",
            "Establish a calming, consistent sleep routine",
            "Build long-term, natural sleep habits that stick",
          ],
        },
        {
          id: "ibs-program",
          name: "Freedom from IBS",
          duration: "12 Week Program",
          price: 1350,
          description:
            "A 12-Week Hypnotherapy Program to Soothe Your Gut and Calm Your Mind. Living with Irritable Bowel Syndrome (IBS) can feel like an invisible battle—pain, discomfort, and anxiety that disrupt your daily life, often with no clear cause or lasting relief.",
          includes: [
            "FREE Online consultation",
            "6 Hypnotherapy sessions",
            "IBS-specific guided hypnosis recordings for home use",
            "Personalized emotional release techniques",
            "Stress reduction tools and nervous system support",
            "Gut-focused breathwork and mindfulness practices",
          ],
          benefits: [
            "Reduce bloating and abdominal pain",
            "Regulate irregular bowel movements",
            "Decrease anxiety and stress around food or symptoms",
            "Restore control over your body",
            "Improve overall digestive health",
          ],
        },
      ],
    },
    {
      id: "past-life-regression",
      icon: Star,
      title: "Past Life Regression Therapy",
      subtitle:
        "Explore Your Soul's Journey. Heal Through the Wisdom of the Past",
      description:
        "Past Life Regression (PLR) is a gentle yet powerful therapeutic technique that allows you to access memories, emotions, and experiences from previous lifetimes that may still be influencing your current life. Through guided hypnosis, you'll journey beyond the limits of your conscious mind—unlocking deep inner knowledge, unresolved patterns, karmic connections, and the root cause of emotional, physical, or spiritual challenges.",
      image: "/past-regression.jpeg",
      duration: "90-120 minutes",
      consultation: "Pre session Discussion (Online, 30minutes)",
      pricing: {
        single: 235,
        note: "per session",
        includes:
          "Pre session Discussion (Online, 30minutes), Guided regression, integration, and post-session discussion",
      },
      reasons: [
        {
          title: "Break Repeating Patterns",
          description:
            "Do you notice certain emotional or relationship patterns that keep showing up in your life? These may have roots in past life experiences that are influencing your current path.",
        },
        {
          title: "Understand Unexplained Fears or Ailments",
          description:
            "Irrational fears, phobias, or chronic issues with no medical explanation can sometimes be traced back to past life trauma or unresolved energy.",
        },
        {
          title: "Heal Emotional Wounds",
          description:
            "Past life regression can bring insight and closure to emotional pain, grief, abandonment, or betrayal that may still linger in your energetic field.",
        },
        {
          title: "Reconnect with Soul Purpose",
          description:
            "Exploring your soul's journey over lifetimes can offer a deeper sense of who you are, what you're here to learn, and how to live more intentionally.",
        },
        {
          title: "Spiritual Growth & Soul Integration",
          description:
            "For many, past life regression is part of a larger spiritual awakening—helping integrate forgotten wisdom and deepen connection to the self.",
        },
      ],
      benefits: [
        "Understand the root cause of phobias, emotional blocks, or chronic patterns",
        "Gain insight into relationships, especially those with a sense of familiarity or intensity",
        "Release unexplained fears, guilt, or trauma carried over from other lifetimes",
        "Discover soul lessons and spiritual growth opportunities",
        "Reconnect with past talents, wisdom, or experiences that support you today",
        "Find peace, clarity, and healing through soul remembrance",
      ],
      processDescription:
        "During a PLR session, you are guided into a relaxed hypnotic state where your subconscious mind safely accesses meaningful past life experiences. You remain conscious and in control, gently narrating what you see, feel, or sense as I help you explore with care and clarity. Each session is unique and deeply personal, and you do not need to believe in past lives for the process to be therapeutic. Your subconscious mind will show you what is most relevant for your healing now.",
    },
    {
      id: "reiki-healing",
      icon: Heart,
      title: "Reiki Healing",
      subtitle:
        "Restore Balance. Renew Energy. Reconnect with Your Inner Peace",
      description:
        "Reiki is a gentle, non-invasive energy healing technique that promotes relaxation, reduces stress, and supports your body's natural ability to heal itself. By channeling universal life force energy, Reiki helps clear blockages and rebalance your physical, emotional, and spiritual well-being.",
      image: "/reiki2.jpeg",
      duration: "60 minutes",
      benefits: [
        "Release tension, stress and anxiety",
        "Enhance mental clarity and emotional calm",
        "Support physical healing and pain relief",
        "Boost your immune system",
        "Promote restful sleep and deep relaxation",
        "Balance your chakras and energy flow",
        "Offers better understanding on your self",
        "Deepens intuition",
        "Guides you to your spiritual path if you are been called",
      ],
      pricing: {
        inPerson: {
          single: 120,
          packages: [
            { sessions: 3, price: 320 },
            { sessions: 5, price: 545 },
          ],
        },
        distance: {
          single: 90,
          packages: [
            { sessions: 3, price: 250 },
            { sessions: 5, price: 420 },
          ],
        },
      },
      experience:
        "Each Reiki session is unique and tailored to your needs. It's a peaceful experience designed to help you unwind and reconnect with your inner self. As an intuitive healer, I'm spiritually guided to offer you the most aligned and transformative healing experience. Many clients notice a calming shift during and after treatment, with benefits that often continue to unfold in the days following the session.",
      whyChoose:
        "Reiki complements other healing practices and can be a valuable part of your wellness journey. Whether you're dealing with chronic stress, recovering from illness, or simply seeking relaxation or mental clarity, Reiki offers a nurturing and holistic path to well-being.",
    },
    {
      id: "animal-reiki",
      icon: Leaf,
      title: "Animal Reiki & Communication",
      subtitle: "Healing. Understanding. Connection",
      description:
        "Animals, like humans, have emotions, energy, and unique stories. Through Animal Reiki and Animal Communication, we create a safe, nurturing space for your beloved companion to heal, express, and be truly heard.",
      image: "/animal3.jpeg",
      duration: "45-60 minutes",
      consultation: "30 minute free online consultation prior booking",
      animalReiki:
        "Animal Reiki is a gentle, energy-based healing technique that helps animals release stress, ease pain, and rebalance their energy. It's ideal for pets who are recovering from injury or illness, coping with anxiety or trauma, or nearing end-of-life. Its a game changer for any healthy pet to feel more secure, connected and happy. Sessions are calming, respectful, and always led by the animal's comfort. Reiki can be shared in-person or remotely, and no physical contact is required. Animals are naturally attuned to energy, and they respond well to reiki often.",
      animalCommunication:
        "Animal Communication is a heart-centered, intuitive process that allows us to receive messages from your pet—emotionally, mentally, and spiritually. Through a quiet meditative process, I will connect with your animal's energy and share any messages, sensations, or emotions they communicate.",
      communicationHelps: [
        "Understand your pet's needs or behaviours",
        "Prepare them for changes (like moving or welcoming new animals)",
        "Support rescue animals in settling into a new home",
        "Navigate grief, loss, or end-of-life decisions",
        "Strengthen your bond through mutual understanding",
      ],
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
            duration: "90 minutes (45 minutes each for you and your pet)",
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
      petParentHealing: {
        description:
          "The bond between a pet and their human is sacred—filled with unconditional love, shared experiences, and deep emotional understanding. But when illness, aging, or end-of-life approaches, that connection can become even more profound—and more painful. I offer Reiki healing sessions for both pets and their parents, providing energetic support, emotional grounding, and a safe space to navigate life's most tender moments together.",
        forPets: [
          "Eases pain, anxiety, and restlessness",
          "Promotes relaxation and emotional balance",
          "Offers comfort during illness and aging",
          "Supports a peaceful transition with dignity and love",
        ],
        forParents: [
          "Reduces stress, guilt, and anticipatory grief",
          "Helps you stay present and connected through caregiving",
          "Provides emotional and energetic support through the transition",
          "Aids healing during the grieving process after loss",
        ],
        rainbowBridge:
          "As your beloved companion prepares to leave this life, Reiki becomes a gentle and sacred support system, helping their soul transition peacefully while offering you a sense of closure, clarity, and connection. These sessions can be shared before, during, or after the transition. I also offer grief support sessions for pet parents coping with the heartache of loss, helping you process emotions, honor the bond, and begin healing.",
      },
    },
    {
      id: "lama-fera",
      icon: Zap,
      title: "Lama Fera Healing",
      subtitle:
        "Ancient Tibetan Healing for Deep Spiritual & Energetic Transformation",
      description:
        "Lama Fera is a powerful energy healing system that originated in the Himalayan Buddhist monasteries of Tibet. Used by monks for centuries, it works by channeling high-vibrational healing energy from Lord Buddha to release negative energies, clear karmic blocks, and accelerate spiritual growth. Unlike other energy healing methods, Lama Fera is known for its intensity, speed, and deep transformative power. It is particularly effective for those who feel spiritually stuck, emotionally burdened, or energetically blocked.",
      image: "/lama-fera.jpeg",
      duration: "30-45 minutes",
      benefits: [
        "Remove negative energy, psychic disturbances, or entity attachments",
        "Clear past life karmic imprints or unresolved emotional blocks",
        "Boost your spiritual growth, clarity, and inner peace",
        "Promote emotional release and mental calmness",
        "Enhance physical healing and energy balance",
        "Protect your aura and energy field from harmful influences",
        "Clear spaces like homes, offices",
      ],
      pricing: {
        inPerson: { single: 150 },
        distance: { single: 120 },
      },
      experience:
        "Lama Fera is performed using special symbols, mantras, and ritual tools that activate deep spiritual energy. You will lie down while I channel healing energy through your energy field and chakras. The session is quiet and meditative, but many clients report feeling heat, vibrations, emotional release, or deep peace during and after the session. It's suitable for anyone open to spiritual healing, whether you're familiar with energy work or new to it.",
    },
    {
      id: "meditation",
      icon: Waves,
      title: "Meditation Programs",
      subtitle: "Quiet the Mind. Open the Heart. Return to Stillness",
      description:
        "In today's fast-paced world, meditation offers a peaceful refuge—a space to slow down, reconnect with yourself, and cultivate clarity, calm, and emotional balance. My guided meditation sessions are designed to support both beginners and experienced meditators in cultivating a sustainable, nourishing practice.",
      image: "/meditation.jpeg",
      benefits: [
        "Reduce stress, anxiety, and emotional overwhelm",
        "Improve focus, clarity, and mental resilience",
        "Support better sleep and nervous system regulation",
        "Increase emotional awareness and self-compassion",
        "Deepen your spiritual connection and inner wisdom",
        "Create a greater sense of peace and presence in daily life",
        "Opens paths to spiritual journeys if you are called to take",
      ],
      programs: [
        {
          id: "8-week-program",
          name: "8-Week Transformational Meditation & Mindfulness Coaching Program",
          type: "Group sessions - Weekends, once a week - Online",
          duration: "60 minutes",
          price: 325,
          note: "for 8 weeks",
          description:
            "This isn't just a meditation program; it weaves together guided mindfulness, interactive life coaching, personal development, and therapeutic arts sessions to help you clear your path to self-discovery while deepening your spiritual awareness.",
          values: [
            "Rooted in authenticity, compassion, and accessibility",
            "Practical and theory-backed with evidence-based insights",
            "Easy to follow and implement",
            "Personalized guidance and support",
          ],
          includes: [
            "Weekly live session (Online)",
            "Printable journals, affirmations, workbooks",
            "Stress relief guidance",
            "Gentle daily home practices, art therapy worksheets, mantras",
            "Private support via WhatsApp groups, just for accountability!",
            "Replays available for registered participants",
          ],
        },
        {
          id: "morning-meditation",
          name: "Guided Morning Daily Meditation Sessions",
          type: "Recorded - Weekdays",
          duration: "30 minutes",
          price: 75,
          note: "per week (5 weekdays)",
          description:
            "Join me each morning for a guided meditation designed to ground your mind, energise your body, and set a positive tone for the day ahead.",
          includes: [
            "30 minute guided meditations",
            "Focus on breathwork, mindfulness, positive affirmations, Mantras",
            "Gentle start to reduce stress and increase focus",
            "Accessible for all levels—no experience needed",
            "Supported with sound frequencies/Reiki",
            "Replays available for registered participants",
          ],
          whyMorning: [
            "A Quiet Mind Meets a Quiet World - The early hours are naturally quieter",
            "Sets a Positive Tone for the Day - Better equipped to handle stress",
            "Builds Consistency and Routine - Reinforces structure and self-discipline",
            "Boosts Focus, Energy, and Creativity - Enhances ability to focus and sparks creativity",
          ],
        },
        {
          id: "group-circles",
          name: "Group Meditation Circles",
          type: "Community-based guided sessions held monthly/weekly",
          description:
            "Community-based group meditation sessions offer a welcoming, supportive space to deepen your practice, connect with like-minded people, and experience a shared sense of calm and purpose.",
          benefits: [
            "A Sense of Belonging - Connection and community",
            "Enhanced Focus & Presence - Collective energy makes it easier to stay present",
            "Shared Learning & Insight - Guided meditations, reflections, sharing circles",
            "Emotional Support & Healing - Gentle and non-judgmental space",
            "Consistency & Accountability - Regular part of your routine",
          ],
          note: "Live sessions, in-person. Once a week on weekends. Please send an inquiry for details and bookings.",
        },
      ],
    },
    {
      id: "corporate-wellness",
      icon: Building,
      title: "Corporate Wellness Services",
      subtitle:
        "Empowering Teams with Mindful Tools for a Healthier, Happier Workplace",
      description:
        "Today's work culture demands more than just productivity—it calls for balance, wellbeing, and genuine human connection. My Corporate Wellness programs are designed to help your team reduce stress, boost creativity, and enhance mental clarity through unique, experiential sessions that go beyond the usual offerings.",
      image: "/corperate.jpeg",
      services: [
        {
          name: "Guided Meditation for Focus & Calm",
          description:
            "Simple, accessible meditation techniques tailored for the workplace. Sessions help reduce anxiety, improve focus, and build emotional awareness.",
          greatFor: "Burnout prevention, midday resets, mental clarity",
        },
        {
          name: "Group Hypnosis for Stress Reduction",
          description:
            "Group hypnotherapy offers deep relaxation and subconscious reprogramming to reduce stress, enhance confidence, and manage workplace pressures.",
          greatFor:
            "Managing overwhelm, boosting motivation, and changing mindset",
        },
        {
          name: "Art Therapy for Expression & Team Connection",
          description:
            "Creative sessions that use painting, drawing, and visual storytelling to process emotions, build self-awareness, and foster team bonding.",
          greatFor:
            "Enhancing creativity, emotional intelligence, and communication",
        },
        {
          name: "Baking for Stress Relief & Team Building",
          description:
            "Hands-on baking experiences that blend mindfulness with the comfort of food. These sessions reduce cortisol, build community, and leave teams with something delicious to share.",
          greatFor:
            "Decompressing, increasing joy, and nourishing workplace culture",
        },
      ],
      // whyChoose: [
      //   "Customizable programs for on-site or virtual delivery",
      //   "With certifications in wellness, therapy, and creative arts, I bring an integrated approach to each session",
      //   "Bringing 17years experience in baking training integrated with the knowledge in mindfulness with Baking",
      //   "Suitable for all team sizes and industries",
      //   "Designed to create long-term impact, not just a one-time fix",
      // ],
    },
    {
      id: "reiki-training",
      icon: GraduationCap,
      title: "Reiki Training",
      subtitle: "Learn Reiki & Animal Reiki - Awaken Your Inner Healer",
      description:
        "Reiki is more than just a healing technique—it's a spiritual path, a life-changing journey, and a powerful tool for inner transformation. Whether you're drawn to Reiki to support your own well-being, help others, or connect more deeply with animals, learning Reiki opens the door to profound energetic awareness, emotional healing, and soul-aligned living.",
      image: "/meditation group.jpeg",
      whyLearn: [
        "Reduce stress and anxiety",
        "Support physical and emotional healing",
        "Clear energetic blocks and promote balance",
        "Deepen your intuition and spiritual connection",
        "Offer healing to yourself, loved ones, and clients",
      ],
      courses: [
        {
          level: "Reiki Level 1",
          title: "Self-Healing & Awareness",
          includes: [
            "Learn the basics of energy healing",
            "Discover hand positions for self and others",
            "Begin your personal healing journey",
          ],
        },
        {
          level: "Reiki Level 2",
          title: "Healing Others & Distance Reiki",
          includes: [
            "Learn the sacred Reiki symbols",
            "Send healing across time and space",
            "Strengthen your intuitive healing abilities",
          ],
        },
        {
          level: "Reiki Level 3",
          title: "Master Level",
          includes: [
            "Receive the Reiki Master symbol",
            "Deepen your spiritual growth and healing practice",
            "Optional training to teach and attune others",
          ],
        },
      ],
      animalReikiTraining: {
        description:
          "Animals are intuitive, sensitive beings who respond beautifully to Reiki. Learning Animal Reiki allows you to share healing energy with pets, rescue animals, wildlife, and more—while deepening your bond and communication with them.",
        whyLearn: [
          "Support your pet's emotional and physical well-being",
          "Help animals heal from trauma, illness, or anxiety",
          "Assist animals in shelters or foster care",
          "Create a calming, energetic space during transitions or end-of-life care",
        ],
        includes: [
          "Introduction to animal energy fields & chakras",
          "How to safely offer Reiki to animals",
          "Building trust and energetic consent",
          "Basics of intuitive animal communication",
          "Understanding animal behavior, emotions, and soul messages",
          "Ethics and sensitivity in animal healing work",
        ],
      },
      unique:
        "As a Certified Reiki Master, Animal Reiki Practitioner, and Animal Communicator, I blend traditional Reiki teachings with intuitive development, spiritual insight, and compassionate guidance. My classes are trauma-informed, heart-centered, and grounded in both practice and purpose.",
      note: "All levels include manuals, practice sessions, certificates, and guided support.",
    },
  ];

  useEffect(() => {
    // Handle scrolling to anchor on page load
    if (typeof window !== "undefined") {
      const hash = window.location.hash.substring(1);
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <section className="py-12 bg-gradient-to-br from-stone-100 to-sage-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/services">
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-stone-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
              </Button>
            </Link>
          </div>
          <div className="text-center space-y-4">
            <Badge className="bg-sage-100 text-sage-700">
              Detailed Service Information
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-serif text-stone-800">
              Complete Guide to Our
              <span className="text-sage-600"> Healing Services</span>
            </h1>
            <p className="text-lg text-stone-600 max-w-3xl mx-auto">
              Explore comprehensive details about each healing modality,
              understand what to expect, and discover how these transformative
              practices can support your wellness journey.
            </p>
          </div>
        </div>
      </section>

      {/* Services Detail */}
      <section className="py-20">
        <div className="container mx-auto px-4 space-y-32">
          {services.map((service, index) => (
            <div
              key={service.id}
              id={service.id}
              className="max-w-7xl mx-auto scroll-mt-20"
            >
              <Card className="border-stone-200 overflow-hidden">
                <CardContent className="p-0">
                  {/* Service Header */}
                  <div className="bg-gradient-to-r from-sage-50 to-stone-50 p-8 lg:p-12">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="p-4 bg-sage-100 rounded-xl">
                            <service.icon className="h-8 w-8 text-sage-600" />
                          </div>
                          <div>
                            <h2 className="text-3xl lg:text-4xl font-serif text-stone-800">
                              {service.title}
                            </h2>
                            <p className="text-sage-600 font-medium mt-1">
                              {service.subtitle}
                            </p>
                          </div>
                        </div>
                        <p className="text-stone-600 leading-relaxed text-lg">
                          {service.description}
                        </p>

                        {/* Quick Info */}
                        <div className="flex flex-wrap gap-4">
                          {/* <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-stone-200">
                            <Clock className="h-4 w-4 text-sage-600" />
                            <span className="text-sm text-stone-700">{service.duration}</span>
                          </div> */}
                          {service.consultation && (
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-stone-200">
                              <Phone className="h-4 w-4 text-sage-600" />
                              <span className="text-sm text-stone-700">
                                {service.consultation}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Link
                            href={
                              service.id != "meditation"
                                ? `/booking?service=${service.id}`
                                : "/contact"
                            }
                          >
                            <Button className="bg-sage-600 hover:bg-sage-700 text-white">
                              <Calendar className="h-4 w-4 mr-2" />
                              Book This Service
                            </Button>
                          </Link>
                          <Link href="/contact">
                            <Button
                              variant="outline"
                              className="border-stone-300 bg-transparent"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Ask Questions
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div className="relative">
                        <Image
                          src={service.image || "/placeholder.svg"}
                          alt={`${service.title} healing session`}
                          width={600}
                          height={400}
                          className="rounded-xl object-cover w-full h-[400px] shadow-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service Content */}
                  <div className="p-8 lg:p-12 space-y-12">
                    {/* Conditions/Benefits */}
                    {service.conditions && (
                      <div>
                        <h3 className="text-2xl font-serif text-stone-800 mb-6 flex items-center gap-3">
                          <Target className="h-6 w-6 text-sage-600" />
                          Conditions We Address
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {service.conditions.map((condition, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-3 bg-sage-50 rounded-lg"
                            >
                              <CheckCircle className="h-4 w-4 text-sage-600 flex-shrink-0" />
                              <span className="text-stone-700 text-sm">
                                {condition}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {service.benefits && (
                      <div>
                        <h3 className="text-2xl font-serif text-stone-800 mb-6 flex items-center gap-3">
                          <Heart className="h-6 w-6 text-sage-600" />
                          How This Service Helps You
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {service.benefits.map((benefit, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-4 bg-white rounded-lg border border-stone-200"
                            >
                              <CheckCircle className="h-5 w-5 text-sage-600 mt-0.5 flex-shrink-0" />
                              <span className="text-stone-700">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Process Steps */}
                    {service.process && Array.isArray(service.process) && (
                      <div>
                        <h3 className="text-2xl font-serif text-stone-800 mb-6 flex items-center gap-3">
                          <Users className="h-6 w-6 text-sage-600" />
                          What to Expect in Your Session
                        </h3>
                        <div className="space-y-6">
                          {service.process.map((step, idx) => (
                            <div key={idx} className="flex gap-4">
                              <div className="flex-shrink-0 w-8 h-8 bg-sage-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-stone-800 mb-2">
                                  {step.step}
                                </h4>
                                <p className="text-stone-600 leading-relaxed">
                                  {step.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reasons for PLR */}
                    {service.reasons && (
                      <div>
                        <h3 className="text-2xl font-serif text-stone-800 mb-6">
                          Why People Seek Past Life Regression
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          {service.reasons.map((reason, idx) => (
                            <Card key={idx} className="border-stone-200">
                              <CardContent className="p-6">
                                <h4 className="font-semibold text-stone-800 mb-3">
                                  {reason.title}
                                </h4>
                                <p className="text-stone-600 text-sm leading-relaxed">
                                  {reason.description}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience/Process for specific services */}
                    {service.experience && (
                      <div className="bg-sage-50 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold text-stone-800 mb-4">
                          What to Expect
                        </h3>
                        <p className="text-stone-600 leading-relaxed">
                          {service.experience}
                        </p>
                      </div>
                    )}

                    {service.processDescription && (
                      <div className="bg-sage-50 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold text-stone-800 mb-4">
                          The Process
                        </h3>
                        <p className="text-stone-600 leading-relaxed">
                          {service.processDescription}
                        </p>
                      </div>
                    )}

                    {service.whyChoose && (
                      <div className="bg-stone-50 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold text-stone-800 mb-4">
                          Why Choose Reiki?
                        </h3>
                        <p className="text-stone-600 leading-relaxed">
                          {service.whyChoose}
                        </p>
                      </div>
                    )}

                    {/* Animal Reiki Specific Content */}
                    {service.animalReiki && (
                      <div>
                        <h3 className="text-2xl font-serif text-stone-800 mb-4">
                          What Is Animal Reiki?
                        </h3>
                        <p className="text-stone-600 leading-relaxed mb-6">
                          {service.animalReiki}
                        </p>
                      </div>
                    )}

                    {service.animalCommunication && (
                      <div>
                        <h3 className="text-2xl font-serif text-stone-800 mb-4">
                          What's Animal Communication?
                        </h3>
                        <p className="text-stone-600 leading-relaxed mb-4">
                          {service.animalCommunication}
                        </p>
                        {service.communicationHelps && (
                          <div className="space-y-2">
                            <p className="font-medium text-stone-800">
                              It can help you:
                            </p>
                            <ul className="space-y-2">
                              {service.communicationHelps.map((help, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-center gap-3"
                                >
                                  <CheckCircle className="h-4 w-4 text-sage-600" />
                                  <span className="text-stone-600">{help}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pet & Parent Healing */}
                    {service.petParentHealing && (
                      <div className="space-y-6">
                        <h3 className="text-2xl font-serif text-stone-800">
                          Reiki Healing for Pets & Their Parents
                        </h3>
                        <p className="text-stone-600 leading-relaxed">
                          {service.petParentHealing.description}
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                          <Card className="border-stone-200">
                            <CardContent className="p-6">
                              <h4 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                                <Leaf className="h-5 w-5 text-sage-600" />
                                For Pets
                              </h4>
                              <ul className="space-y-2">
                                {service.petParentHealing.forPets.map(
                                  (benefit, idx) => (
                                    <li
                                      key={idx}
                                      className="flex items-start gap-2"
                                    >
                                      <CheckCircle className="h-4 w-4 text-sage-600 mt-0.5" />
                                      <span className="text-stone-600 text-sm">
                                        {benefit}
                                      </span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </CardContent>
                          </Card>

                          <Card className="border-stone-200">
                            <CardContent className="p-6">
                              <h4 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
                                <Heart className="h-5 w-5 text-sage-600" />
                                For Pet Parents
                              </h4>
                              <ul className="space-y-2">
                                {service.petParentHealing.forParents.map(
                                  (benefit, idx) => (
                                    <li
                                      key={idx}
                                      className="flex items-start gap-2"
                                    >
                                      <CheckCircle className="h-4 w-4 text-sage-600 mt-0.5" />
                                      <span className="text-stone-600 text-sm">
                                        {benefit}
                                      </span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                          <h4 className="font-semibold text-amber-800 mb-3">
                            Crossing the Rainbow Bridge
                          </h4>
                          <p className="text-amber-700 leading-relaxed">
                            {service.petParentHealing.rainbowBridge}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Meditation Programs */}
                    {service.programs && (
                      <div className="space-y-8">
                        <h3 className="text-2xl font-serif text-stone-800">
                          Meditation Offerings
                        </h3>
                        {service.programs.map((program, idx) => (
                          <Card key={idx} className="border-stone-200">
                            <CardContent className="p-6 space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="text-xl font-semibold text-stone-800">
                                    {program.name}
                                  </h4>
                                  <p className="text-sage-600 text-sm mt-1">
                                    {program.type}
                                  </p>
                                </div>
                                {program.price && (
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-sage-600">
                                      ${program.price}
                                    </div>
                                    <div className="text-sm text-stone-500">
                                      {program.note}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <p className="text-stone-600 leading-relaxed">
                                {program.description}
                              </p>

                              {program.values && (
                                <div>
                                  <h5 className="font-medium text-stone-800 mb-2">
                                    Values:
                                  </h5>
                                  <ul className="space-y-1">
                                    {program.values.map((value, valueIdx) => (
                                      <li
                                        key={valueIdx}
                                        className="flex items-start gap-2"
                                      >
                                        <CheckCircle className="h-4 w-4 text-sage-600 mt-0.5" />
                                        <span className="text-stone-600 text-sm">
                                          {value}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {program.includes && (
                                <div>
                                  <h5 className="font-medium text-stone-800 mb-2">
                                    What's Included:
                                  </h5>
                                  <ul className="space-y-1">
                                    {program.includes.map((item, itemIdx) => (
                                      <li
                                        key={itemIdx}
                                        className="flex items-start gap-2"
                                      >
                                        <CheckCircle className="h-4 w-4 text-sage-600 mt-0.5" />
                                        <span className="text-stone-600 text-sm">
                                          {item}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {program.whyMorning && (
                                <div>
                                  <h5 className="font-medium text-stone-800 mb-2">
                                    Why Morning Meditation Works:
                                  </h5>
                                  <ul className="space-y-1">
                                    {program.whyMorning.map(
                                      (reason, reasonIdx) => (
                                        <li
                                          key={reasonIdx}
                                          className="flex items-start gap-2"
                                        >
                                          <Star className="h-4 w-4 text-sage-600 mt-0.5" />
                                          <span className="text-stone-600 text-sm">
                                            {reason}
                                          </span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                              {program.benefits && (
                                <div>
                                  <h5 className="font-medium text-stone-800 mb-2">
                                    Benefits of Group Meditation:
                                  </h5>
                                  <ul className="space-y-1">
                                    {program.benefits.map(
                                      (benefit, benefitIdx) => (
                                        <li
                                          key={benefitIdx}
                                          className="flex items-start gap-2"
                                        >
                                          <Users className="h-4 w-4 text-sage-600 mt-0.5" />
                                          <span className="text-stone-600 text-sm">
                                            {benefit}
                                          </span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                              {program.note && (
                                <div className="bg-stone-50 p-4 rounded-lg">
                                  <p className="text-stone-600 text-sm">
                                    {program.note}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Corporate Services */}
                    {service.services && (
                      <div className="space-y-6">
                        <h3 className="text-2xl font-serif text-stone-800">
                          Our Wellness Service Packages Include:
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          {service.services.map((corporateService, idx) => (
                            <Card key={idx} className="border-stone-200">
                              <CardContent className="p-6">
                                <h4 className="font-semibold text-stone-800 mb-3">
                                  {corporateService.name}
                                </h4>
                                <p className="text-stone-600 text-sm mb-3 leading-relaxed">
                                  {corporateService.description}
                                </p>
                                <div className="bg-sage-50 p-3 rounded-lg">
                                  <p className="text-sage-700 text-sm">
                                    <strong>Great for:</strong>{" "}
                                    {corporateService.greatFor}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        {service.whyChoose &&
                          Array.isArray(service.whyChoose) && (
                            <div>
                              <h4 className="text-xl font-semibold text-stone-800 mb-4">
                                Why Choose Me?
                              </h4>
                              <ul className="space-y-2">
                                {service.whyChoose.map((reason, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-3"
                                  >
                                    <Award className="h-5 w-5 text-sage-600 mt-0.5" />
                                    <span className="text-stone-600">
                                      {reason}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    )}

                    {/* Reiki Training Content */}
                    {service.whyLearn && (
                      <div>
                        <h3 className="text-2xl font-serif text-stone-800 mb-4">
                          Why Learn Reiki?
                        </h3>
                        <p className="text-stone-600 mb-4">
                          Reiki is a gentle, natural energy healing method that
                          works holistically on the mind, body, emotions, and
                          spirit. By learning Reiki, you gain the ability to:
                        </p>
                        <ul className="space-y-2">
                          {service.whyLearn.map((benefit, idx) => (
                            <li key={idx} className="flex items-center gap-3">
                              <CheckCircle className="h-4 w-4 text-sage-600" />
                              <span className="text-stone-600">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {service.courses && (
                      <div>
                        <h3 className="text-2xl font-serif text-stone-800 mb-6">
                          Reiki Course Offerings
                        </h3>
                        <div className="space-y-6">
                          {service.courses.map((course, idx) => (
                            <Card key={idx} className="border-stone-200">
                              <CardContent className="p-6">
                                <h4 className="text-xl font-semibold text-stone-800 mb-2">
                                  {course.level}
                                </h4>
                                <p className="text-sage-600 font-medium mb-4">
                                  {course.title}
                                </p>
                                <ul className="space-y-2">
                                  {course.includes.map((item, itemIdx) => (
                                    <li
                                      key={itemIdx}
                                      className="flex items-center gap-3"
                                    >
                                      <CheckCircle className="h-4 w-4 text-sage-600" />
                                      <span className="text-stone-600">
                                        {item}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {service.animalReikiTraining && (
                      <div className="space-y-6">
                        <h3 className="text-2xl font-serif text-stone-800">
                          Learn Animal Reiki & Communication
                        </h3>
                        <p className="text-stone-600 leading-relaxed">
                          {service.animalReikiTraining.description}
                        </p>

                        <div>
                          <h4 className="text-xl font-semibold text-stone-800 mb-4">
                            Why Learn Animal Reiki?
                          </h4>
                          <ul className="space-y-2">
                            {service.animalReikiTraining.whyLearn.map(
                              (reason, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-center gap-3"
                                >
                                  <CheckCircle className="h-4 w-4 text-sage-600" />
                                  <span className="text-stone-600">
                                    {reason}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-xl font-semibold text-stone-800 mb-4">
                            Training Includes:
                          </h4>
                          <ul className="space-y-2">
                            {service.animalReikiTraining.includes.map(
                              (item, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-center gap-3"
                                >
                                  <CheckCircle className="h-4 w-4 text-sage-600" />
                                  <span className="text-stone-600">{item}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    )}

                    {service.unique && (
                      <div className="bg-sage-50 p-6 rounded-xl">
                        <h4 className="text-xl font-semibold text-stone-800 mb-4">
                          What Makes My Training Unique?
                        </h4>
                        <p className="text-stone-600 leading-relaxed">
                          {service.unique}
                        </p>
                      </div>
                    )}

                    {service.note && (
                      <div className="bg-stone-50 p-4 rounded-lg">
                        <p className="text-stone-600 text-sm">{service.note}</p>
                      </div>
                    )}

                    {/* Pricing Section */}
                    <div>
                      <h3 className="text-2xl font-serif text-stone-800 mb-6 flex items-center gap-3">
                        <Package className="h-6 w-6 text-sage-600" />
                        Investment & Booking Options
                      </h3>

                      {/* Regular Pricing */}
                      {service.pricing?.single && (
                        <div className="space-y-4 mb-6">
                          <Card className="border-sage-200">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-semibold text-stone-800">
                                  Single Session
                                </h4>
                                <div className="text-2xl font-bold text-sage-600">
                                  ${service.pricing.single}
                                </div>
                              </div>
                              {service.pricing.includes && (
                                <p className="text-stone-600 text-sm mb-4">
                                  {service.pricing.includes}
                                </p>
                              )}
                              <Link
                                href={`/booking?service=${service.id}&package=single`}
                              >
                                <Button className="w-full bg-sage-600 hover:bg-sage-700 text-white">
                                  Book Single Session
                                </Button>
                              </Link>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {/* In-Person and Distance Pricing */}
                      {service.pricing?.inPerson && (
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-sage-600" />
                              In-Person Sessions
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                              <Card className="border-stone-200">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-center mb-3">
                                    <span className="font-medium text-stone-800">
                                      Single Session
                                    </span>
                                    <span className="text-lg font-bold text-sage-600">
                                      ${service.pricing.inPerson.single}
                                    </span>
                                  </div>
                                  {service.pricing.inPerson.duration && (
                                    <p className="text-xs text-stone-500 mb-3">
                                      {service.pricing.inPerson.duration}
                                    </p>
                                  )}
                                  <Link
                                    href={`/booking?service=${service.id}&type=in-person&package=single`}
                                  >
                                    <Button
                                      size="sm"
                                      className="w-full bg-sage-600 hover:bg-sage-700 text-white"
                                    >
                                      Book In-Person
                                    </Button>
                                  </Link>
                                </CardContent>
                              </Card>

                              {service.pricing.inPerson.packages?.map(
                                (pkg, idx) => (
                                  <Card key={idx} className="border-stone-200">
                                    <CardContent className="p-4">
                                      <div className="flex justify-between items-center mb-3">
                                        <span className="font-medium text-stone-800">
                                          {pkg.sessions} Sessions
                                        </span>
                                        <span className="text-lg font-bold text-sage-600">
                                          ${pkg.price}
                                        </span>
                                      </div>
                                      <div className="text-xs text-stone-500 mb-3">
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
                                          Book {pkg.sessions} Sessions
                                        </Button>
                                      </Link>
                                    </CardContent>
                                  </Card>
                                )
                              )}
                            </div>
                          </div>

                          {service.pricing.distance && (
                            <div>
                              <h4 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                                <Globe className="h-5 w-5 text-sage-600" />
                                Distance Healing Sessions
                              </h4>
                              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Card className="border-stone-200">
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-center mb-3">
                                      <span className="font-medium text-stone-800">
                                        Single Session
                                      </span>
                                      <span className="text-lg font-bold text-sage-600">
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
                                        Book Distance
                                      </Button>
                                    </Link>
                                  </CardContent>
                                </Card>

                                {service.pricing.distance.packages?.map(
                                  (pkg, idx) => (
                                    <Card
                                      key={idx}
                                      className="border-stone-200"
                                    >
                                      <CardContent className="p-4">
                                        <div className="flex justify-between items-center mb-3">
                                          <span className="font-medium text-stone-800">
                                            {pkg.sessions} Sessions
                                          </span>
                                          <span className="text-lg font-bold text-sage-600">
                                            ${pkg.price}
                                          </span>
                                        </div>
                                        <div className="text-xs text-stone-500 mb-3">
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
                                            Book {pkg.sessions}
                                          </Button>
                                        </Link>
                                      </CardContent>
                                    </Card>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {/* Pet & Parent Package */}
                          {service.pricing.petParentPackage && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                              <h4 className="text-lg font-semibold text-amber-800 mb-4">
                                Pet & Parent Package
                              </h4>
                              <p className="text-amber-700 text-sm mb-4">
                                Healing sessions for both you and your pet
                              </p>

                              <div className="space-y-4">
                                <div>
                                  <h5 className="font-medium text-amber-800 mb-3">
                                    In-Person Package
                                  </h5>
                                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    <Card className="border-amber-200 bg-white">
                                      <CardContent className="p-3">
                                        <div className="text-center">
                                          <div className="text-lg font-bold text-sage-600">
                                            $
                                            {
                                              service.pricing.petParentPackage
                                                .inPerson.single
                                            }
                                          </div>
                                          <div className="text-xs text-stone-600 mb-2">
                                            Single Session
                                          </div>
                                          <Link
                                            href={`/booking?service=${service.id}&type=pet-parent-in-person&package=single`}
                                          >
                                            <Button
                                              size="sm"
                                              className="w-full text-xs bg-sage-600 hover:bg-sage-700"
                                            >
                                              Book
                                            </Button>
                                          </Link>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    {service.pricing.petParentPackage.inPerson.packages?.map(
                                      (pkg, idx) => (
                                        <Card
                                          key={idx}
                                          className="border-amber-200 bg-white"
                                        >
                                          <CardContent className="p-3">
                                            <div className="text-center">
                                              <div className="text-lg font-bold text-sage-600">
                                                ${pkg.price}
                                              </div>
                                              <div className="text-xs text-stone-600 mb-2">
                                                {pkg.sessions} Sessions
                                              </div>
                                              <Link
                                                href={`/booking?service=${service.id}&type=pet-parent-in-person&package=${pkg.sessions}-sessions`}
                                              >
                                                <Button
                                                  size="sm"
                                                  className="w-full text-xs bg-sage-600 hover:bg-sage-700"
                                                >
                                                  Book
                                                </Button>
                                              </Link>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      )
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <h5 className="font-medium text-amber-800 mb-3">
                                    Distance Package
                                  </h5>
                                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    <Card className="border-amber-200 bg-white">
                                      <CardContent className="p-3">
                                        <div className="text-center">
                                          <div className="text-lg font-bold text-sage-600">
                                            $
                                            {
                                              service.pricing.petParentPackage
                                                .distance.single
                                            }
                                          </div>
                                          <div className="text-xs text-stone-600 mb-2">
                                            Single Session
                                          </div>
                                          <Link
                                            href={`/booking?service=${service.id}&type=pet-parent-distance&package=single`}
                                          >
                                            <Button
                                              size="sm"
                                              className="w-full text-xs bg-sage-600 hover:bg-sage-700"
                                            >
                                              Book
                                            </Button>
                                          </Link>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    {service.pricing.petParentPackage.distance.packages?.map(
                                      (pkg, idx) => (
                                        <Card
                                          key={idx}
                                          className="border-amber-200 bg-white"
                                        >
                                          <CardContent className="p-3">
                                            <div className="text-center">
                                              <div className="text-lg font-bold text-sage-600">
                                                ${pkg.price}
                                              </div>
                                              <div className="text-xs text-stone-600 mb-2">
                                                {pkg.sessions} Sessions
                                              </div>
                                              <Link
                                                href={`/booking?service=${service.id}&type=pet-parent-distance&package=${pkg.sessions}-sessions`}
                                              >
                                                <Button
                                                  size="sm"
                                                  className="w-full text-xs bg-sage-600 hover:bg-sage-700"
                                                >
                                                  Book
                                                </Button>
                                              </Link>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Age Regression Pricing */}
                      {service.pricing?.ageRegression && (
                        <div className="mt-6">
                          <Card className="border-amber-200 bg-amber-50">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-semibold text-amber-800">
                                  Age Regression Therapy
                                </h4>
                                <div className="text-2xl font-bold text-sage-600">
                                  ${service.pricing.ageRegression.price}
                                </div>
                              </div>
                              <p className="text-amber-700 text-sm mb-4">
                                {service.pricing.ageRegression.note}
                              </p>
                              <Link
                                href={`/booking?service=${service.id}&program=age-regression`}
                              >
                                <Button className="w-full bg-sage-600 hover:bg-sage-700 text-white">
                                  Book Age Regression Therapy
                                </Button>
                              </Link>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>

                    {/* Special Programs */}
                    {service.specialPrograms && (
                      <div>
                        <h3 className="text-2xl font-serif text-stone-800 mb-6 flex items-center gap-3">
                          <Star className="h-6 w-6 text-sage-600" />
                          Special Programs
                        </h3>
                        <div className="space-y-8">
                          {service.specialPrograms.map((program, idx) => (
                            <Card
                              key={idx}
                              className="border-stone-200 overflow-hidden"
                            >
                              <CardContent className="p-0">
                                <div className="bg-gradient-to-r from-sage-50 to-stone-50 p-6">
                                  <div className="flex justify-between items-start mb-4">
                                    <div>
                                      <h4 className="text-2xl font-serif text-stone-800">
                                        {program.name}
                                      </h4>
                                      <p className="text-sage-600 font-medium">
                                        {program.duration}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-3xl font-bold text-sage-600">
                                        ${program.price}
                                      </div>
                                      <div className="text-sm text-stone-500">
                                        Complete Program
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-stone-600 leading-relaxed">
                                    {program.description}
                                  </p>
                                </div>

                                <div className="p-6 space-y-6">
                                  <div>
                                    <h5 className="font-semibold text-stone-800 mb-3">
                                      What's Included:
                                    </h5>
                                    <div className="grid md:grid-cols-2 gap-2">
                                      {program.includes.map((item, itemIdx) => (
                                        <div
                                          key={itemIdx}
                                          className="flex items-start gap-2"
                                        >
                                          <CheckCircle className="h-4 w-4 text-sage-600 mt-0.5 flex-shrink-0" />
                                          <span className="text-stone-600 text-sm">
                                            {item}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {program.benefits && (
                                    <div>
                                      <h5 className="font-semibold text-stone-800 mb-3">
                                        Program Benefits:
                                      </h5>
                                      <div className="grid md:grid-cols-2 gap-2">
                                        {program.benefits.map(
                                          (benefit, benefitIdx) => (
                                            <div
                                              key={benefitIdx}
                                              className="flex items-start gap-2"
                                            >
                                              <Star className="h-4 w-4 text-sage-600 mt-0.5 flex-shrink-0" />
                                              <span className="text-stone-600 text-sm">
                                                {benefit}
                                              </span>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  <Link
                                    href={`/booking?service=${service.id}&program=${program.id}`}
                                  >
                                    <Button className="w-full bg-sage-600 hover:bg-sage-700 text-white">
                                      Book {program.name}
                                    </Button>
                                  </Link>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact CTA */}
                    <div className="bg-sage-600 text-white rounded-xl p-8 text-center">
                      <h3 className="text-2xl font-serif mb-4">
                        Ready to Begin Your Healing Journey?
                      </h3>
                      <p className="text-sage-100 mb-6 max-w-2xl mx-auto">
                        Take the first step towards transformation. Book your
                        session or free consultation today.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={`/booking?service=${service.id}`}>
                          <Button
                            size="lg"
                            className="bg-white text-sage-600 hover:bg-stone-50"
                          >
                            <Calendar className="h-5 w-5 mr-2" />
                            Book This Service
                          </Button>
                        </Link>
                        <Link href="/contact">
                          <Button
                            size="lg"
                            variant="outline"
                            className="border-white text-white hover:bg-white/10 bg-transparent"
                          >
                            <Phone className="h-5 w-5 mr-2" />
                            Free Consultation
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {index < services.length - 1 && <Separator className="my-16" />}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-stone-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-serif">
              Questions About Our Services?
            </h2>
            <p className="text-stone-300 text-lg">
              I'm here to help you choose the right healing approach for your
              unique needs. Contact me for personalized guidance.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="space-y-3">
                <Phone className="h-8 w-8 text-sage-400 mx-auto" />
                <h3 className="font-semibold">Phone</h3>
                <div className="space-y-1 text-stone-300">
                  <div>+61 429 940 130</div>
                  {/* <div>+61 8 9221 1188</div> */}
                </div>
              </div>

              <div className="space-y-3">
                <Mail className="h-8 w-8 text-sage-400 mx-auto" />
                <h3 className="font-semibold">Email</h3>
                <div className="text-stone-300">healwithrangika@gmail.com</div>
              </div>

              <div className="space-y-3">
                <MapPin className="h-8 w-8 text-sage-400 mx-auto" />
                <h3 className="font-semibold">Location</h3>
                <div className="text-stone-300">
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

            <div className="pt-8">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-sage-600 hover:bg-sage-700 text-white"
                >
                  Get In Touch Today
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
