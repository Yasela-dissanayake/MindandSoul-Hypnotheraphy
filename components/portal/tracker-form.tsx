"use client";

import { useBusyTransition } from "@/components/use-busy-transition";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TrackerField } from "@/lib/catalog";
import { saveTrackerEntry } from "@/app/portal/actions";
import { cn } from "@/lib/utils";

type Values = Record<string, string | number | boolean | null>;

export function TrackerForm({
  trackerId,
  date,
  dateLabel,
  fields,
  initial,
}: {
  trackerId: string;
  date: string;
  dateLabel: string;
  fields: TrackerField[];
  initial: Values;
}) {
  const [values, setValues] = useState<Values>(initial);
  const [pending, start] = useBusyTransition();
  const set = (id: string, v: string | number | boolean | null) => setValues((x) => ({ ...x, [id]: v }));
  const editing = Object.keys(initial).length > 0;

  return (
    <section className="space-y-5 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
      <h2 className="font-serif text-xl text-stone-800">Your answers for {dateLabel}</h2>
      {fields.map((f) => (
        <div key={f.id} className="space-y-2">
          <Label className="text-base text-stone-800">
            {f.label}
            {f.unit ? <span className="ml-1 text-sm font-normal text-stone-500">({f.unit})</span> : null}
          </Label>
          {f.type === "number" && (
            <Input
              type="number"
              inputMode="decimal"
              step="any"
              value={values[f.id] == null ? "" : String(values[f.id])}
              onChange={(e) => set(f.id, e.target.value === "" ? null : e.target.value)}
              className="h-12 max-w-[12rem] text-lg"
            />
          )}
          {f.type === "scale" && (
            <div>
              <div className="grid grid-cols-11 gap-1">
                {Array.from({ length: 11 }, (_, n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => set(f.id, n)}
                    className={cn(
                      "h-11 rounded-lg text-sm font-medium ring-1 transition",
                      values[f.id] != null && values[f.id] !== "" && Number(values[f.id]) === n
                        ? "bg-sage-600 text-white ring-sage-600"
                        : "bg-white text-stone-700 ring-stone-200 hover:ring-sage-300",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="mt-1 flex justify-between text-xs text-stone-500">
                <span>0 = none</span>
                <span>10 = very strong</span>
              </div>
            </div>
          )}
          {f.type === "yesno" && (
            <div className="grid max-w-xs grid-cols-2 gap-2">
              {(
                [
                  [true, "Yes"],
                  [false, "No"],
                ] as const
              ).map(([v, l]) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => set(f.id, v)}
                  className={cn(
                    "h-11 rounded-lg text-sm font-medium ring-1",
                    values[f.id] === v ? "bg-sage-600 text-white ring-sage-600" : "bg-white text-stone-700 ring-stone-200",
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
          {f.type === "time" && (
            <Input
              type="time"
              value={values[f.id] == null ? "" : String(values[f.id])}
              onChange={(e) => set(f.id, e.target.value === "" ? null : e.target.value)}
              className="h-12 max-w-[12rem] text-lg"
            />
          )}
          {f.type === "text" && (
            <Textarea value={values[f.id] == null ? "" : String(values[f.id])} onChange={(e) => set(f.id, e.target.value)} className="min-h-[80px] text-base" />
          )}
        </div>
      ))}
      <Button
        disabled={pending}
        className="h-12 w-full bg-sage-600 text-base hover:bg-sage-700"
        onClick={() =>
          start(async () => {
            const res = await saveTrackerEntry(trackerId, values, date);
            if (!res.ok) toast.error(res.error);
            else toast.success(editing ? "Updated" : "Saved. Well done 🌿");
          })
        }
      >
        {pending ? "Saving…" : editing ? "Update answers" : "Save answers"}
      </Button>
    </section>
  );
}
