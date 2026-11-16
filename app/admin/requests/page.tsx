import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { loadAccessOptions } from "@/lib/admin-data";
import { describeWants } from "@/lib/access-requests";
import { MODE_LABEL, time12 } from "@/lib/booking";
import { formatDate } from "@/lib/dates";
import { AccessRequestRow } from "@/components/admin/access-request-row";
import { viewerTimezone } from "@/lib/viewer-tz";

export default async function RequestsPage() {
  await requireAdminPage();
  const [tz, pending, decided, { packages, courses }] = await Promise.all([
    viewerTimezone(),
    db.accessRequest.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "desc" } }), // newest first
    db.accessRequest.findMany({ where: { status: { not: "PENDING" } }, orderBy: { decidedAt: "desc" }, take: 20 }),
    loadAccessOptions(),
  ]);

  // Paid bookings from the same email help Rangika recognise the person.
  const bookings = pending.length
    ? await db.booking.findMany({
        where: { status: "CONFIRMED", clientEmail: { in: pending.map((r) => r.email.toLowerCase()) } },
        orderBy: { startsAt: "desc" },
        select: { clientEmail: true, date: true, start: true, service: true, mode: true },
      })
    : [];
  const courseTitle = (id: string | null) => courses.find((c) => c.id === id)?.title ?? null;
  const when = (d: Date) => d.toLocaleString("en-AU", { timeZone: tz, day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

  const row = (r: (typeof pending)[number]) => {
    const b = bookings.find((x) => x.clientEmail === r.email.toLowerCase());
    return {
      id: r.id,
      email: r.email,
      name: r.name,
      image: r.image,
      status: r.status,
      attempts: r.attempts,
      when: when(r.decidedAt ?? r.createdAt),
      wants: r.wants as "SESSIONS" | "COURSE" | "UNSURE" | null,
      wantsService: r.wantsService,
      wantsCourseId: r.wantsCourseId,
      wantsLabel: describeWants(r, courseTitle(r.wantsCourseId)),
      message: r.message,
      phone: r.phone,
      sentForm: Boolean(r.detailsAt),
      booking: b ? `${formatDate(b.date, { weekday: "short", day: "numeric", month: "short" })}, ${time12(b.start)} (Perth) · ${b.service} · ${MODE_LABEL[b.mode]}` : null,
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-stone-800">Access requests</h1>
        <p className="text-stone-500">
          People who signed in with Google but don&apos;t have an account yet. Each request shows what they asked for, so you can approve with one click.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-stone-800">Waiting for you ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="rounded-xl bg-white p-5 text-stone-500 ring-1 ring-stone-200">No requests waiting.</p>
        ) : (
          pending.map((r) => <AccessRequestRow key={r.id} request={row(r)} packages={packages} courses={courses} />)
        )}
      </section>

      {decided.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-stone-800">Recently decided</h2>
          {decided.map((r) => (
            <AccessRequestRow key={r.id} request={row(r)} packages={packages} courses={courses} />
          ))}
        </section>
      )}
    </div>
  );
}
