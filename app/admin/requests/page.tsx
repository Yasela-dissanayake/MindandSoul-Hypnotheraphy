import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { loadAccessOptions } from "@/lib/admin-data";
import { AccessRequestRow } from "@/components/admin/access-request-row";

export default async function RequestsPage() {
  await requireAdminPage();
  const [pending, decided, { packages, courses }, settings] = await Promise.all([
    db.accessRequest.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" } }),
    db.accessRequest.findMany({ where: { status: { not: "PENDING" } }, orderBy: { decidedAt: "desc" }, take: 20 }),
    loadAccessOptions(),
    getSettings(),
  ]);
  const when = (d: Date) => d.toLocaleString("en-AU", { timeZone: settings.adminTimezone, day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  const row = (r: (typeof pending)[number]) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    image: r.image,
    status: r.status,
    attempts: r.attempts,
    when: when(r.decidedAt ?? r.createdAt),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-stone-800">Access requests</h1>
        <p className="text-stone-500">
          People who signed in with Google but don&apos;t have an account yet. They can&apos;t see anything until you approve them.
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
