"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { navigateTo } from "@/components/navigation-progress";
import { ArrowDown, ArrowUp, Pause, Pencil, Play, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { EditorPlan, LibraryOption } from "@/lib/admin-plans";
import { dateOfDay, formatDate } from "@/lib/dates";
import { FIELD_TYPE_LABEL, KIND_LABEL, SERVICES, TRACKER_EXAMPLES, serviceLabel, type TrackerField, type TrackerFieldType } from "@/lib/catalog";
import {
  addPlanItems,
  deleteModule,
  deletePlan,
  deletePrompt,
  deleteTask,
  deleteTracker,
  moveModule,
  movePlanItem,
  removePlanItem,
  saveModule,
  savePrompt,
  saveTask,
  saveTracker,
  setPlanCompleted,
  setTaskPaused,
  setTrackerActive,
  updatePlan,
  updatePlanItem,
} from "@/app/admin/_actions/plans";
import { useAction } from "./use-action";
import { ConfirmButton } from "./confirm-button";
import { KIND_ICON, LibraryPicker } from "./library-picker";

const selectCls = "h-10 w-full rounded-md border border-input bg-white px-3 text-sm";

export function Section({ title, hint, children, action }: { title: string; hint?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="space-y-3 border-t border-stone-100 pt-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-stone-800">{title}</h3>
          {hint && <p className="text-xs text-stone-500">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

const weekOf = (day: number) => Math.floor((day - 1) / 7) + 1;
const weekStart = (w: number) => (w - 1) * 7 + 1;
const weekEnd = (w: number) => w * 7;
const weekHint = (plan: EditorPlan, w: number) =>
  plan.startDate ? ` (${formatDate(dateOfDay(plan.startDate, weekStart(w)))} – ${formatDate(dateOfDay(plan.startDate, weekEnd(w)))})` : "";

// ---------------------------------------------------------------------------
// Details
// ---------------------------------------------------------------------------

export function PlanDetails({ plan }: { plan: EditorPlan }) {
  const isTemplate = !plan.userId;
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const { pending, run } = useAction();
  const [f, setF] = useState({
    title: plan.title,
    description: plan.description ?? "",
    service: plan.service,
    totalSessions: plan.totalSessions ? String(plan.totalSessions) : "",
    currentSession: plan.currentSession ? String(plan.currentSession) : "",
    startDate: plan.startDate ?? "",
    clientNote: plan.clientNote ?? "",
    meetingLink: plan.meetingLink ?? "",
  });

  if (!editing) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-serif text-2xl text-stone-800">{plan.title}</h2>
              <Badge className="bg-sage-100 text-sage-800 hover:bg-sage-100">{serviceLabel(plan.service)}</Badge>
              {plan.completed && <Badge variant="secondary">Completed</Badge>}
            </div>
            <p className="text-sm text-stone-500">
              {plan.totalSessions ? `${isTemplate ? "" : `Session ${plan.currentSession ?? 1} of `}${plan.totalSessions}${isTemplate ? " sessions" : ""}` : "Sessions"}
              {plan.startDate ? ` · Week 1 started ${formatDate(plan.startDate, { day: "numeric", month: "short", year: "numeric" })}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit details
            </Button>
            {!isTemplate && (
              <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setPlanCompleted(plan.id, !plan.completed), plan.completed ? "Reopened" : "Marked as completed")}>
                {plan.completed ? "Reopen" : "Mark completed"}
              </Button>
            )}
            <ConfirmButton
              label="Delete"
              title={`Delete "${plan.title}"?`}
              description={isTemplate ? "People who already got this package keep their copy." : "Their tasks, trackers and answers for this plan will be removed."}
              onConfirm={() =>
                run(
                  () => deletePlan(plan.id),
                  "Deleted",
                  (r) => r.ok && isTemplate && navigateTo(router, "/admin/sessions#packages"),
                )
              }
            />
          </div>
        </div>
        {plan.description && <p className="whitespace-pre-line text-sm text-stone-600">{plan.description}</p>}
        {!isTemplate &&
          (plan.meetingLink ? (
            <p className="text-sm text-stone-600">
              Zoom link:{" "}
              <a href={plan.meetingLink} target="_blank" rel="noreferrer" className="break-all text-sage-700 underline">
                {plan.meetingLink}
              </a>
            </p>
          ) : (
            <p className="text-sm text-amber-700">
              No Zoom link yet.{" "}
              <button type="button" className="underline" onClick={() => setEditing(true)}>
                Add one
              </button>{" "}
              so it shows on their page.
            </p>
          ))}
        {plan.clientNote && (
          <p className="rounded-lg bg-sage-50 p-3 text-sm text-stone-700">
            <span className="font-medium">Note to client: </span>
            {plan.clientNote}
          </p>
        )}
      </div>
    );
  }

  const num = (v: string) => (v === "" ? null : Number(v));
  return (
    <div className="space-y-4 rounded-xl bg-stone-50 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Title</Label>
          <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Weight loss: 6 sessions" />
        </div>
        <div className="space-y-2">
          <Label>Service</Label>
          <select className={selectCls} value={f.service} onChange={(e) => setF({ ...f, service: e.target.value as typeof f.service })}>
            {SERVICES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Number of sessions</Label>
          <Input type="number" min={1} value={f.totalSessions} onChange={(e) => setF({ ...f, totalSessions: e.target.value })} />
        </div>
        {!isTemplate && (
          <>
            <div className="space-y-2">
              <Label>Current session</Label>
              <Input type="number" min={1} value={f.currentSession} onChange={(e) => setF({ ...f, currentSession: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Week 1 starts on</Label>
              <Input type="date" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Zoom link for their sessions (optional)</Label>
              <Input value={f.meetingLink} onChange={(e) => setF({ ...f, meetingLink: e.target.value })} placeholder="https://zoom.us/j/…" />
            </div>
          </>
        )}
        <div className="space-y-2 sm:col-span-2">
          <Label>Description</Label>
          <Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        </div>
        {!isTemplate && (
          <div className="space-y-2 sm:col-span-2">
            <Label>Note to the client</Label>
            <Textarea value={f.clientNote} onChange={(e) => setF({ ...f, clientNote: e.target.value })} placeholder="e.g. This week, focus on your breathing before bed." />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          className="bg-sage-600 hover:bg-sage-700"
          disabled={pending}
          onClick={() =>
            run(
              () =>
                updatePlan(plan.id, {
                  title: f.title,
                  description: f.description,
                  service: f.service,
                  totalSessions: num(f.totalSessions),
                  currentSession: num(f.currentSession),
                  startDate: f.startDate || null,
                  clientNote: f.clientNote,
                  meetingLink: f.meetingLink,
                }),
              "Saved",
              (r) => r.ok && setEditing(false),
            )
          }
        >
          Save
        </Button>
        <Button variant="ghost" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Weeks (sections of the plan)
// ---------------------------------------------------------------------------

export function ModulesEditor({ plan }: { plan: EditorPlan }) {
  const { pending, run } = useAction();
  const [edit, setEdit] = useState<{ id?: string; title: string; description: string } | null>(null);

  const form = edit && (
    <div className="space-y-2 rounded-lg bg-stone-50 p-3">
      <Input placeholder="e.g. Week 2: Calm and confidence" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
      <Textarea placeholder="What this week is about (optional)" value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
      <div className="flex gap-2">
        <Button size="sm" className="bg-sage-600 hover:bg-sage-700" disabled={pending} onClick={() => run(() => saveModule(plan.id, edit), "Saved", (r) => r.ok && setEdit(null))}>
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setEdit(null)}>
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <Section
      title="Weeks"
      hint="Organise the work week by week. The client sees this week's section open."
      action={
        !edit && (
          <Button size="sm" variant="outline" onClick={() => setEdit({ title: `Week ${plan.modules.length + 1}`, description: "" })}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add week
          </Button>
        )
      }
    >
      {plan.modules.length === 0 && !edit && <p className="text-sm text-stone-500">No weeks yet.</p>}
      <ol className="space-y-2">
        {plan.modules.map((m, i) =>
          edit?.id === m.id ? (
            <li key={m.id}>{form}</li>
          ) : (
            <li key={m.id} className="flex items-center gap-2 rounded-lg border border-stone-200 p-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-800">{m.title}</p>
                {m.description && <p className="truncate text-xs text-stone-500">{m.description}</p>}
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending || i === 0} onClick={() => run(() => moveModule(m.id, -1))} aria-label="Move up">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending || i === plan.modules.length - 1} onClick={() => run(() => moveModule(m.id, 1))} aria-label="Move down">
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEdit({ id: m.id, title: m.title, description: m.description ?? "" })} aria-label="Edit">
                <Pencil className="h-4 w-4" />
              </Button>
              <ConfirmButton icon title={`Delete "${m.title}"?`} description="Material and tasks in it stay in the plan, just not grouped." onConfirm={() => run(() => deleteModule(m.id), "Deleted")} />
            </li>
          ),
        )}
      </ol>
      {edit && !edit.id && form}
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Material
// ---------------------------------------------------------------------------

export function MaterialsEditor({ plan, library }: { plan: EditorPlan; library: LibraryOption[] }) {
  const { pending, run } = useAction();
  const [picking, setPicking] = useState(false);

  return (
    <Section
      title="Material"
      hint="Recordings, worksheets (PDF or Word), images, videos and links for this client."
      action={
        <Button size="sm" variant="outline" onClick={() => setPicking(true)}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add material
        </Button>
      }
    >
      {plan.items.length === 0 && <p className="text-sm text-stone-500">Nothing added yet.</p>}
      <ul className="space-y-2">
        {plan.items.map((item, i) => {
          const Icon = KIND_ICON[item.resource.kind];
          return (
            <li key={item.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-stone-200 p-2.5">
              <Icon className="h-4 w-4 shrink-0 text-sage-600" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-800">{item.resource.title}</p>
                <p className="truncate text-xs text-stone-500">
                  {KIND_LABEL[item.resource.kind]}
                  {item.note ? ` · ${item.note}` : ""}
                </p>
              </div>
              {plan.modules.length > 0 && (
                <select
                  className="h-8 max-w-[11rem] rounded-md border border-input bg-white px-2 text-xs"
                  value={item.moduleId ?? ""}
                  disabled={pending}
                  onChange={(e) => run(() => updatePlanItem(item.id, { moduleId: e.target.value || null, note: item.note }))}
                  aria-label="Week"
                >
                  <option value="">No week</option>
                  {plan.modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              )}
              <NoteButton onSave={(note) => updatePlanItem(item.id, { moduleId: item.moduleId, note })} note={item.note} />
              <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending || i === 0} onClick={() => run(() => movePlanItem(item.id, -1))} aria-label="Move up">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending || i === plan.items.length - 1} onClick={() => run(() => movePlanItem(item.id, 1))} aria-label="Move down">
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending} onClick={() => run(() => removePlanItem(item.id), "Removed")} aria-label="Remove">
                <X className="h-4 w-4" />
              </Button>
            </li>
          );
        })}
      </ul>
      <LibraryPicker
        open={picking}
        onOpenChange={setPicking}
        library={library}
        exclude={plan.items.map((i) => i.resource.id)}
        targets={plan.modules}
        targetLabel="Week"
        defaultTag={serviceLabel(plan.service)}
        onAdd={(ids, moduleId) => run(() => addPlanItems(plan.id, ids, moduleId), "Added")}
        pending={pending}
      />
    </Section>
  );
}

export function NoteButton({ note, onSave }: { note: string | null; onSave: (note: string) => Promise<{ ok: true } | { ok: false; error: string }> }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(note ?? "");
  const { pending, run } = useAction();
  return (
    <>
      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setOpen(true)} aria-label="Add a note">
        <Pencil className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Note for this item</DialogTitle>
          </DialogHeader>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Listen every night before sleep" />
          <Button className="bg-sage-600 hover:bg-sage-700" disabled={pending} onClick={() => run(() => onSave(text), "Saved", (r) => r.ok && setOpen(false))}>
            Save
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// Tasks (scheduled by week)
// ---------------------------------------------------------------------------

type TaskForm = {
  id?: string;
  title: string;
  instructions: string;
  resourceId: string;
  moduleId: string;
  recurrence: "ONCE" | "DAILY";
  fromWeek: number;
  toWeek: string; // "" = keeps going
  paused: boolean;
};

export function TasksEditor({ plan, library }: { plan: EditorPlan; library: LibraryOption[] }) {
  const { pending, run } = useAction();
  const [form, setForm] = useState<TaskForm | null>(null);
  const linkable = library.filter((r) => !r.personalForUserId || r.personalForUserId === plan.userId);

  const describe = (t: EditorPlan["tasks"][number]) => {
    const from = weekOf(t.startDay);
    if (t.recurrence === "ONCE") return `Once, in week ${from}`;
    if (t.endDay) {
      const to = weekOf(t.endDay);
      return to === from ? `Every day in week ${from}` : `Every day, weeks ${from}–${to}`;
    }
    return `Every day from week ${from}`;
  };

  const blankForm = (): TaskForm => ({ title: "", instructions: "", resourceId: "", moduleId: "", recurrence: "DAILY", fromWeek: 1, toWeek: "1", paused: false });

  return (
    <Section
      title="Exercises & tasks"
      hint={plan.startDate ? `Week 1 started ${formatDate(plan.startDate, { day: "numeric", month: "long" })}. Clients tick tasks off each day.` : "Weeks count from the day the client's plan starts."}
      action={
        <Button size="sm" variant="outline" onClick={() => setForm(blankForm())}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add task
        </Button>
      }
    >
      {plan.tasks.length === 0 && <p className="text-sm text-stone-500">No tasks yet.</p>}
      <ul className="space-y-2">
        {plan.tasks.map((t) => (
          <li key={t.id} className={`flex flex-wrap items-center gap-2 rounded-lg border p-2.5 ${t.paused ? "border-dashed border-stone-300 opacity-60" : "border-stone-200"}`}>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-stone-800">
                {t.title} {t.paused && <Badge variant="outline">Paused</Badge>}
              </p>
              <p className="text-xs text-stone-500">
                {describe(t)}
                {t.resource ? ` · ${KIND_LABEL[t.resource.kind]}: ${t.resource.title}` : ""}
              </p>
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending} onClick={() => run(() => setTaskPaused(t.id, !t.paused), t.paused ? "Resumed" : "Paused")} aria-label={t.paused ? "Resume" : "Pause"}>
              {t.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() =>
                setForm({
                  id: t.id,
                  title: t.title,
                  instructions: t.instructions ?? "",
                  resourceId: t.resourceId ?? "",
                  moduleId: t.moduleId ?? "",
                  recurrence: t.recurrence,
                  fromWeek: weekOf(t.startDay),
                  toWeek: t.endDay ? String(weekOf(t.endDay)) : "",
                  paused: t.paused,
                })
              }
              aria-label="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <ConfirmButton icon title={`Delete "${t.title}"?`} description="Its tick history will be removed too." onConfirm={() => run(() => deleteTask(t.id), "Deleted")} />
          </li>
        ))}
      </ul>

      <Dialog open={!!form} onOpenChange={(v) => !v && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form?.id ? "Edit task" : "New task"}</DialogTitle>
          </DialogHeader>
          {form && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Task</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Listen to your recording before sleep" />
              </div>
              <div className="space-y-2">
                <Label>Instructions (optional)</Label>
                <Textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="e.g. Fill in the reflection worksheet and upload it." />
              </div>
              <div className="space-y-2">
                <Label>Linked material (optional)</Label>
                <select className={selectCls} value={form.resourceId} onChange={(e) => setForm({ ...form, resourceId: e.target.value })}>
                  <option value="">None</option>
                  {linkable.map((r) => (
                    <option key={r.id} value={r.id}>
                      {KIND_LABEL[r.kind]}: {r.title}
                    </option>
                  ))}
                </select>
              </div>
              {plan.modules.length > 0 && (
                <div className="space-y-2">
                  <Label>Show under</Label>
                  <select className={selectCls} value={form.moduleId} onChange={(e) => setForm({ ...form, moduleId: e.target.value })}>
                    <option value="">No week section</option>
                    {plan.modules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {(["DAILY", "ONCE"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, recurrence: r })}
                    className={`rounded-lg border px-3 py-2.5 text-sm ${form.recurrence === r ? "border-sage-500 bg-sage-50 text-sage-800" : "border-stone-200 text-stone-600"}`}
                  >
                    {r === "DAILY" ? "Every day" : "Once"}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{form.recurrence === "DAILY" ? "From week" : "In week"}</Label>
                  <Input type="number" min={1} value={form.fromWeek} onChange={(e) => setForm({ ...form, fromWeek: Math.max(1, Number(e.target.value) || 1) })} />
                  {plan.startDate && <p className="text-xs text-stone-500">{weekHint(plan, form.fromWeek).replace(/[()]/g, "")}</p>}
                </div>
                {form.recurrence === "DAILY" && (
                  <div className="space-y-2">
                    <Label>Until week</Label>
                    <Input type="number" min={form.fromWeek} value={form.toWeek} onChange={(e) => setForm({ ...form, toWeek: e.target.value })} placeholder="Keeps going" />
                    <p className="text-xs text-stone-500">Leave empty to keep going.</p>
                  </div>
                )}
              </div>
              <Button
                className="h-11 w-full bg-sage-600 hover:bg-sage-700"
                disabled={pending || !form.title.trim()}
                onClick={() =>
                  run(
                    () =>
                      saveTask(plan.id, {
                        id: form.id,
                        title: form.title,
                        instructions: form.instructions,
                        resourceId: form.resourceId || null,
                        moduleId: form.moduleId || null,
                        recurrence: form.recurrence,
                        startDay: weekStart(form.fromWeek),
                        endDay: form.recurrence === "DAILY" && form.toWeek ? weekEnd(Math.max(form.fromWeek, Number(form.toWeek))) : null,
                        paused: form.paused,
                      }),
                    "Task saved",
                    (r) => r.ok && setForm(null),
                  )
                }
              >
                Save task
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Journal prompts
// ---------------------------------------------------------------------------

export function PromptsEditor({ plan }: { plan: EditorPlan }) {
  const { pending, run } = useAction();
  const nextWeek = plan.prompts.length ? weekOf(plan.prompts[plan.prompts.length - 1].day) + 1 : 1;
  const [form, setForm] = useState<{ id?: string; week: number; text: string } | null>(null);

  return (
    <Section
      title="Journal prompts"
      hint="A question shown in their journal, from its week until the next prompt."
      action={
        <Button size="sm" variant="outline" onClick={() => setForm({ week: nextWeek, text: "" })}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add prompt
        </Button>
      }
    >
      {plan.prompts.length === 0 && !form && <p className="text-sm text-stone-500">No prompts yet. The journal just asks how they&apos;re feeling.</p>}
      <ul className="space-y-2">
        {plan.prompts.map((p) => (
          <li key={p.id} className="flex items-start gap-3 rounded-lg border border-stone-200 p-2.5">
            <Badge variant="outline" className="mt-0.5 shrink-0">
              Week {weekOf(p.day)}
            </Badge>
            <p className="flex-1 text-sm text-stone-700">{p.text}</p>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setForm({ id: p.id, week: weekOf(p.day), text: p.text })} aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending} onClick={() => run(() => deletePrompt(p.id), "Deleted")} aria-label="Delete">
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
      {form && (
        <div className="space-y-2 rounded-lg bg-stone-50 p-3">
          <div className="flex items-center gap-2">
            <Label className="shrink-0">From week</Label>
            <Input type="number" min={1} className="w-24" value={form.week} onChange={(e) => setForm({ ...form, week: Math.max(1, Number(e.target.value) || 1) })} />
          </div>
          <Textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="e.g. What did you notice about your cravings today?" />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-sage-600 hover:bg-sage-700"
              disabled={pending}
              onClick={() => run(() => savePrompt(plan.id, { id: form.id, day: weekStart(form.week), text: form.text }), "Saved", (r) => r.ok && setForm(null))}
            >
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setForm(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Progress trackers (daily forms)
// ---------------------------------------------------------------------------

type TrackerFormState = { id?: string; title: string; description: string; fields: TrackerField[]; active: boolean };
const newId = () => Math.random().toString(36).slice(2, 10);

export function TrackersEditor({ plan }: { plan: EditorPlan }) {
  const { pending, run } = useAction();
  const [form, setForm] = useState<TrackerFormState | null>(null);

  const start = (example?: (typeof TRACKER_EXAMPLES)[number]) =>
    setForm({
      title: example?.title ?? "",
      description: "",
      fields: (example?.fields ?? [{ label: "", type: "number" as TrackerFieldType }]).map((f) => ({ ...f, id: newId() })),
      active: true,
    });

  const setField = (i: number, patch: Partial<TrackerField>) =>
    form && setForm({ ...form, fields: form.fields.map((f, j) => (j === i ? { ...f, ...patch } : f)) });

  return (
    <Section
      title="Progress trackers"
      hint="Daily forms the client fills in, e.g. weight and measurements, or how strong an urge was. You'll see their answers and a chart."
      action={
        <Button size="sm" variant="outline" onClick={() => start()}>
          <Plus className="mr-1 h-3.5 w-3.5" /> New tracker
        </Button>
      }
    >
      {plan.trackers.length === 0 && !form && (
        <div className="space-y-2">
          <p className="text-sm text-stone-500">No trackers yet. Start from an example:</p>
          <div className="flex flex-wrap gap-2">
            {TRACKER_EXAMPLES.map((ex) => (
              <Button key={ex.title} size="sm" variant="outline" onClick={() => start(ex)}>
                {ex.title}
              </Button>
            ))}
          </div>
        </div>
      )}
      <ul className="space-y-2">
        {plan.trackers.map((t) => (
          <li key={t.id} className={`flex flex-wrap items-center gap-2 rounded-lg border p-2.5 ${t.active ? "border-stone-200" : "border-dashed border-stone-300 opacity-60"}`}>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-stone-800">
                {t.title} {!t.active && <Badge variant="outline">Paused</Badge>}
              </p>
              <p className="truncate text-xs text-stone-500">
                {t.fields.map((f) => f.label).join(" · ")}
                {plan.userId ? ` · ${t.entries} answer${t.entries === 1 ? "" : "s"}` : ""}
              </p>
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending} onClick={() => run(() => setTrackerActive(t.id, !t.active), t.active ? "Paused" : "Resumed")} aria-label={t.active ? "Pause" : "Resume"}>
              {t.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setForm({ id: t.id, title: t.title, description: t.description ?? "", fields: t.fields, active: t.active })} aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <ConfirmButton icon title={`Delete "${t.title}"?`} description="All the answers the client gave will be deleted too." onConfirm={() => run(() => deleteTracker(t.id), "Deleted")} />
          </li>
        ))}
      </ul>

      <Dialog open={!!form} onOpenChange={(v) => !v && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{form?.id ? "Edit tracker" : "New tracker"}</DialogTitle>
            <DialogDescription>The client answers these questions once a day.</DialogDescription>
          </DialogHeader>
          {form && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Weight & measurements" />
              </div>
              <div className="space-y-2">
                <Label>Short explanation (optional)</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Weigh yourself in the morning before breakfast." />
              </div>
              <div className="space-y-2">
                <Label>Questions</Label>
                {form.fields.map((f, i) => (
                  <div key={f.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-stone-50 p-2">
                    <Input className="min-w-[10rem] flex-1" value={f.label} onChange={(e) => setField(i, { label: e.target.value })} placeholder="Question, e.g. Weight" />
                    <select className="h-10 rounded-md border border-input bg-white px-2 text-sm" value={f.type} onChange={(e) => setField(i, { type: e.target.value as TrackerFieldType })}>
                      {(Object.keys(FIELD_TYPE_LABEL) as TrackerFieldType[]).map((t) => (
                        <option key={t} value={t}>
                          {FIELD_TYPE_LABEL[t]}
                        </option>
                      ))}
                    </select>
                    {f.type === "number" && <Input className="w-24" value={f.unit ?? ""} onChange={(e) => setField(i, { unit: e.target.value })} placeholder="Unit (kg)" />}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      disabled={form.fields.length === 1}
                      onClick={() => setForm({ ...form, fields: form.fields.filter((_, j) => j !== i) })}
                      aria-label="Remove question"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => setForm({ ...form, fields: [...form.fields, { id: newId(), label: "", type: "number" }] })}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add question
                </Button>
              </div>
              <Button
                className="h-11 w-full bg-sage-600 hover:bg-sage-700"
                disabled={pending || !form.title.trim()}
                onClick={() =>
                  run(
                    () => saveTracker(plan.id, { id: form.id, title: form.title, description: form.description, active: form.active, fields: form.fields.map((f) => ({ ...f, unit: f.unit || undefined })) }),
                    "Tracker saved",
                    (r) => r.ok && setForm(null),
                  )
                }
              >
                Save tracker
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Section>
  );
}
