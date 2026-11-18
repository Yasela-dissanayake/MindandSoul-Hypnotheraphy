"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, ArrowDown, ArrowUp, Award, ExternalLink, Link2, Pencil, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  createLearningPackage,
  deleteLearningPackage,
  deleteLesson,
  deleteLessonSection,
  moveLesson,
  moveLessonSection,
  removeLearningCertificate,
  saveLesson,
  saveLessonSection,
  setLearningCertificate,
  setLearningPackageArchived,
  updateLearningPackage,
} from "@/app/admin/_actions/learning";
import { uploadFile } from "@/lib/upload-client";
import type { LibraryOption } from "@/lib/admin-plans";
import { KIND_ICON, uploadToLibrary } from "./library-picker";
import { createLinkResource } from "@/app/admin/_actions/library";
import { ACCEPT_FILES, kindForFile } from "@/lib/catalog";
import { ConfirmButton } from "./confirm-button";
import { useAction } from "./use-action";
import { cn } from "@/lib/utils";

const selectCls = "h-10 w-full rounded-md border border-input bg-white px-3 text-sm";

// ---------- New course ----------

export function NewPackageDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const { pending, run } = useAction();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-sage-600 hover:bg-sage-700">
          <Plus className="mr-2 h-4 w-4" /> New course
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New course</DialogTitle>
          <DialogDescription>Give it a name and price. Next you&apos;ll add the lessons. It stays hidden from the website until you publish it.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            run(
              () => createLearningPackage({ title, price: Number(price) }),
              "Course created",
              (r) => {
                if (!r.ok) return;
                setOpen(false);
                router.push(`/admin/courses/${(r.data as { id: string }).id}`);
              },
            );
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="np-title">Name</Label>
            <Input id="np-title" required maxLength={150} placeholder="e.g. Self-Hypnosis for Better Sleep" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="np-price">Price (AUD)</Label>
            <Input id="np-price" required type="number" min={0.5} step={0.01} placeholder="e.g. 149" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <Button type="submit" disabled={pending} className="w-full bg-sage-600 hover:bg-sage-700">
            {pending ? "Creating…" : "Create and add lessons"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Details ----------

type Details = { id: string; slug: string; title: string; summary: string; description: string; price: number; published: boolean; archived: boolean; lessons: number; learners: number };

export function PackageDetailsForm({ pkg }: { pkg: Details }) {
  const router = useRouter();
  const [f, setF] = useState({ title: pkg.title, summary: pkg.summary, description: pkg.description, price: String(pkg.price / 100), published: pkg.published });
  const { pending, run } = useAction();
  const save = (published = f.published) =>
    run(
      () => updateLearningPackage(pkg.id, { title: f.title, summary: f.summary, description: f.description, price: Number(f.price), published }),
      published && !pkg.published ? "Published. It's on the website now." : "Saved",
      (r) => r.ok && setF((x) => ({ ...x, published })),
    );

  return (
    <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl text-stone-800">Details</h2>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            pkg.archived ? "bg-stone-100 text-stone-600" : f.published ? "bg-sage-100 text-sage-800" : "bg-amber-100 text-amber-900",
          )}
        >
          {pkg.archived ? "Archived" : f.published ? "On the website" : "Draft (hidden)"}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <div className="space-y-1.5">
          <Label htmlFor="pd-title">Name</Label>
          <Input id="pd-title" maxLength={150} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pd-price">Price (AUD)</Label>
          <Input id="pd-price" type="number" min={0.5} step={0.01} value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pd-summary">Short summary</Label>
        <Input id="pd-summary" maxLength={200} placeholder="One line shown on the course list" value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pd-desc">About this course</Label>
        <Textarea
          id="pd-desc"
          rows={6}
          maxLength={10000}
          placeholder={"What people will learn, who it's for, how long it takes…"}
          value={f.description}
          onChange={(e) => setF({ ...f, description: e.target.value })}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button disabled={pending} onClick={() => save()} className="bg-sage-600 hover:bg-sage-700">
          {pending ? "Saving…" : "Save"}
        </Button>
        {!pkg.archived &&
          (f.published ? (
            <Button variant="outline" disabled={pending} onClick={() => save(false)}>
              Hide from website
            </Button>
          ) : (
            <Button variant="outline" disabled={pending} onClick={() => save(true)}>
              Publish on website
            </Button>
          ))}
        {f.published && !pkg.archived && (
          <Button variant="ghost" asChild>
            <a href={`/courses/${pkg.slug}`} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> View on website
            </a>
          </Button>
        )}
        <span className="flex-1" />
        <Button
          variant="ghost"
          disabled={pending}
          className="text-stone-500"
          onClick={() => run(() => setLearningPackageArchived(pkg.id, !pkg.archived), pkg.archived ? "Restored" : "Archived. It's hidden from the website and learners.")}
        >
          {pkg.archived ? <ArchiveRestore className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
          {pkg.archived ? "Restore" : "Archive"}
        </Button>
        {pkg.learners === 0 && (
          <ConfirmButton
            title="Delete this course?"
            description="Its sections and lessons are deleted too. Library files stay in the Library."
            onConfirm={() => run(() => deleteLearningPackage(pkg.id), "Course deleted", (r) => r.ok && router.push("/admin/courses"))}
          />
        )}
      </div>
    </section>
  );
}

// ---------- Sections and lessons ----------

type LessonRow = { id: string; title: string; body: string; sectionId: string | null; resource: { id: string; title: string; kind: string } | null };
type SectionRow = { id: string; title: string };

function LessonDialog({
  packageId,
  sections,
  library,
  lesson,
  sectionId,
  trigger,
}: {
  packageId: string;
  sections: SectionRow[];
  library: LibraryOption[];
  lesson?: LessonRow;
  sectionId?: string | null;
  trigger: React.ReactNode;
}) {
  const blankForm = () => ({ title: lesson?.title ?? "", body: lesson?.body ?? "", resourceId: lesson?.resource?.id ?? "", sectionId: lesson?.sectionId ?? sectionId ?? "" });
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(blankForm);
  const { pending, run } = useAction();
  // Files and links added from this window, so they can be chosen straight away.
  const [added, setAdded] = useState<{ id: string; title: string; kind: string }[]>([]);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkBusy, setLinkBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const options = [...added, ...library.filter((r) => !added.some((a) => a.id === r.id))];

  const onFile = async (file: File) => {
    try {
      setUploadPct(0);
      const [id] = await uploadToLibrary([file], { onProgress: (_, pct) => setUploadPct(pct) });
      const title = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
      setAdded((a) => [{ id, title, kind: kindForFile(file.type, file.name) ?? "PDF" }, ...a]);
      setF((x) => ({ ...x, resourceId: id }));
      toast.success("Uploaded and added to the Library");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploadPct(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const addLink = async () => {
    setLinkBusy(true);
    try {
      const title = f.title.trim() || "Lesson video";
      const r = await createLinkResource({ url: linkUrl.trim(), title, tag: null, personalForUserId: null });
      if (!r.ok) return void toast.error(r.error);
      const id = r.data!.id;
      setAdded((a) => [{ id, title, kind: /youtu\.?be/.test(linkUrl) ? "VIDEO" : "LINK" }, ...a]);
      setF((x) => ({ ...x, resourceId: id }));
      setLinkUrl("");
      toast.success("Link added to the Library");
    } finally {
      setLinkBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (setOpen(o), o && setF(blankForm()))}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lesson ? "Edit lesson" : "New lesson"}</DialogTitle>
          <DialogDescription>A lesson can have text, a file or video from the Library, or both.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            run(
              () => saveLesson(packageId, lesson?.id ?? null, { title: f.title, body: f.body, resourceId: f.resourceId || null, sectionId: f.sectionId || null }),
              lesson ? "Lesson saved" : "Lesson added",
              (r) => r.ok && setOpen(false),
            );
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="ls-title">Lesson name</Label>
            <Input id="ls-title" required maxLength={150} placeholder="e.g. Your first relaxation" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          </div>
          {sections.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="ls-section">Section</Label>
              <select id="ls-section" className={selectCls} value={f.sectionId} onChange={(e) => setF({ ...f, sectionId: e.target.value })}>
                <option value="">No section</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="ls-resource">Video, audio or file from the Library (optional)</Label>
            <select id="ls-resource" className={selectCls} value={f.resourceId} onChange={(e) => setF({ ...f, resourceId: e.target.value })}>
              <option value="">None</option>
              {options.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.kind.toLowerCase()})
                </option>
              ))}
            </select>
            <div className="space-y-2 rounded-lg bg-stone-50 p-3">
              <p className="text-xs text-stone-500">Or add something new (it&apos;s saved in the Library too):</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" disabled={uploadPct !== null} onClick={() => fileRef.current?.click()}>
                  <Upload className="mr-1.5 h-3.5 w-3.5" /> {uploadPct !== null ? `Uploading… ${Math.round(uploadPct)}%` : "Upload a file"}
                </Button>
                <span className="text-xs text-stone-500">Audio, PDF, Word or image</span>
                <input ref={fileRef} type="file" accept={ACCEPT_FILES} className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
              </div>
              {uploadPct !== null && <Progress value={uploadPct} className="h-1.5" />}
              <div className="flex gap-2">
                <Input
                  aria-label="Video or web link"
                  placeholder="Paste a YouTube or web link"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="h-9 bg-white text-sm"
                />
                <Button type="button" variant="outline" size="sm" className="h-9 shrink-0" disabled={!/^https?:\/\/\S+\.\S+/.test(linkUrl.trim()) || linkBusy} onClick={addLink}>
                  <Link2 className="mr-1.5 h-3.5 w-3.5" /> {linkBusy ? "Adding…" : "Add link"}
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ls-body">Lesson text (optional)</Label>
            <Textarea
              id="ls-body"
              rows={8}
              maxLength={20000}
              placeholder="Explain the lesson, give instructions or an exercise…"
              value={f.body}
              onChange={(e) => setF({ ...f, body: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={pending} className="w-full bg-sage-600 hover:bg-sage-700">
            {pending ? "Saving…" : lesson ? "Save lesson" : "Add lesson"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SectionNameDialog({ packageId, section, trigger }: { packageId: string; section?: SectionRow; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(section?.title ?? "");
  const { pending, run } = useAction();
  return (
    <Dialog open={open} onOpenChange={(o) => (setOpen(o), o && setTitle(section?.title ?? ""))}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{section ? "Rename section" : "New section"}</DialogTitle>
          <DialogDescription>Sections group lessons, e.g. &quot;Week 1: Getting started&quot;.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => saveLessonSection(packageId, { id: section?.id, title }), section ? "Section renamed" : "Section added", (r) => r.ok && setOpen(false));
          }}
        >
          <Input required maxLength={150} aria-label="Section name" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Button type="submit" disabled={pending} className="w-full bg-sage-600 hover:bg-sage-700">
            {pending ? "Saving…" : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function LessonsEditor({ packageId, sections, lessons, library }: { packageId: string; sections: SectionRow[]; lessons: LessonRow[]; library: LibraryOption[] }) {
  const { pending, run } = useAction();
  const groups: { section: SectionRow | null; lessons: LessonRow[] }[] = [
    ...sections.map((s) => ({ section: s, lessons: lessons.filter((l) => l.sectionId === s.id) })),
    { section: null, lessons: lessons.filter((l) => !l.sectionId || !sections.some((s) => s.id === l.sectionId)) },
  ];
  let number = 0;

  return (
    <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-stone-800">Lessons ({lessons.length})</h2>
          <p className="text-sm text-stone-500">Learners take them in this order. Each lesson opens when the one before is done.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SectionNameDialog
            packageId={packageId}
            trigger={
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Section
              </Button>
            }
          />
          <LessonDialog
            packageId={packageId}
            sections={sections}
            library={library}
            sectionId={sections[sections.length - 1]?.id ?? null}
            trigger={
              <Button className="bg-sage-600 hover:bg-sage-700">
                <Plus className="mr-2 h-4 w-4" /> Lesson
              </Button>
            }
          />
        </div>
      </div>

      {lessons.length === 0 && sections.length === 0 && (
        <p className="rounded-xl bg-stone-50 p-4 text-sm text-stone-500">
          No lessons yet. Add sections (optional) to group lessons, then add lessons with text and Library files or videos.
        </p>
      )}

      {groups.map(({ section, lessons: list }, gi) => {
        if (!section && list.length === 0) return null;
        return (
          <div key={section?.id ?? "none"} className="space-y-2 rounded-xl ring-1 ring-stone-100">
            <div className="flex items-center gap-2 rounded-t-xl bg-stone-50 px-3 py-2">
              <p className="flex-1 font-medium text-stone-800">{section ? section.title : sections.length ? "Lessons without a section" : "Lessons"}</p>
              {section && (
                <>
                  <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Move section up" disabled={pending || gi === 0} onClick={() => run(() => moveLessonSection(section.id, -1))}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    aria-label="Move section down"
                    disabled={pending || gi === sections.length - 1}
                    onClick={() => run(() => moveLessonSection(section.id, 1))}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <SectionNameDialog
                    packageId={packageId}
                    section={section}
                    trigger={
                      <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Rename section">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <ConfirmButton
                    title="Delete this section?"
                    description="Its lessons are kept, without a section."
                    onConfirm={() => run(() => deleteLessonSection(section.id), "Section deleted")}
                  />
                </>
              )}
            </div>
            <div className="space-y-2 px-3 pb-3">
              {list.length === 0 && <p className="text-sm text-stone-500">No lessons in this section yet.</p>}
              {list.map((l, i) => {
                number += 1;
                const Icon = l.resource ? KIND_ICON[l.resource.kind as keyof typeof KIND_ICON] : null;
                return (
                  <div key={l.id} className="flex items-start gap-3 rounded-lg p-2 ring-1 ring-stone-200">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-50 text-xs font-medium text-sage-800">{number}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-stone-800">{l.title}</p>
                      {l.resource && (
                        <p className="flex items-center gap-1 text-xs text-stone-500">
                          {Icon && <Icon className="h-3.5 w-3.5" />} {l.resource.title}
                        </p>
                      )}
                      {l.body && <p className="line-clamp-2 text-sm text-stone-500">{l.body}</p>}
                      {!l.resource && !l.body && <p className="text-xs text-amber-700">Empty lesson: add text or a Library item.</p>}
                    </div>
                    <div className="flex shrink-0 items-center">
                      <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Move lesson up" disabled={pending || i === 0} onClick={() => run(() => moveLesson(l.id, -1))}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        aria-label="Move lesson down"
                        disabled={pending || i === list.length - 1}
                        onClick={() => run(() => moveLesson(l.id, 1))}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <LessonDialog
                        packageId={packageId}
                        sections={sections}
                        library={library}
                        lesson={l}
                        trigger={
                          <Button size="icon" variant="ghost" className="h-8 w-8" aria-label={`Edit ${l.title}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <ConfirmButton title="Delete this lesson?" description="Learners' progress on it is removed too." onConfirm={() => run(() => deleteLesson(l.id), "Lesson deleted")} />
                    </div>
                  </div>
                );
              })}
              {section && (
                <LessonDialog
                  packageId={packageId}
                  sections={sections}
                  library={library}
                  sectionId={section.id}
                  trigger={
                    <button type="button" className="flex items-center gap-1 px-1 text-sm text-sage-700 hover:underline">
                      <Plus className="h-4 w-4" /> Add lesson to {section.title}
                    </button>
                  }
                />
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

// ---------- Certificates ----------

export function LearningCertificateUpload({ enrollmentId, hasCertificate }: { enrollmentId: string; hasCertificate: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [pct, setPct] = useState<number | null>(null);
  const { pending, run } = useAction();

  const onFile = async (file: File) => {
    try {
      setPct(0);
      const up = await uploadFile(file, { purpose: "certificate", filename: file.name, onProgress: setPct });
      run(() => setLearningCertificate(enrollmentId, { key: up.key, name: file.name, contentType: up.contentType }), "Certificate uploaded. The learner has been emailed.");
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
            <a href={`/api/files/learning-certificate/${enrollmentId}`} target="_blank" rel="noreferrer">
              <Award className="mr-1.5 h-3.5 w-3.5 text-amber-600" /> View certificate
            </a>
          </Button>
          <ConfirmButton
            label="Remove"
            title="Remove this certificate?"
            description="The learner will no longer see it."
            onConfirm={() => run(() => removeLearningCertificate(enrollmentId), "Certificate removed")}
          />
        </>
      )}
      <Button size="sm" variant={hasCertificate ? "ghost" : "outline"} disabled={pending || pct !== null} onClick={() => ref.current?.click()}>
        <Upload className="mr-1.5 h-3.5 w-3.5" /> {hasCertificate ? "Replace" : "Upload certificate"}
      </Button>
      <input
        ref={ref}
        type="file"
        accept="application/pdf,.pdf,image/*,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
      {pct !== null && <Progress value={pct} className="h-1.5 w-24" />}
    </div>
  );
}

