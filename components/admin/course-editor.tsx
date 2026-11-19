"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Award, ExternalLink, Globe, Pencil, Plus, Sparkles, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { EditorCourse, LibraryOption } from "@/lib/admin-plans";
import { KIND_LABEL } from "@/lib/catalog";
import { uploadFile } from "@/lib/upload-client";
import {
  addCourseItems,
  deleteCourse,
  deleteCourseModule,
  enrollStudent,
  moveCourseItem,
  moveCourseModule,
  removeCertificate,
  removeCourseItem,
  saveCourseModule,
  setCertificate,
  setCourseArchived,
  setEnrollmentCompleted,
  unenrollStudent,
  updateCourse,
  updateCourseItem,
  updateCourseWebsite,
} from "@/app/admin/_actions/courses";
import { useAction } from "./use-action";
import { ConfirmButton } from "./confirm-button";
import { KIND_ICON, LibraryPicker } from "./library-picker";
import { NoteButton, Section } from "./plan-editor";

const selectCls = "h-10 w-full rounded-md border border-input bg-white px-3 text-sm";

export function CourseDetails({ course }: { course: EditorCourse }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState({ title: course.title, description: course.description ?? "" });
  const { pending, run } = useAction();
  if (!editing) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-3xl text-stone-800">{course.title}</h1>
            {course.archived && <Badge variant="secondary">Hidden from students</Badge>}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
            </Button>
            <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setCourseArchived(course.id, !course.archived), course.archived ? "Class visible again" : "Class hidden")}>
              {course.archived ? "Show to students" : "Hide class"}
            </Button>
            {course.canDelete && (
              <ConfirmButton
                title="Delete this class?"
                description="Its modules and material list are deleted too. Library files stay in the Library."
                onConfirm={() => run(() => deleteCourse(course.id), "Class deleted", (r) => r.ok && router.push("/admin/classes"))}
              />
            )}
          </div>
        </div>
        {course.description && <p className="whitespace-pre-line text-stone-600">{course.description}</p>}
      </div>
    );
  }
  return (
    <div className="space-y-3 rounded-xl bg-stone-50 p-4">
      <div className="space-y-2">
        <Label>Class name</Label>
        <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Description (students see this)</Label>
        <Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
      </div>
      <div className="flex gap-2">
        <Button className="bg-sage-600 hover:bg-sage-700" disabled={pending} onClick={() => run(() => updateCourse(course.id, f), "Saved", (r) => r.ok && setEditing(false))}>
          Save
        </Button>
        <Button variant="ghost" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function CourseModulesEditor({ course }: { course: EditorCourse }) {
  const { pending, run } = useAction();
  const [edit, setEdit] = useState<{ id?: string; title: string; description: string } | null>(null);
  const form = edit && (
    <div className="space-y-2 rounded-lg bg-stone-50 p-3">
      <Input placeholder="e.g. Module 2: Hand positions" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
      <Textarea placeholder="What this module covers (optional)" value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
      <div className="flex gap-2">
        <Button size="sm" className="bg-sage-600 hover:bg-sage-700" disabled={pending} onClick={() => run(() => saveCourseModule(course.id, edit), "Saved", (r) => r.ok && setEdit(null))}>
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
      title="Modules"
      hint="Students see the modules in this order and can mark each one complete."
      action={
        !edit && (
          <Button size="sm" variant="outline" onClick={() => setEdit({ title: `Module ${course.modules.length + 1}: `, description: "" })}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add module
          </Button>
        )
      }
    >
      {course.modules.length === 0 && !edit && <p className="text-sm text-stone-500">No modules yet.</p>}
      <ol className="space-y-2">
        {course.modules.map((m, i) =>
          edit?.id === m.id ? (
            <li key={m.id}>{form}</li>
          ) : (
            <li key={m.id} className="flex items-center gap-2 rounded-lg border border-stone-200 p-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-800">{m.title}</p>
                <p className="truncate text-xs text-stone-500">
                  {course.items.filter((x) => x.moduleId === m.id).length} items{m.description ? ` · ${m.description}` : ""}
                </p>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending || i === 0} onClick={() => run(() => moveCourseModule(m.id, -1))} aria-label="Move up">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending || i === course.modules.length - 1} onClick={() => run(() => moveCourseModule(m.id, 1))} aria-label="Move down">
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEdit({ id: m.id, title: m.title, description: m.description ?? "" })} aria-label="Edit">
                <Pencil className="h-4 w-4" />
              </Button>
              <ConfirmButton icon title={`Delete "${m.title}"?`} description="Its material stays in the class, just not in a module. Students' ticks for it are removed." onConfirm={() => run(() => deleteCourseModule(m.id), "Deleted")} />
            </li>
          ),
        )}
      </ol>
      {edit && !edit.id && form}
    </Section>
  );
}

export function CourseMaterialEditor({ course, library }: { course: EditorCourse; library: LibraryOption[] }) {
  const { pending, run } = useAction();
  const [picking, setPicking] = useState(false);
  const main = course.items.filter((i) => !i.extra);
  const extras = course.items.filter((i) => i.extra);

  const row = (item: EditorCourse["items"][number], i: number, list: EditorCourse["items"]) => {
    const Icon = KIND_ICON[item.resource.kind];
    return (
      <li key={item.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-stone-200 p-2.5">
        <Icon className="h-4 w-4 shrink-0 text-sage-600" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-stone-800">{item.resource.title}</p>
          <p className="truncate text-xs text-stone-500">
            {KIND_LABEL[item.resource.kind]}
            {item.note ? ` · ${item.note}` : ""}
            {!item.extra && !item.moduleId && course.modules.length ? " · not in a module" : ""}
          </p>
        </div>
        <select
          className="h-8 max-w-[12rem] rounded-md border border-input bg-white px-2 text-xs"
          value={item.extra ? "__extra" : (item.moduleId ?? "")}
          disabled={pending}
          onChange={(e) =>
            run(() =>
              updateCourseItem(item.id, {
                moduleId: e.target.value === "__extra" || !e.target.value ? null : e.target.value,
                note: item.note,
                extra: e.target.value === "__extra",
              }),
            )
          }
          aria-label="Where"
        >
          <option value="">Class material</option>
          {course.modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
          <option value="__extra">Extras</option>
        </select>
        <NoteButton note={item.note} onSave={(note) => updateCourseItem(item.id, { moduleId: item.moduleId, note, extra: item.extra })} />
        <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending || i === 0} onClick={() => run(() => moveCourseItem(item.id, -1))} aria-label="Move up">
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending || i === list.length - 1} onClick={() => run(() => moveCourseItem(item.id, 1))} aria-label="Move down">
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending} onClick={() => run(() => removeCourseItem(item.id), "Removed from class")} aria-label="Remove">
          <X className="h-4 w-4" />
        </Button>
      </li>
    );
  };

  return (
    <Section
      title="Class material & extras"
      hint="Everything here is shared: every student on this class sees it, including anything you add later."
      action={
        <Button size="sm" className="bg-sage-600 hover:bg-sage-700" onClick={() => setPicking(true)}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add material
        </Button>
      }
    >
      {course.items.length === 0 && <p className="text-sm text-stone-500">No material yet. Add the tutorials, PDFs, recordings and videos for this class.</p>}
      {main.length > 0 && <ul className="space-y-2">{main.map((it, i) => row(it, i, main))}</ul>}
      {extras.length > 0 && (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 pt-2 text-sm font-medium text-stone-700">
            <Sparkles className="h-4 w-4 text-sage-600" /> Extras
          </p>
          <ul className="space-y-2">{extras.map((it, i) => row(it, i, extras))}</ul>
        </div>
      )}
      <LibraryPicker
        open={picking}
        onOpenChange={setPicking}
        library={library}
        exclude={course.items.map((i) => i.resource.id)}
        targets={course.modules}
        targetLabel="Module"
        defaultTag={course.title}
        showExtra
        onAdd={(ids, moduleId, extra) => run(() => addCourseItems(course.id, ids, moduleId, extra), "Added to the class")}
        pending={pending}
      />
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Certificates and enrolments
// ---------------------------------------------------------------------------

export function CertificateUpload({ enrollmentId, hasCertificate }: { enrollmentId: string; hasCertificate: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [pct, setPct] = useState<number | null>(null);
  const { pending, run } = useAction();

  const onFile = async (file: File) => {
    try {
      setPct(0);
      const up = await uploadFile(file, { purpose: "certificate", filename: file.name, onProgress: setPct });
      run(() => setCertificate(enrollmentId, { key: up.key, name: file.name, contentType: up.contentType }), "Certificate uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setPct(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {hasCertificate && (
        <>
          <Button size="sm" variant="outline" asChild>
            <a href={`/api/files/certificate/${enrollmentId}`} target="_blank" rel="noreferrer">
              <Award className="mr-1.5 h-3.5 w-3.5 text-amber-600" /> View certificate
            </a>
          </Button>
          <ConfirmButton label="Remove" title="Remove this certificate?" description="The student will no longer see it." onConfirm={() => run(() => removeCertificate(enrollmentId), "Certificate removed")} />
        </>
      )}
      <Button size="sm" variant={hasCertificate ? "ghost" : "outline"} disabled={pending || pct !== null} onClick={() => ref.current?.click()}>
        <Upload className="mr-1.5 h-3.5 w-3.5" /> {hasCertificate ? "Replace" : "Upload certificate"}
      </Button>
      <input ref={ref} type="file" accept="application/pdf,.pdf,image/*,.jpg,.jpeg,.png" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      {pct !== null && <Progress value={pct} className="h-1.5 w-24" />}
    </div>
  );
}

type Enrolled = {
  enrollmentId: string;
  userId: string;
  name: string;
  email: string;
  modulesDone: number;
  completed: boolean;
  hasCertificate: boolean;
  startedAt: string;
};

export function CourseStudents({
  courseId,
  totalModules,
  students,
  candidates,
}: {
  courseId: string;
  totalModules: number;
  students: Enrolled[];
  candidates: { id: string; name: string }[];
}) {
  const { pending, run } = useAction();
  const [pick, setPick] = useState("");

  return (
    <Section title={`Students (${students.length})`} hint="Only these people can see this class. Upload each student's signed certificate when they finish.">
      <div className="flex flex-wrap gap-2">
        <select className={`${selectCls} max-w-xs`} value={pick} onChange={(e) => setPick(e.target.value)}>
          <option value="">Add an existing person…</option>
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Button variant="outline" disabled={!pick || pending} onClick={() => run(() => enrollStudent(pick, courseId), "Enrolled", (r) => r.ok && setPick(""))}>
          Enrol
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/admin/clients?add=1">New person…</Link>
        </Button>
      </div>
      {students.length === 0 && <p className="text-sm text-stone-500">No students yet.</p>}
      <ul className="space-y-2">
        {students.map((s) => (
          <li key={s.enrollmentId} className="space-y-2 rounded-lg border border-stone-200 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/admin/clients/${s.userId}?tab=courses`} className="flex-1 font-medium text-stone-800 hover:underline">
                {s.name}
                <span className="block text-xs font-normal text-stone-500">{s.email}</span>
              </Link>
              {s.completed && <Badge className="bg-sage-100 text-sage-800 hover:bg-sage-100">Completed</Badge>}
              <span className="text-xs text-stone-500">
                {totalModules ? `${s.modulesDone}/${totalModules} modules` : ""}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CertificateUpload enrollmentId={s.enrollmentId} hasCertificate={s.hasCertificate} />
              <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => setEnrollmentCompleted(s.enrollmentId, !s.completed), s.completed ? "Marked as in progress" : "Marked as completed")}>
                {s.completed ? "Mark in progress" : "Mark completed"}
              </Button>
              <ConfirmButton
                label="Remove"
                title={`Remove ${s.name} from this class?`}
                description="They'll no longer see the class. Their module ticks and certificate for it are deleted."
                onConfirm={() => run(() => unenrollStudent(s.enrollmentId), "Removed from class")}
              />
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** On a person's page: their courses, with certificate upload. */
export function PersonCourses({
  userId,
  enrollments,
  allCourses,
}: {
  userId: string;
  enrollments: (Enrolled & { courseId: string; courseTitle: string; totalModules: number })[];
  allCourses: { id: string; title: string }[];
}) {
  const { pending, run } = useAction();
  const [pick, setPick] = useState("");
  const available = allCourses.filter((c) => !enrollments.some((e) => e.courseId === c.id));
  return (
    <div className="space-y-4">
      {enrollments.length === 0 && <p className="rounded-xl bg-white p-5 text-stone-500 ring-1 ring-stone-200">Not enrolled in any class.</p>}
      {enrollments.map((e) => (
        <section key={e.enrollmentId} className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/admin/classes/${e.courseId}`} className="flex-1 font-serif text-xl text-stone-800 hover:underline">
              {e.courseTitle}
            </Link>
            {e.completed && <Badge className="bg-sage-100 text-sage-800 hover:bg-sage-100">Completed</Badge>}
          </div>
          {e.totalModules > 0 && (
            <div className="space-y-1">
              <Progress value={(e.modulesDone / e.totalModules) * 100} className="h-2 bg-sage-100 [&>div]:bg-sage-500" />
              <p className="text-xs text-stone-500">
                {e.modulesDone} of {e.totalModules} modules marked done · enrolled {new Date(e.startedAt).toLocaleDateString("en-AU")}
              </p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <CertificateUpload enrollmentId={e.enrollmentId} hasCertificate={e.hasCertificate} />
            <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => setEnrollmentCompleted(e.enrollmentId, !e.completed), "Saved")}>
              {e.completed ? "Mark in progress" : "Mark completed"}
            </Button>
            <ConfirmButton
              label="Remove from class"
              title={`Remove from ${e.courseTitle}?`}
              description="They'll no longer see this class. Their module ticks and certificate for it are deleted."
              onConfirm={() => run(() => unenrollStudent(e.enrollmentId), "Removed")}
            />
          </div>
        </section>
      ))}
      {available.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-2xl border-2 border-dashed border-sage-200 bg-white p-4">
          <select className={`${selectCls} max-w-xs`} value={pick} onChange={(e) => setPick(e.target.value)}>
            <option value="">Enrol in a class…</option>
            {available.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <Button className="bg-sage-600 hover:bg-sage-700" disabled={!pick || pending} onClick={() => run(() => enrollStudent(userId, pick), "Enrolled", (r) => r.ok && setPick(""))}>
            Enrol
          </Button>
        </div>
      )}
    </div>
  );
}

/** Price (AUD and AED), dates, details and bundle contents for the public /classes page, and the publish switch. */
export function CourseWebsiteForm({ course, classOptions }: { course: EditorCourse; classOptions: { id: string; title: string; isBundle: boolean }[] }) {
  const w = course.website;
  const [f, setF] = useState({
    summary: w.summary,
    details: w.details,
    format: w.format,
    schedule: w.schedule,
    price: w.price ? String(w.price / 100) : "",
    priceAed: w.priceAed ? String(w.priceAed / 100) : "",
    prerequisite: w.prerequisite,
    highlights: w.highlights,
    seats: w.seats === null ? "" : String(w.seats),
    published: w.published,
  });
  const [includeIds, setIncludeIds] = useState<string[]>(course.includes.map((c) => c.id));
  const [slug, setSlug] = useState(w.slug);
  const { pending, run } = useAction();
  // Classes that can go in a bundle: ordinary classes other than this one.
  const bundleChoices = classOptions.filter((c) => c.id !== course.id && !c.isBundle);
  // A class that's already in a bundle, or has its own students, can't become a bundle.
  const canBeBundle = course.includedIn.length === 0 && (!course.hasStudents || includeIds.length > 0);
  const save = (published = f.published) =>
    run(
      () =>
        updateCourseWebsite(course.id, {
          summary: f.summary,
          details: f.details,
          format: f.format,
          schedule: f.schedule,
          price: Number(f.price || 0),
          priceAed: f.priceAed.trim() === "" ? null : Number(f.priceAed),
          prerequisite: f.prerequisite,
          highlights: f.highlights,
          seats: f.seats.trim() === "" ? null : Math.max(0, Math.floor(Number(f.seats))),
          published,
          includeIds,
        }),
      published && !w.published ? "Published. People can enrol on the website now." : !published && w.published ? "Taken off the website" : "Saved",
      (r) => {
        if (r.ok) {
          setF((x) => ({ ...x, published }));
          setSlug((r.data as { slug?: string } | undefined)?.slug ?? slug);
        }
      },
    );
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const toggleInclude = (id: string) => setIncludeIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-xl text-stone-800">
            <Globe className="h-5 w-5 text-sage-600" /> On the website
          </h2>
          <p className="text-sm text-stone-500">People can read about this class on the Classes page, pay by card and be enrolled automatically.</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${f.published ? "bg-sage-100 text-sage-800" : "bg-amber-100 text-amber-900"}`}>
          {f.published ? "On the website" : "Not on the website"}
        </span>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cw-summary">Short summary</Label>
        <Input id="cw-summary" maxLength={200} placeholder="One line shown on the class list" value={f.summary} onChange={set("summary")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="cw-price">Price (AUD)</Label>
          <Input id="cw-price" type="number" min={0} step={0.01} placeholder="e.g. 325" value={f.price} onChange={set("price")} />
          <p className="text-xs text-stone-500">Everyone outside the UAE.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cw-price-aed">Price (AED)</Label>
          <Input id="cw-price-aed" type="number" min={0} step={0.01} placeholder="e.g. 800" value={f.priceAed} onChange={set("priceAed")} />
          <p className="text-xs text-stone-500">Visitors in the UAE. Empty = they see AUD.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cw-seats">Places left</Label>
          <Input id="cw-seats" type="number" min={0} step={1} placeholder="No limit" value={f.seats} onChange={set("seats")} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cw-format">Where and how long</Label>
          <Input id="cw-format" maxLength={120} placeholder="e.g. Online live group class · 2 days, 3 hours each" value={f.format} onChange={set("format")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cw-schedule">Next dates</Label>
          <Input id="cw-schedule" maxLength={200} placeholder="e.g. Sat 14 & Sun 15 December, 6–9pm (Perth time)" value={f.schedule} onChange={set("schedule")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cw-prereq">Before you join (optional)</Label>
        <Input id="cw-prereq" maxLength={120} placeholder="e.g. Reiki Level 1" value={f.prerequisite} onChange={set("prerequisite")} />
        <p className="text-xs text-stone-500">The class people must have completed first. Buyers tick a box to confirm it. Leave empty if anyone can join.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cw-details">About this class (website)</Label>
        <Textarea
          id="cw-details"
          rows={6}
          maxLength={10000}
          placeholder={"What people will learn, who it's for, what's included… Leave empty to use the class description."}
          value={f.details}
          onChange={set("details")}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cw-highlights">What you&apos;ll explore</Label>
        <Textarea
          id="cw-highlights"
          rows={6}
          maxLength={5000}
          placeholder={"One point per line, e.g.\nThe history and origins of Reiki\nThe Five Reiki Principles"}
          value={f.highlights}
          onChange={set("highlights")}
        />
        <p className="text-xs text-stone-500">
          Shown as a tick list on the class page. The module names you add above are listed too, under “What you’ll cover”. Places left goes down by one with each
          payment.
        </p>
      </div>
      {canBeBundle && bundleChoices.length >= 2 && (
        <div className="space-y-2 rounded-xl border border-stone-200 p-4">
          <p className="font-medium text-stone-800">Bundle (optional)</p>
          <p className="text-xs text-stone-500">
            Tick two or more classes to sell this as a bundle (e.g. “Reiki Level 1 &amp; 2”). Buying it enrols the student in each ticked class, so they get each
            class&apos;s own content and certificate. Changes apply to new enrolments.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {bundleChoices.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm text-stone-700">
                <input type="checkbox" checked={includeIds.includes(c.id)} onChange={() => toggleInclude(c.id)} />
                {c.title}
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button disabled={pending} onClick={() => save()} className="bg-sage-600 hover:bg-sage-700">
          {pending ? "Saving…" : "Save"}
        </Button>
        {!course.archived &&
          (f.published ? (
            <Button variant="outline" disabled={pending} onClick={() => save(false)}>
              Take off the website
            </Button>
          ) : (
            <Button variant="outline" disabled={pending} onClick={() => save(true)}>
              Publish on website
            </Button>
          ))}
        {f.published && slug && (
          <Button variant="ghost" asChild>
            <a href={`/classes/${slug}`} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> View on website
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
