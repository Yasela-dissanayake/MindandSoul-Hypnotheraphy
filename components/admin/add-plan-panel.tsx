"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPlan } from "@/app/admin/_actions/plans";
import { SessionPlanFields, emptySessionPlan, sessionPlanPayload, type SessionChoice } from "./session-plan-fields";
import { useAction } from "./use-action";

/**
 * Give a client a session plan for one of Rangika's sessions (Session services & prices):
 * choose the session and the package; new sessions and packages show up here by themselves.
 */
export function AddPlanPanel({
  clientId,
  packages,
  defaultStart,
  hasPlans,
  startOpen = false,
}: {
  clientId: string;
  packages: SessionChoice[];
  defaultStart: string;
  hasPlans: boolean;
  startOpen?: boolean;
}) {
  const [open, setOpen] = useState(!hasPlans || startOpen);
  const [plan, setPlan] = useState(() => ({ ...emptySessionPlan(packages), startDate: defaultStart }));
  const { pending, run } = useAction();

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Add another session plan
      </Button>
    );
  }

  const submit = () => {
    const p = sessionPlanPayload(plan, packages);
    const service = packages.find((s) => s.id === p.sessionServiceId);
    run(
      () =>
        createPlan({
          userId: clientId,
          title: p.title ?? service?.title ?? "Session plan",
          service: p.service,
          totalSessions: p.totalSessions,
          currentSession: 1,
          startDate: p.startDate || defaultStart,
          sessionServiceId: p.sessionServiceId,
          bookOnline: p.bookOnline,
        }),
      "Session plan added",
      (r) => r.ok && (setOpen(false), setPlan({ ...emptySessionPlan(packages), startDate: defaultStart })),
    );
  };

  return (
    <section className="space-y-4 rounded-2xl border-2 border-dashed border-sage-200 bg-white p-5">
      <div>
        <h2 className="font-serif text-xl text-stone-800">Add a session plan</h2>
        <p className="text-sm text-stone-500">
          Choose the session and package they&apos;re having. You can then add their weeks, material, exercises and trackers below.
        </p>
      </div>
      <SessionPlanFields value={plan} onChange={setPlan} services={packages} dateHint="" />
      <div className="flex gap-2">
        <Button className="bg-sage-600 hover:bg-sage-700" disabled={pending || !plan.serviceId} onClick={submit}>
          {pending ? "Adding…" : "Add session plan"}
        </Button>
        {hasPlans && (
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        )}
      </div>
    </section>
  );
}
