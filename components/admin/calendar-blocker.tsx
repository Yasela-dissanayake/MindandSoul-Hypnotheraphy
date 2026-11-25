"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Ban, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cancelBooking, saveDayBlocks } from "@/app/admin/_actions/calendar";
import { useAction } from "./use-action";
import { cn } from "@/lib/utils";

type Range = { start: string; end: string };
type Mode = "IN_PERSON" | "DISTANCE";
/** A blocked time for one kind of session. */
type Block = Range & { mode: Mode };

export type DayInfo = {
  slots: (Range & { mode: Mode })[]; // her session times this day (empty = she doesn't work)
  allDay: boolean;
  blocked: (Range & { mode: Mode | null })[]; // mode null = an older block that covers both kinds
  booked: (Range & { name: string })[];
};

const GROUPS: { mode: Mode; label: string }[] = [
  { mode: "IN_PERSON", label: "In-person sessions" },
  { mode: "DISTANCE", label: "Distance / online sessions" },
];
const GROUP_MODES: Mode[] = GROUPS.map((g) => g.mode);

const toKey = (d: Date) => format(d, "yyyy-MM-dd");
const fromKey = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const min = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const t12 = (t: string) => {
  const h = Math.floor(min(t) / 60);
  const m = min(t) % 60;
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
};
const overlaps = (a: Range, b: Range) => min(a.start) < min(b.end) && min(b.start) < min(a.end);
const key = (r: Block[]) => JSON.stringify([...r].sort((a, b) => a.mode.localeCompare(b.mode) || a.start.localeCompare(b.start)));
/** Older blocks covered both kinds of session: show them as one block of each kind. */
const asBlocks = (r: DayInfo["blocked"]): Block[] =>
  r.flatMap((b) => (b.mode ? [{ start: b.start, end: b.end, mode: b.mode }] : (GROUP_MODES.map((mode) => ({ start: b.start, end: b.end, mode })) as Block[])));

export function CalendarBlocker({ today, lastDay, days }: { today: string; lastDay: string; days: Record<string, DayInfo> }) {
  const [selected, setSelected] = useState(today);
  const day = days[selected];
  const [allDay, setAllDay] = useState(false);
  const [blocked, setBlocked] = useState<Block[]>([]);
  const { pending, run } = useAction();

  // Load the saved blocks whenever another day is picked (or after saving).
  useEffect(() => {
    setAllDay(day?.allDay ?? false);
    setBlocked(asBlocks(day?.blocked ?? []));
  }, [selected, day]);

  const changed = !!day && (allDay !== day.allDay || key(blocked) !== key(asBlocks(day.blocked)));

  const marks = useMemo(() => {
    const allDayOff: Date[] = [];
    const partly: Date[] = [];
    const booked: Date[] = [];
    const closed: Date[] = [];
    for (const [k, d] of Object.entries(days)) {
      if (!d.slots.length) closed.push(fromKey(k));
      else if (d.allDay) allDayOff.push(fromKey(k));
      else if (d.blocked.length) partly.push(fromKey(k));
      if (d.booked.length) booked.push(fromKey(k));
    }
    return { allDayOff, partly, booked, closed };
  }, [days]);

  // A session is blocked when a blocked time of the SAME kind touches it (an in-person block never
  // hides an online session, and the other way round). Tapping a blocked session frees it;
  // tapping a free one blocks exactly that session.
  const isBlocked = (s: Range & { mode: Mode }) => blocked.some((b) => b.mode === s.mode && overlaps(b, s));
  const toggle = (s: Range & { mode: Mode }) =>
    setBlocked(isBlocked(s) ? blocked.filter((b) => !(b.mode === s.mode && overlaps(b, s))) : [...blocked, { start: s.start, end: s.end, mode: s.mode }]);
  const bookedIn = (s: Range) => day?.booked.find((b) => overlaps(b, s));
  const blockedCount = day ? day.slots.filter((s) => isBlocked(s)).length : 0;

  const save = () =>
    run(
      () => saveDayBlocks({ date: selected, allDay, ranges: allDay ? [] : blocked }),
      undefined,
      (r) => {
        if (!r.ok) return;
        const clashes = (r.data as { clashes?: number } | undefined)?.clashes ?? 0;
        if (clashes > 0) {
          toast.warning(
            `Saved. ${clashes} booking${clashes === 1 ? " is" : "s are"} already in that time and ${clashes === 1 ? "is" : "are"} not cancelled. Please contact ${clashes === 1 ? "that person" : "them"}.`,
            { duration: 10000 },
          );
        } else toast.success("Saved. People can't book the blocked sessions.");
      },
    );

  return (
    <div className="grid gap-6 rounded-2xl bg-white p-4 ring-1 ring-stone-200 sm:p-6 lg:grid-cols-[auto_1fr]">
      {/* Calendar */}
      <div className="space-y-3">
        <Calendar
          mode="single"
          required
          selected={fromKey(selected)}
          onSelect={(d) => d && setSelected(toKey(d))}
          disabled={{ before: fromKey(today), after: fromKey(lastDay) }}
          startMonth={fromKey(today)}
          endMonth={fromKey(lastDay)}
          showOutsideDays={false}
          modifiers={marks}
          modifiersClassNames={{
            allDayOff: "[&_button]:bg-red-100 [&_button]:text-red-800",
            partly: "[&_button]:bg-amber-100 [&_button]:text-amber-900",
            booked: "[&_button]:font-bold [&_button]:underline",
            closed: "[&_button]:text-stone-300",
          }}
          className="mx-auto rounded-xl ring-1 ring-stone-100"
        />
        <ul className="space-y-1 text-xs text-stone-500">
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-red-100 ring-1 ring-red-200" /> Whole day blocked
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-amber-100 ring-1 ring-amber-200" /> Some sessions blocked
          </li>
          <li className="flex items-center gap-2">
            <span className="font-bold underline">14</span> Has a booking
          </li>
        </ul>
      </div>

      {/* The chosen day */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl text-stone-800">{format(fromKey(selected), "EEEE, d MMMM")}</h2>

        {!day || !day.slots.length ? (
          <p className="rounded-xl bg-stone-50 p-4 text-stone-500">You don&apos;t take bookings on this day, so there is nothing to block.</p>
        ) : (
          <>
            <button suppressHydrationWarning
              type="button"
              onClick={() => setAllDay(!allDay)}
              aria-pressed={allDay}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left ring-1 transition",
                allDay ? "bg-red-50 text-red-900 ring-red-300" : "bg-white text-stone-700 ring-stone-200 hover:bg-stone-50",
              )}
            >
              <span className="font-medium">Block the whole day</span>
              <span className={cn("flex h-6 w-11 items-center rounded-full p-0.5 transition", allDay ? "justify-end bg-red-500" : "justify-start bg-stone-300")} aria-hidden>
                <span className="h-5 w-5 rounded-full bg-white shadow" />
              </span>
            </button>

            {!allDay && (
              <div className="space-y-4">
                <p className="text-sm text-stone-500">Tap the sessions you want to block. Tap again to make them available.</p>
                {GROUPS.map((g) => {
                  const slots = day.slots.filter((s) => s.mode === g.mode);
                  if (!slots.length) return null;
                  return (
                    <div key={g.mode} className="space-y-2">
                      <p className="text-sm font-medium text-stone-700">{g.label}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {slots.map((s) => {
                          const b = bookedIn(s);
                          const off = isBlocked(s);
                          return (
                            <button suppressHydrationWarning
                              key={s.start}
                              type="button"
                              disabled={!!b}
                              onClick={() => toggle(s)}
                              aria-pressed={off}
                              className={cn(
                                "flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm ring-1 transition",
                                b
                                  ? "cursor-default bg-sage-50 text-sage-900 ring-sage-200"
                                  : off
                                    ? "bg-red-50 text-red-900 ring-red-300"
                                    : "bg-white text-stone-700 ring-stone-200 hover:bg-stone-50",
                              )}
                            >
                              <span className="font-medium">
                                {t12(s.start)} – {t12(s.end)}
                              </span>
                              {b ? (
                                <span className="truncate text-xs">Booked: {b.name}</span>
                              ) : off ? (
                                <span className="flex shrink-0 items-center gap-1 text-xs">
                                  <Ban className="h-3.5 w-3.5" /> Blocked
                                </span>
                              ) : (
                                <span className="flex shrink-0 items-center gap-1 text-xs text-stone-400">
                                  <Check className="h-3.5 w-3.5" /> Available
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-stone-500">
                  Blocking an in-person time doesn&apos;t affect online sessions, and the other way round. A booked session always takes that time for
                  both kinds, as you can&apos;t be in two sessions at once.
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 border-t border-stone-100 pt-4">
              <Button onClick={save} disabled={pending || !changed} className="bg-sage-600 hover:bg-sage-700">
                {pending ? "Saving…" : "Save"}
              </Button>
              {!allDay && blockedCount > 0 && (
                <span className="text-sm text-stone-500">
                  {blockedCount} session{blockedCount === 1 ? "" : "s"} blocked
                </span>
              )}
              {changed && !pending && <span className="text-sm text-amber-700">Not saved yet</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function CancelBookingButton({ id, name, when }: { id: string; name: string; when: string }) {
  const { pending, run } = useAction();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      className="h-8 text-stone-500 hover:text-red-700"
      onClick={() => {
        if (
          confirm(
            `Cancel ${name}'s booking on ${when}?\n\nThe time becomes free for others, and ${name} gets an email saying the session is cancelled. If it was part of a package, the session goes back to them so they can book a new time.\n\nThis does not refund a payment: do that in Stripe if needed.`,
          )
        )
          run(
            () => cancelBooking(id),
            undefined,
            (r) => {
              if (!r.ok) return;
              const emailed = (r as { data?: { emailed: boolean } }).data?.emailed;
              if (emailed) toast.success(`Booking cancelled. ${name} has been emailed.`);
              else toast.warning(`Booking cancelled, but the email to ${name} couldn't be sent. Please let them know.`);
            },
          );
      }}
    >
      <Trash2 className="mr-1 h-4 w-4" /> Cancel
    </Button>
  );
}
