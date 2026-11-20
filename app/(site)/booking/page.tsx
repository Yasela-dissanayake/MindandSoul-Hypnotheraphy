import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { serviceWithOptions } from "@/lib/session-catalog";
import { classPrice, viewerCurrency } from "@/lib/currency";
import { BookingFlow, type BookingService } from "@/components/booking/booking-flow";
import { CurrencySwitch } from "@/components/site/currency-switch";
import { freeOptionOf, getActivePromotion, promotedFirst, promotionLink } from "@/lib/promotions";

export const metadata: Metadata = {
  title: "Book a Session · Heal With Rangika",
  description: "Book a one-to-one session with Rangika: clinical hypnotherapy, regression, Reiki, Animal Reiki and more, in person in Perth or online.",
};
export const dynamic = "force-dynamic";

/**
 * Booking a one-to-one session. Links can choose ahead:
 * /booking?service=<slug>&sessions=<1|3|5…>&mode=in-person|online
 */
export default async function BookingPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const [sp, currency, services, promo] = await Promise.all([
    searchParams,
    viewerCurrency(),
    db.sessionService.findMany({
      where: { published: true, enquiryOnly: false, options: { some: {} } },
      orderBy: [{ order: "asc" }, { title: "asc" }],
      include: serviceWithOptions,
    }),
    getActivePromotion(),
  ]);
  // The running promotion's service is listed first; when it's free, its single session costs nothing.
  const link = promo ? promotionLink(promo) : null;
  const promotedId = link?.kind === "session" ? link.id : null;

  // Only what the page needs, with each price already in the visitor's currency.
  const list: BookingService[] = promotedFirst(services, promotedId).map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    summary: s.summary,
    lengthLabel: s.lengthLabel,
    inPerson: s.inPerson,
    online: s.online,
    promoted: s.id === promotedId,
    options: s.options.map((o) => {
      const p = classPrice(o, currency);
      const free = Boolean(promo?.free && s.id === promotedId && freeOptionOf(s.options)?.id === o.id);
      return { id: o.id, title: o.title, sessions: o.sessions, note: o.note, mode: o.mode, price: p.amount, currency: p.currency, free };
    }),
  }));
  const sessions = Number(sp.sessions);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <div className="container mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="mb-8 space-y-3 text-center">
          <h1 className="font-serif text-4xl text-stone-800 md:text-5xl">Book a Session</h1>
          <p className="mx-auto max-w-2xl text-stone-600">
            Choose your session, pick a time that suits you and pay securely. You&apos;ll receive your own private space where Rangika adds your session notes,
            exercises and material.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <CurrencySwitch current={currency} />
            <Link href="/sessions" className="text-sm text-sage-700 underline">
              Read about each session
            </Link>
          </div>
        </div>
        {list.length === 0 ? (
          <p className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center text-stone-600 ring-1 ring-stone-200">
            Online booking isn&apos;t open right now. Please{" "}
            <Link href="/contact" className="text-sage-700 underline">
              contact Rangika
            </Link>{" "}
            to book.
          </p>
        ) : (
          <BookingFlow services={list} initial={{ service: sp.service, sessions: Number.isFinite(sessions) ? sessions : undefined, mode: sp.mode }} />
        )}
      </div>
    </div>
  );
}
