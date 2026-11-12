import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireClientPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { addDays, formatDate, todayIn } from "@/lib/dates";
import { parseTrackerFields } from "@/lib/catalog";
import { TrackerForm } from "@/components/portal/tracker-form";
import { TrackerHistory } from "@/components/trackers/tracker-history";
import { AskQuestion } from "@/components/portal/ask-question";

export default async function TrackerPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ date?: string }> }) {
  const user = await requireClientPage();
  const { id } = await params;
  const sp = await searchParams;
  const tracker = await db.tracker.findFirst({ where: { id, plan: { userId: user.id } }, include: { plan: { select: { title: true } } } });
  if (!tracker) notFound();

  const today = todayIn(user.timezone);
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, -i));
  const date = sp.date && days.includes(sp.date) ? sp.date : today;
  const fields = parseTrackerFields(tracker.fields);
  const entries = await db.trackerEntry.findMany({ where: { trackerId: id }, orderBy: { forDate: "desc" }, take: 60 });
  const current = entries.find((e) => e.forDate === date);
  const filled = new Set(entries.map((e) => e.forDate));

  return (
    <div className="space-y-6">
      <Link href="/portal/sessions" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft className="h-4 w-4" /> My sessions
      </Link>
      <div>
        <p className="text-sm text-stone-500">{tracker.plan.title}</p>
        <h1 className="font-serif text-3xl text-stone-800">{tracker.title}</h1>
        {tracker.description && <p className="mt-1 text-stone-600">{tracker.description}</p>}
      </div>

      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex w-max gap-2">
          {days.map((d) => (
            <Link
              key={d}
              href={`/portal/trackers/${id}${d === today ? "" : `?date=${d}`}`}
              className={`rounded-xl px-3 py-2 text-center text-sm ring-1 ${d === date ? "bg-sage-600 text-white ring-sage-600" : "bg-white text-stone-700 ring-stone-200"}`}
            >
              <span className="block text-xs opacity-80">{d === today ? "Today" : formatDate(d, { weekday: "short" })}</span>
              <span className="block font-medium">{formatDate(d, { day: "numeric" })}</span>
              <span className={`mx-auto mt-1 block h-1.5 w-1.5 rounded-full ${filled.has(d) ? (d === date ? "bg-white" : "bg-sage-500") : "bg-transparent"}`} />
            </Link>
          ))}
        </div>
      </div>

      <TrackerForm
        key={date}
        trackerId={id}
        date={date}
        dateLabel={date === today ? "today" : formatDate(date, { weekday: "long", day: "numeric", month: "long" })}
        fields={fields}
        initial={(current?.values as Record<string, string | number | boolean | null> | undefined) ?? {}}
      />

      <AskQuestion topic={tracker.title} topicHref={`/portal/trackers/${id}`} planId={tracker.planId} label="Not sure how to fill this in? Ask Rangika" />

      {entries.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-stone-800">Your progress</h2>
          <TrackerHistory fields={fields} entries={entries.map((e) => ({ date: e.forDate, values: e.values as Record<string, unknown> }))} />
        </section>
      )}
    </div>
  );
}
