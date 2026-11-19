import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireClientPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { modesFor } from "@/lib/session-catalog";
import { BookPackageSession } from "@/components/portal/book-package-session";

// Booking one of the sessions left in a package the client bought (no payment).
export default async function BookPackageSessionPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const user = await requireClientPage();
  const { plan: planId } = await searchParams;
  if (!planId) notFound();
  const plan = await db.plan.findFirst({
    where: { id: planId, userId: user.id, completedAt: null },
    include: { sessionService: true, _count: { select: { bookings: { where: { status: "CONFIRMED" } } } } },
  });
  if (!plan?.sessionService) notFound();
  const left = Math.max(0, (plan.totalSessions ?? 0) - plan._count.bookings);
  const s = plan.sessionService;

  return (
    <div className="space-y-6">
      <Link href="/portal/sessions" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft className="h-4 w-4" /> My sessions
      </Link>
      <div className="space-y-1">
        <h1 className="font-serif text-3xl text-stone-800">Book your next session</h1>
        <p className="text-stone-600">
          {plan.title}
          {s.lengthLabel ? ` · ${s.lengthLabel}` : ""} · {left} session{left === 1 ? "" : "s"} left in your package. Already paid, so there&apos;s nothing to pay.
        </p>
      </div>
      {left === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-stone-600 ring-1 ring-stone-200">
          You&apos;ve booked all the sessions in your package. To book more, choose a session or package on the{" "}
          <Link href={`/booking?service=${s.slug}`} className="text-sage-700 underline">
            booking page
          </Link>
          .
        </p>
      ) : !s.published || s.enquiryOnly ? (
        <p className="rounded-2xl bg-white p-6 text-stone-600 ring-1 ring-stone-200">Online booking isn&apos;t available for this session right now. Rangika will arrange it with you.</p>
      ) : (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
          <BookPackageSession planId={plan.id} serviceSlug={s.slug} modes={modesFor(s)} left={left} />
        </div>
      )}
    </div>
  );
}
