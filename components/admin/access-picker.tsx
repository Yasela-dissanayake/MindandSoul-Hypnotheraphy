"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { SessionPlanFields, emptySessionPlan, sessionPlanPayload, type SessionChoice, type SessionPlanState } from "./session-plan-fields";

/** The session services (with their packages) people can be given. */
export type PackageOption = SessionChoice;
export type CourseOption = { id: string; title: string };

export type AccessState = {
  sessionsOn: boolean;
  plan: SessionPlanState;
  courseIds: string[];
};

export const emptyAccess = (services: SessionChoice[], serviceId?: string): AccessState => ({
  sessionsOn: false,
  plan: emptySessionPlan(services, serviceId),
  courseIds: [],
});

/** The access payload the server actions expect. */
export function accessPayload(a: AccessState, services: SessionChoice[]) {
  return {
    sessions: a.sessionsOn && a.plan.serviceId ? sessionPlanPayload(a.plan, services) : null,
    courseIds: a.courseIds,
  };
}

/** "What does this person get?": one-to-one sessions and/or classes. */
export function AccessPicker({
  value,
  onChange,
  packages,
  courses,
}: {
  value: AccessState;
  onChange: (v: AccessState) => void;
  packages: SessionChoice[];
  courses: CourseOption[];
}) {
  const set = (patch: Partial<AccessState>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-3">
      <div className={`space-y-3 rounded-xl border p-3 ${value.sessionsOn ? "border-sage-400 bg-sage-50/50" : "border-stone-200"}`}>
        <label className="flex items-center gap-3">
          <Checkbox checked={value.sessionsOn} onCheckedChange={(v) => set({ sessionsOn: v === true })} />
          <span>
            <span className="block font-medium text-stone-800">One-to-one sessions</span>
            <span className="text-xs text-stone-500">Their own session plan for any of your sessions (hypnotherapy, Reiki, Animal Reiki…)</span>
          </span>
        </label>
        {value.sessionsOn && (
          <div className="pl-7">
            <SessionPlanFields value={value.plan} onChange={(plan) => set({ plan })} services={packages} />
          </div>
        )}
      </div>

      <div className={`space-y-2 rounded-xl border p-3 ${value.courseIds.length ? "border-sage-400 bg-sage-50/50" : "border-stone-200"}`}>
        <p className="font-medium text-stone-800">Classes</p>
        {courses.length === 0 && <p className="text-sm text-stone-500">No classes yet.</p>}
        <div className="grid gap-2 sm:grid-cols-2">
          {courses.map((c) => (
            <label key={c.id} className="flex items-center gap-3 text-sm">
              <Checkbox
                checked={value.courseIds.includes(c.id)}
                onCheckedChange={(v) => set({ courseIds: v === true ? [...value.courseIds, c.id] : value.courseIds.filter((x) => x !== c.id) })}
              />
              {c.title}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
