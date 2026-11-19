import Link from "next/link";
import type { Metadata } from "next";
import { Award, BadgeCheck, CalendarDays, GraduationCap, Layers, MonitorPlay, Users } from "lucide-react";
import { db } from "@/lib/db";
import { onSaleWhere } from "@/lib/course-sales";
import { coverUrl } from "@/lib/covers";
import { classPrice, formatPrice, viewerCurrency } from "@/lib/currency";
import { bundleSaving } from "@/lib/class-display";
import { CurrencySwitch } from "@/components/site/currency-switch";

export const metadata: Metadata = {
  title: "Classes · Heal With Rangika",
  description:
    "IPHMA accredited Usui Reiki training (Level 1, 2 and 3) and Animal Reiki & Communication training with Rangika. Live online group classes with a certificate.",
};
export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const [classes, currency] = await Promise.all([
    db.course.findMany({
      where: onSaleWhere,
      orderBy: [{ order: "asc" }, { title: "asc" }],
      include: { includes: { select: { title: true, price: true, priceAed: true }, orderBy: { order: "asc" } } },
    }),
    viewerCurrency(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <h1 className="font-serif text-4xl text-stone-800 md:text-5xl">Classes with Rangika</h1>
          <p className="text-lg text-stone-600">
            Discover Reiki and deepen your connection. Structured, accredited Usui Reiki and Animal Reiki training, taught live online in small,
            supportive groups.
          </p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 pt-2 text-sm text-stone-600">
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4 text-sage-600" /> IPHMA accredited
            </span>
            <span className="flex items-center gap-1.5">
              <MonitorPlay className="h-4 w-4 text-sage-600" /> Live online group classes
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-sage-600" /> Taught by Rangika
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-sage-600" /> Certificate for each level
            </span>
          </div>
          <CurrencySwitch current={currency} className="pt-2" />
        </div>
      </section>

      <section className="container mx-auto px-4 pb-12">
        {classes.length === 0 ? (
          <p className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center text-stone-600 ring-1 ring-stone-200">
            New class dates are coming soon. Please{" "}
            <Link href="/contact" className="text-sage-700 underline">
              contact Rangika
            </Link>{" "}
            to hear about the next class.
          </p>
        ) : (
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
            {classes.map((c) => {
              const full = c.seats !== null && c.seats <= 0;
              const price = classPrice(c, currency);
              const saving = bundleSaving(c, currency);
              const cover = coverUrl("course", c);
              return (
                <Link
                  key={c.id}
                  href={`/classes/${c.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:shadow-md hover:ring-sage-300"
                >
                  <div className="relative">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt="" className="h-52 w-full object-cover" />
                    ) : (
                      <div className="flex h-52 items-center justify-center bg-gradient-to-br from-sage-100 to-sage-200">
                        <GraduationCap className="h-10 w-10 text-sage-700" />
                      </div>
                    )}
                    {c.includes.length > 0 && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-sage-800 shadow-sm">
                        <Layers className="h-3.5 w-3.5" /> Bundle
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h2 className="font-serif text-xl text-stone-800 group-hover:text-sage-800">{c.title}</h2>
                    {c.summary && <p className="text-sm text-stone-600">{c.summary}</p>}
                    <div className="space-y-1 pt-1 text-xs text-stone-500">
                      {c.format && (
                        <p className="flex items-center gap-1.5">
                          <MonitorPlay className="h-3.5 w-3.5 shrink-0 text-sage-600" /> {c.format}
                        </p>
                      )}
                      {c.schedule && (
                        <p className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-sage-600" /> {c.schedule}
                        </p>
                      )}
                      {c.includes.length > 0 && (
                        <p className="flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 shrink-0 text-sage-600" /> Includes {c.includes.map((x) => x.title).join(" + ")}
                        </p>
                      )}
                      {c.prerequisite && <p className="text-stone-500">For students who have completed {c.prerequisite}</p>}
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-2 pt-3 text-sm">
                      <span className={full ? "font-medium text-amber-700" : "text-sage-700"}>
                        {full ? "Fully booked" : saving ? `Save ${formatPrice(saving, price.currency)}` : c.seats !== null ? `${c.seats} place${c.seats === 1 ? "" : "s"} left` : ""}
                      </span>
                      <span className="text-lg font-semibold text-stone-800">{formatPrice(price.amount, price.currency)}</span>
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
