import Link from "next/link";
import type { Metadata } from "next";
import { Award, BookOpen, CalendarDays, GraduationCap, MapPin, Users } from "lucide-react";
import { db } from "@/lib/db";
import { money } from "@/lib/learning";
import { onSaleWhere } from "@/lib/course-sales";
import { coverUrl } from "@/lib/covers";

export const metadata: Metadata = {
  title: "Classes · Heal With Rangika",
  description: "Reiki and healing classes taught by Rangika. Learn with guidance, practise together and receive your certificate.",
};
export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await db.course.findMany({
    where: onSaleWhere,
    orderBy: [{ order: "asc" }, { title: "asc" }],
    include: { _count: { select: { modules: true } } },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <h1 className="font-serif text-4xl text-stone-800 md:text-5xl">Classes with Rangika</h1>
          <p className="text-lg text-stone-600">
            Classes where you learn with Rangika&apos;s guidance, practise with others and receive a certificate.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2 text-sm text-stone-600">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-sage-600" /> Taught by Rangika
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-sage-600" /> Class notes in your private space
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-sage-600" /> Certificate when you complete
            </span>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-12">
        {courses.length === 0 ? (
          <p className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center text-stone-600 ring-1 ring-stone-200">
            New class dates are coming soon. Please{" "}
            <Link href="/contact" className="text-sage-700 underline">
              contact Rangika
            </Link>{" "}
            to hear about the next class.
          </p>
        ) : (
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
            {courses.map((c) => {
              const full = c.seats !== null && c.seats <= 0;
              return (
                <Link
                  key={c.id}
                  href={`/classes/${c.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:shadow-md hover:ring-sage-300"
                >
                  {coverUrl("course", c) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverUrl("course", c)!} alt="" className="h-48 w-full object-cover" />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-gradient-to-br from-sage-100 to-sage-200">
                      <GraduationCap className="h-10 w-10 text-sage-700" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h2 className="font-serif text-xl text-stone-800 group-hover:text-sage-800">{c.title}</h2>
                    {c.summary && <p className="text-sm text-stone-600">{c.summary}</p>}
                    <div className="space-y-1 pt-1 text-xs text-stone-500">
                      {c.format && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-sage-600" /> {c.format}
                        </p>
                      )}
                      {c.schedule && (
                        <p className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-sage-600" /> {c.schedule}
                        </p>
                      )}
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3 text-sm">
                      <span className={full ? "font-medium text-amber-700" : "text-stone-500"}>
                        {full ? "Fully booked" : c.seats !== null ? `${c.seats} place${c.seats === 1 ? "" : "s"} left` : `${c._count.modules} module${c._count.modules === 1 ? "" : "s"}`}
                      </span>
                      <span className="font-semibold text-stone-800">{money(c.price, c.currency)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 rounded-2xl bg-white p-6 ring-1 ring-stone-200 sm:flex-row">
          <div>
            <p className="font-serif text-xl text-stone-800">Prefer to learn on your own time?</p>
            <p className="text-sm text-stone-600">Rangika&apos;s self-paced courses open one lesson at a time, whenever it suits you.</p>
          </div>
          <Link href="/courses" className="shrink-0 rounded-md bg-sage-600 px-4 py-2 text-sm font-medium text-white hover:bg-sage-700">
            See courses
          </Link>
        </div>
      </section>
    </div>
  );
}
