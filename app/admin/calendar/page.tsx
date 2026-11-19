import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { BOOKING_TZ, MODE_LABEL, blocksOn, busyWhere, daySlots, loadCalendar, time12 } from "@/lib/booking";
import { addDays, formatDate, todayIn } from "@/lib/dates";
import { CalendarBlocker, CancelBookingButton, type DayInfo } from "@/components/admin/calendar-blocker";

const longDay = (d: string) => formatDate(d, { weekday: "long", day: "numeric", month: "long" });

export default async function CalendarPage() {
  await requireAdminPage();
  const today = todayIn(BOOKING_TZ);
  const lastDay = addDays(today, (await getSettings()).bookingDaysAhead);

  const [data, bookings] = await Promise.all([
    loadCalendar(today, lastDay),
    db.booking.findMany({ where: { date: { gte: today }, ...busyWhere() }, orderBy: [{ date: "asc" }, { start: "asc" }], take: 300 }),
  ]);
  const confirmed = bookings.filter((b) => b.status === "CONFIRMED");

  // For every day: its session times, what's blocked, and who's booked.
  const days: Record<string, DayInfo> = {};
  for (let d = today; d <= lastDay; d = addDays(d, 1)) {
    const slots = [
      ...daySlots(data, "IN_PERSON", d).map((x) => ({ ...x, mode: "IN_PERSON" as const })),
      ...daySlots(data, "DISTANCE", d).map((x) => ({ ...x, mode: "DISTANCE" as const })),
    ];
    const blocks = blocksOn(data, d);
    days[d] = {
      slots,
      allDay: blocks.some((b) => !b.start),
      blocked: blocks.filter((b) => b.start && b.end).map((b) => ({ start: b.start!, end: b.end!, mode: b.mode ?? null })),
      booked: confirmed.filter((b) => b.date === d).map((b) => ({ start: b.start, end: b.end, name: b.clientName })),
    };
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-stone-800">Calendar</h1>
        <p className="text-stone-500">
          Pick a day, tap the session times you&apos;re not available, and save. People can&apos;t book those times on the website. All times
          are Perth time.
        </p>
      </div>

      <CalendarBlocker today={today} lastDay={lastDay} days={days} />

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-stone-800">Upcoming bookings</h2>
        {confirmed.length === 0 ? (
          <p className="rounded-xl bg-white p-5 text-stone-500 ring-1 ring-stone-200">No bookings yet.</p>
        ) : (
          <div className="divide-y divide-stone-100 rounded-2xl bg-white ring-1 ring-stone-200">
            {confirmed.map((b) => (
              <div key={b.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-stone-800">
                    {longDay(b.date)} · {time12(b.start)} – {time12(b.end)}
                  </p>
                  <p className="text-sm text-stone-600">
                    {b.clientName} · {b.service} · {MODE_LABEL[b.mode]}
                  </p>
                  <p className="truncate text-xs text-stone-500">
                    <a className="hover:underline" href={`mailto:${b.clientEmail}`}>
                      {b.clientEmail}
                    </a>
                    {b.clientPhone && (
                      <>
                        {" · "}
                        <a className="hover:underline" href={`tel:${b.clientPhone}`}>
                          {b.clientPhone}
                        </a>
                      </>
                    )}
                  </p>
                </div>
                <CancelBookingButton id={b.id} name={b.clientName} when={`${formatDate(b.date, { day: "numeric", month: "short" })} at ${time12(b.start)}`} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
