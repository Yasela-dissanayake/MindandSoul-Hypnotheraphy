"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SlotPicker } from "@/components/booking/slot-picker";
import { bookPackageSession } from "@/app/portal/session-booking-actions";
import { cn } from "@/lib/utils";

type Mode = "IN_PERSON" | "DISTANCE";
type Slot = { start: string; end: string; startsAt: string; endsAt: string };

/** Pick in person / online and a time, then book one of the sessions left in the package. */
export function BookPackageSession({ planId, serviceSlug, modes, left }: { planId: string; serviceSlug: string; modes: Mode[]; left: number }) {
  const [mode, setMode] = useState<Mode | null>(modes.length === 1 ? modes[0] : null);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [reload, setReload] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Slot | null>(null);
  const [pending, start] = useTransition();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Australia/Perth";
  const fmt = (s: Slot) =>
    `${new Date(s.startsAt).toLocaleDateString("en-AU", { timeZone: tz, weekday: "long", day: "numeric", month: "long" })}, ${new Date(s.startsAt).toLocaleTimeString("en-AU", {
      timeZone: tz,
      hour: "numeric",
      minute: "2-digit",
    })}`;

  if (done) {
    return (
      <div className="space-y-3 rounded-2xl bg-sage-50 p-6 ring-1 ring-sage-200">
        <p className="flex items-center gap-2 font-serif text-xl text-stone-800">
          <CheckCircle2 className="h-6 w-6 text-sage-600" /> Your session is booked
        </p>
        <p className="text-stone-700">{fmt(done)}. We&apos;ve emailed you the details.</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="bg-sage-600 text-white hover:bg-sage-700">
            <Link href="/portal/sessions">Back to My sessions</Link>
          </Button>
          {left > 1 && (
            <Button variant="outline" onClick={() => (setDone(null), setSlot(null), setReload((x) => x + 1))}>
              Book another session
            </Button>
          )}
        </div>
      </div>
    );
  }

  const book = () => {
    if (!mode || !slot || !date) return;
    setError(null);
    start(async () => {
      const r = await bookPackageSession({ planId, mode, date, start: slot.start, timezone: tz });
      if (r.ok) setDone(slot);
      else {
        setError(r.error);
        if (r.slotTaken) {
          setSlot(null);
          setReload((x) => x + 1);
        }
      }
    });
  };

  return (
    <div className="space-y-5">
      {modes.length > 1 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-stone-700">In person or online?</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {modes.map((m) => (
              <button suppressHydrationWarning
                key={m}
                type="button"
                onClick={() => (setMode(m), setSlot(null), setDate(null))}
                aria-pressed={mode === m}
                className={cn("flex items-center gap-2 rounded-xl p-3 text-left ring-1", mode === m ? "bg-sage-50 ring-2 ring-sage-500" : "ring-stone-200 hover:ring-sage-300")}
              >
                {m === "IN_PERSON" ? <MapPin className="h-4 w-4 text-sage-600" /> : <Globe className="h-4 w-4 text-sage-600" />}
                <span className="font-medium text-stone-800">{m === "IN_PERSON" ? "In person (Perth)" : "Online / distance"}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {mode && <SlotPicker serviceSlug={serviceSlug} mode={mode} date={date} slot={slot} onDate={setDate} onSlot={setSlot} reloadKey={reload} />}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800 ring-1 ring-red-200">{error}</p>}
      {slot && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-stone-200">
          <span className="flex-1 text-stone-700">{fmt(slot)}</span>
          <Button disabled={pending} onClick={book} className="bg-sage-600 text-white hover:bg-sage-700">
            {pending ? "Booking…" : "Book this session"}
          </Button>
        </div>
      )}
    </div>
  );
}
