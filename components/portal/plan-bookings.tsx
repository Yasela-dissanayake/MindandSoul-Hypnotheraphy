import Link from "next/link";
import { CalendarCheck, CalendarPlus, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

type B = { id: string; startsAt: Date; endsAt: Date; mode: "IN_PERSON" | "DISTANCE" };

/**
 * On a client's session plan: their booked sessions and, for a package, how many are left to book
 * with a "Book your next session" button (no payment: the package is already paid).
 */
export function PlanBookings({
  planId,
  timezone,
  upcoming,
  pastCount,
  left,
  canBook,
}: {
  planId: string;
  timezone: string;
  upcoming: B[];
  pastCount: number;
  left: number;
  canBook: boolean;
}) {
  if (!upcoming.length && !pastCount && !left) return null;
  const when = (b: B) =>
    `${b.startsAt.toLocaleDateString("en-AU", { timeZone: timezone, weekday: "long", day: "numeric", month: "long" })}, ${b.startsAt.toLocaleTimeString("en-AU", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
    })} – ${b.endsAt.toLocaleTimeString("en-AU", { timeZone: timezone, hour: "numeric", minute: "2-digit" })}`;

  return (
    <div className="space-y-3 rounded-xl bg-sage-50 p-4 ring-1 ring-sage-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-medium text-stone-800">
          <CalendarCheck className="h-4 w-4 text-sage-700" /> Your bookings
        </p>
        {left > 0 && (
          <span className="text-sm text-sage-800">
            {left} session{left === 1 ? "" : "s"} left to book
          </span>
        )}
      </div>
      {upcoming.length > 0 ? (
        <ul className="space-y-1.5 text-sm text-stone-700">
          {upcoming.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-medium">{when(b)}</span>
              <span className="inline-flex items-center gap-1 text-stone-500">
                {b.mode === "IN_PERSON" ? <MapPin className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                {b.mode === "IN_PERSON" ? "In person" : "Online"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-stone-500">No upcoming sessions booked.</p>
      )}
      {pastCount > 0 && <p className="text-xs text-stone-500">{pastCount} session{pastCount === 1 ? "" : "s"} already done.</p>}
      {left > 0 && canBook && (
        <Button asChild className="bg-sage-600 text-white hover:bg-sage-700">
          <Link href={`/portal/sessions/book?plan=${planId}`}>
            <CalendarPlus className="mr-2 h-4 w-4" /> Book your next session
          </Link>
        </Button>
      )}
      {left > 0 && !canBook && <p className="text-xs text-stone-500">Rangika will arrange your remaining sessions with you.</p>}
      <p className="text-xs text-stone-500">Need to change a time? Send Rangika a message or reply to your booking email.</p>
    </div>
  );
}
