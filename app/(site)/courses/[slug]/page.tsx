import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Award, BookOpen, CalendarDays, CheckCircle, MapPin, Users } from "lucide-react";
import { db } from "@/lib/db";
import { money } from "@/lib/learning";
import { onSaleWhere } from "@/lib/course-sales";
import { BuyPackage } from "@/components/learn/buy-package";
import { coverUrl } from "@/lib/covers";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  return db.course.findFirst({
    where: { ...onSaleWhere, slug },
    include: { modules: { orderBy: [{ order: "asc" }, { title: "asc" }], select: { id: true, title: true, description: true } } },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = await load((await params).slug);
  return c ? { title: `${c.title} · Courses · Heal With Rangika`, description: c.summary ?? undefined } : { title: "Course not found" };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const c = await load((await params).slug);
  if (!c) notFound();
  const about = c.details || c.description;
  const full = c.seats !== null && c.seats <= 0;
  const price = money(c.price, c.currency);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <div className="container mx-auto max-w-7xl px-4 py-10 md:py-14">
        <Link href="/courses" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
          <ArrowLeft className="h-4 w-4" /> All courses
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_24rem] xl:gap-14">
          <div className="space-y-8">
            {coverUrl("course", c) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl("course", c)!} alt="" className="h-56 w-full rounded-2xl object-cover sm:h-80 lg:h-96" />
            )}
            <div className="space-y-3">
              <h1 className="font-serif text-4xl text-stone-800">{c.title}</h1>
              {c.summary && <p className="text-lg text-stone-600">{c.summary}</p>}
            </div>

            {about && (
              <section className="space-y-2">
                <h2 className="font-serif text-2xl text-stone-800">About this course</h2>
                <p className="whitespace-pre-line leading-relaxed text-stone-700">{about}</p>
              </section>
            )}

            {c.modules.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-serif text-2xl text-stone-800">What you&apos;ll cover</h2>
                <ul className="divide-y divide-stone-100 rounded-2xl bg-white ring-1 ring-stone-200">
                  {c.modules.map((m) => (
                    <li key={m.id} className="flex gap-3 px-4 py-3 text-sm">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" />
                      <div>
                        <p className="text-stone-800">{m.title}</p>
                        {m.description && <p className="text-stone-500">{m.description}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
              <p className="font-serif text-3xl text-stone-800">{price}</p>
              <ul className="space-y-2 text-sm text-stone-600">
                {c.format && (
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" /> {c.format}
                  </li>
                )}
                {c.schedule && (
                  <li className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" /> {c.schedule}
                  </li>
                )}
                {c.seats !== null && !full && (
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-sage-600" /> {c.seats} place{c.seats === 1 ? "" : "s"} left
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-sage-600" /> Course notes in your private space
                </li>
                <li className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-sage-600" /> Certificate from Rangika
                </li>
              </ul>
              {full ? (
                <div className="space-y-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
                  <p className="font-medium">This course is fully booked.</p>
                  <p>Contact Rangika to join the waiting list or hear about the next dates.</p>
                  <Link href="/contact" className="inline-block font-medium underline">
                    Contact Rangika
                  </Link>
                </div>
              ) : (
                <BuyPackage kind="course" packageId={c.id} title={c.title} priceLabel={price} />
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
