"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { assignTemplate, createPlan } from "@/app/admin/_actions/plans";
import { SERVICES, serviceLabel, type ServiceId } from "@/lib/catalog";
import { useAction } from "./use-action";

type Package = { id: string; title: string; service: ServiceId; totalSessions: number | null };
const selectCls = "h-10 w-full rounded-md border border-input bg-white px-3 text-sm";

/** Give a client a session plan: from a ready-made package, or a blank one. */
export function AddPlanPanel({
  clientId,
  packages,
  defaultStart,
  hasPlans,
  startOpen = false,
}: {
  clientId: string;
  packages: Package[];
  defaultStart: string;
  hasPlans: boolean;
  startOpen?: boolean;
}) {
  const [open, setOpen] = useState(!hasPlans || startOpen);
  const [service, setService] = useState<ServiceId>("HYPNOTHERAPY");
  const available = packages.filter((p) => p.service === service);
  const [templateId, setTemplateId] = useState("");
  const [startDate, setStartDate] = useState(defaultStart);
  const [title, setTitle] = useState("");
  const [sessions, setSessions] = useState("6");
  const { pending, run } = useAction();

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Add another session plan
      </Button>
    );
  }

  const submit = () =>
    run(
      () =>
        templateId
          ? assignTemplate(clientId, templateId, startDate)
          : createPlan({
              userId: clientId,
              title: title.trim() || serviceLabel(service),
              service,
              totalSessions: sessions ? Number(sessions) : null,
              currentSession: 1,
              startDate,
            }),
      "Session plan added",
      (r) => r.ok && (setOpen(false), setTitle(""), setTemplateId("")),
    );

  return (
    <section className="space-y-4 rounded-2xl border-2 border-dashed border-sage-200 bg-white p-5">
      <h2 className="font-serif text-xl text-stone-800">Add a session plan</h2>
      <div className="grid grid-cols-3 gap-2">
        {SERVICES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => (setService(s.id), setTemplateId(""))}
            className={`rounded-lg border px-2 py-2.5 text-sm ${service === s.id ? "border-sage-500 bg-sage-50 text-sage-800" : "border-stone-200 text-stone-600"}`}
          >
            {s.short}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <Label>Start from a ready-made package</Label>
        <select className={selectCls} value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
          <option value="">No, start with an empty plan</option>
          {available.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
              {p.totalSessions ? ` (${p.totalSessions} sessions)` : ""}
            </option>
          ))}
        </select>
        {templateId && <p className="text-xs text-stone-500">Everything is copied. You can then change it just for this client.</p>}
      </div>
      {!templateId && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`e.g. ${serviceLabel(service)}: weight loss`} />
          </div>
          <div className="space-y-2">
            <Label>Number of sessions</Label>
            <Input type="number" min={1} value={sessions} onChange={(e) => setSessions(e.target.value)} />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Label>Week 1 starts on</Label>
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="sm:w-56" />
      </div>
      <div className="flex gap-2">
        <Button className="bg-sage-600 hover:bg-sage-700" disabled={pending} onClick={submit}>
          {pending ? "Adding…" : "Add"}
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
