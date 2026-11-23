import Link from "next/link";
import { ArrowRight, BookOpen, Brain, GraduationCap, PawPrint, Sparkles } from "lucide-react";

// "Explore Your Healing Journey" (website content revised): the four pathways, each with its own menu tab.
const WAYS = [
  {
    icon: Brain,
    title: "Clinical Hypnotherapy",
    tagline: "Create space for positive change.",
    text: "Our minds hold incredible potential. Clinical hypnotherapy offers a therapeutic approach to exploring subconscious patterns, developing self-awareness and supporting meaningful personal change. Whether you wish to work towards greater confidence, manage stress or anxiety, change unhelpful habits or move forward from limiting beliefs, sessions are tailored to your individual needs and goals.",
    href: "/hypnotherapy",
    cta: "Explore the 20 areas of support",
  },
  {
    icon: Sparkles,
    title: "Reiki Energy Healing",
    tagline: "Restore your sense of inner harmony.",
    text: "Reiki is a gentle Japanese energy healing practice that invites relaxation, stillness and a deeper connection with yourself. Whether you are exploring Reiki for the first time or already familiar with energy healing, each session is approached with compassion, presence and respect for your individual experience.",
    href: "/reiki-healing",
    cta: "Discover Reiki healing",
  },
  {
    icon: PawPrint,
    title: "Animal Communication & Reiki Energy Healing",
    tagline: "Honouring the beautiful connection we share with animals.",
    text: "Animal Reiki offers a gentle, non-invasive complementary practice that respects each animal's individuality, comfort and choice. My intention is to create a calm and respectful experience, allowing animals to engage with the practice in their own time and in their own way. Because their wellbeing, comfort and trust matter.",
    href: "/reiki-healing#animals",
    cta: "For your animal companion",
  },
  {
    icon: GraduationCap,
    title: "Reiki Training & Spiritual Development",
    tagline: "Perhaps your healing journey is also a journey of discovery.",
    text: "Have you felt drawn to Reiki? Reiki training offers an opportunity to learn, explore and develop your understanding of this beautiful healing tradition. Whether you are taking your first steps or continuing your Reiki journey, I aim to provide a nurturing learning environment where you can grow in confidence, understanding and connection.",
    href: "/reiki-training",
    cta: "See Reiki training",
  },
];

/** "Explore Your Healing Journey": the four ways to work with Rangika, plus the self-paced courses. */
export function WaysToWork({ title = "Explore Your Healing Journey" }: { title?: string }) {
  return (
    <section id="journey" className="scroll-mt-24 bg-white py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
          <h2 className="font-serif text-3xl text-stone-800 lg:text-4xl">{title}</h2>
          <p className="text-stone-600">Different pathways, one intention: supporting your wellbeing with compassion, understanding and care.</p>
        </div>
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {WAYS.map((w) => (
            <Link
              key={w.href}
              href={w.href}
              className="group flex flex-col gap-3 rounded-2xl bg-stone-50 p-6 ring-1 ring-stone-200 transition hover:-translate-y-0.5 hover:bg-sage-50 hover:shadow-md hover:ring-sage-300 lg:p-8"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-100 text-sage-700">
                <w.icon className="h-6 w-6" />
              </span>
              <h3 className="font-serif text-2xl text-stone-800">{w.title}</h3>
              <p className="font-serif text-lg italic text-sage-700">{w.tagline}</p>
              <p className="flex-1 text-sm leading-relaxed text-stone-600">{w.text}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-sage-700">
                {w.cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
        <Link
          href="/courses"
          className="group mx-auto mt-6 flex max-w-6xl flex-col items-start justify-between gap-3 rounded-2xl bg-white p-5 ring-1 ring-stone-200 transition hover:ring-sage-300 sm:flex-row sm:items-center"
        >
          <span className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 shrink-0 text-sage-600" />
            <span>
              <span className="block font-serif text-lg text-stone-800">Courses</span>
              <span className="block text-sm text-stone-600">Self-paced courses you can follow at home, at your own pace.</span>
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-sage-700">
            Browse courses <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </section>
  );
}
