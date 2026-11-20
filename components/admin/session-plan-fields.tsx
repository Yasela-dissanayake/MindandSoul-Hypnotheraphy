"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Choosing a client's one-to-one sessions from Rangika's session services (Services → Sessions →
// Session services & prices): the session, then the package (or any number of sessions).
// New services and packages appear here by themselves.

export type SessionChoice = {
  id: string;
  title: string;
  planService: "HYPNOTHERAPY" | "REIKI_HEALING" | "ANIMAL_REIKI";
  options: { id: string; title: string; sessions: number }[];
};

export type SessionPlanState = {
  serviceId: string;
  optionId: string; // "" = another number of sessions
  sessions: string;
  title: string;
  startDate: string;
  bookOnline: boolean;
};

const selectCls = "h-10 w-full rounded-md border border-input bg-white px-3 text-sm";

/** A fresh choice: the first session and its first package (usually "Single session"). */
export function emptySessionPlan(services: SessionChoice[], serviceId?: string): SessionPlanState {
  const s = services.find((x) => x.id === serviceId) ?? services[0];
  return { serviceId: s?.id ?? "", optionId: s?.options[0]?.id ?? "", sessions: String(s?.options[0]?.sessions ?? 1), title: "", startDate: "", bookOnline: true };
}

/** What the server actions expect. */
export function sessionPlanPayload(v: SessionPlanState, services: SessionChoice[]) {
  const s = services.find((x) => x.id === v.serviceId);
  const option = s?.options.find((o) => o.id === v.optionId);
  const total = option ? option.sessions : Math.max(1, Math.round(Number(v.sessions) || 1));
  return {
    sessionServiceId: s?.id ?? null,
    service: s?.planService ?? ("HYPNOTHERAPY" as const),
    totalSessions: total,
    title: v.title.trim() || null,
    startDate: v.startDate,
    bookOnline: v.bookOnline,
  };
}

export function SessionPlanFields({
  value,
  onChange,
  services,
  dateHint = "Empty = today",
}: {
  value: SessionPlanState;
  onChange: (v: SessionPlanState) => void;
  services: SessionChoice[];
  dateHint?: string;
}) {
  const set = (patch: Partial<SessionPlanState>) => onChange({ ...value, ...patch });
  const service = services.find((s) => s.id === value.serviceId);

  if (services.length === 0) {
    return <p className="text-sm text-stone-500">No session services yet. Add them under Services → Sessions → Session services &amp; prices.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1">
        <Label>Session</Label>
        <select suppressHydrationWarning
          className={selectCls}
          value={value.serviceId}
          onChange={(e) => {
            const s = services.find((x) => x.id === e.target.value);
            set({ serviceId: e.target.value, optionId: s?.options[0]?.id ?? "", sessions: String(s?.options[0]?.sessions ?? 1) });
          }}
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label>Package</Label>
        <select suppressHydrationWarning className={selectCls} value={value.optionId} onChange={(e) => set({ optionId: e.target.value })}>
          {service?.options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.title} · {o.sessions} session{o.sessions === 1 ? "" : "s"}
            </option>
          ))}
          <option value="">Other number of sessions…</option>
        </select>
      </div>
      {value.optionId === "" && (
        <div className="space-y-1">
          <Label>Number of sessions</Label>
          <Input type="number" min={1} max={100} value={value.sessions} onChange={(e) => set({ sessions: e.target.value })} />
        </div>
      )}
      <div className="space-y-1">
        <Label>Week 1 starts on</Label>
        <Input type="date" value={value.startDate} onChange={(e) => set({ startDate: e.target.value })} />
        {dateHint && <p className="text-xs text-stone-500">{dateHint}</p>}
      </div>
      <div className="space-y-1 sm:col-span-2">
        <Label>Plan title (optional)</Label>
        <Input
          value={value.title}
          maxLength={150}
          onChange={(e) => set({ title: e.target.value })}
          placeholder={service ? `${service.title}: e.g. weight management` : "Session plan"}
        />
        <p className="text-xs text-stone-500">Empty = {service?.title ?? "the session's name"}.</p>
      </div>
      <label className="flex items-start gap-2 text-sm text-stone-700 sm:col-span-2">
        <input suppressHydrationWarning type="checkbox" className="mt-1" checked={value.bookOnline} onChange={(e) => set({ bookOnline: e.target.checked })} />
        <span>
          Let them book these sessions online from their private space
          <span className="block text-xs text-stone-500">Untick if you&apos;ll arrange the session times with them yourself.</span>
        </span>
      </label>
    </div>
  );
}
