import type React from "react";
import { CalendarCheck, Globe, MapPin } from "lucide-react";

type B = { id: string; startsAt: Date; endsAt: Date; mode: "IN_PERSON" | "DISTANCE"; credit: boolean; amount: number; currency: string };

/** On the admin client page: this plan's booked sessions (in the viewer's own time) and how many are left to book. */
export function PlanBookingsAdmin({ bookings, left, tz, online, book }: { bookings: B[]; left: number; tz: string; online: boolean; book?: React.ReactNode }) {
  if (!bookings.length && !left) return null;
  const now = new Date();
  const when = (d: Date) => d.toLocaleString("en-AU", { timeZone: tz, weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
  return (
    <div className="space-y-2 rounded-xl bg-sage-50 p-4 text-sm ring-1 ring-sage-200">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-medium text-stone-800">
          <CalendarCheck className="h-4 w-4 text-sage-700" /> Booked sessions ({bookings.length})
        </p>
        {left > 0 && (
          <span className="text-sage-800">
            {left} left to book{online ? " (the client can book them from their portal, or you can book one for them)" : ""}
          </span>
        )}
      </div>
      {bookings.length > 0 && (
        <ul className="divide-y divide-sage-200/60">
          {bookings.map((b) => (
            <li key={b.id} className={`flex flex-wrap items-center gap-x-3 gap-y-1 py-1.5 ${b.endsAt < now ? "text-stone-500" : "text-stone-800"}`}>
              <span className="font-medium">{when(b.startsAt)}</span>
              <span className="inline-flex items-center gap-1 text-stone-500">
                {b.mode === "IN_PERSON" ? <MapPin className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                {b.mode === "IN_PERSON" ? "In person" : "Online"}
              </span>
              <span className="text-xs text-stone-500">{b.credit ? "from package" : `paid ${b.currency.toUpperCase()} ${(b.amount / 100).toLocaleString("en-AU")}`}</span>
              {b.endsAt < now && <span className="text-xs text-stone-400">done</span>}
            </li>
          ))}
        </ul>
      )}
      {left > 0 && book}
    </div>
  );
}
