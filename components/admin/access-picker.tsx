"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SERVICES, type ServiceId } from "@/lib/catalog";

export type PackageOption = { id: string; title: string; service: ServiceId; totalSessions: number | null };
export type CourseOption = { id: string; title: string };

export type AccessState = {
  sessionsOn: boolean;
  service: ServiceId;
  templateId: string;
  totalSessions: string;
  startDate: string;
  courseIds: string[];
};

export const emptyAccess = (): AccessState => ({
  sessionsOn: false,
  service: "HYPNOTHERAPY",
  templateId: "",
  totalSessions: "6",
  startDate: "",
  courseIds: [],
});

/** The access payload the server actions expect. */
export function accessPayload(a: AccessState) {
  return {
    sessions: a.sessionsOn
      ? {
          service: a.service,
          templateId: a.templateId || null,
          totalSessions: a.templateId ? null : a.totalSessions ? Number(a.totalSessions) : null,
          startDate: a.startDate,
        }
      : null,
    courseIds: a.courseIds,
  };
}

const selectCls = "h-10 w-full rounded-md border border-input bg-white px-3 text-sm";

/** "What does this person get?": one-to-one sessions and/or courses. */
export function AccessPicker({
  value,
  onChange,
  packages,
  courses,
}: {
  value: AccessState;
  onChange: (v: AccessState) => void;
  packages: PackageOption[];
  courses: CourseOption[];
}) {
  const set = (patch: Partial<AccessState>) => onChange({ ...value, ...patch });
  const available = packages.filter((p) => p.service === value.service);

  return (
    <div className="space-y-3">
      <div className={`space-y-3 rounded-xl border p-3 ${value.sessionsOn ? "border-sage-400 bg-sage-50/50" : "border-stone-200"}`}>
        <label className="flex items-center gap-3">
          <Checkbox checked={value.sessionsOn} onCheckedChange={(v) => set({ sessionsOn: v === true })} />
          <span>
            <span className="block font-medium text-stone-800">One-to-one sessions</span>
            <span className="text-xs text-stone-500">Reiki healing, Animal Reiki or Clinical Hypnotherapy on Zoom</span>
          </span>
        </label>
        {value.sessionsOn && (
          <div className="grid gap-3 pl-7 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label>Service</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {SERVICES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => set({ service: s.id, templateId: "" })}
                    className={`rounded-lg border px-2 py-2 text-xs sm:text-sm ${value.service === s.id ? "border-sage-500 bg-white text-sage-800" : "border-stone-200 bg-white text-stone-600"}`}
                  >
                    {s.short}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Start from a ready-made package (optional)</Label>
              <select className={selectCls} value={value.templateId} onChange={(e) => set({ templateId: e.target.value })}>
                <option value="">No, start with an empty plan</option>
                {available.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                    {p.totalSessions ? ` (${p.totalSessions} sessions)` : ""}
                  </option>
                ))}
              </select>
            </div>
            {!value.templateId && (
              <div className="space-y-1">
                <Label>Number of sessions</Label>
                <Input type="number" min={1} value={value.totalSessions} onChange={(e) => set({ totalSessions: e.target.value })} />
              </div>
            )}
            <div className="space-y-1">
              <Label>Week 1 starts</Label>
              <Input type="date" value={value.startDate} onChange={(e) => set({ startDate: e.target.value })} />
              <p className="text-xs text-stone-500">Empty = today</p>
            </div>
          </div>
        )}
      </div>

      <div className={`space-y-2 rounded-xl border p-3 ${value.courseIds.length ? "border-sage-400 bg-sage-50/50" : "border-stone-200"}`}>
        <p className="font-medium text-stone-800">Courses</p>
        {courses.length === 0 && <p className="text-sm text-stone-500">No courses yet.</p>}
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
