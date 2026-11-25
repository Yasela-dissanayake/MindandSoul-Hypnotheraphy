"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Archive, ArchiveRestore, ArrowDown, ArrowUp, Award, ExternalLink, ImageIcon, Link2, Pencil, Plus, Upload, Video, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageTextEditor } from "./page-text-editor";
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
import { ACCEPT_FILES, KIND_LABEL, kindForFile, type KindId } from "@/lib/catalog";

const VIDEO_ACCEPT = "video/mp4,video/quicktime,video/webm,video/x-m4v,.mp4,.mov,.m4v,.webm";
import { ConfirmButton } from "./confirm-button";
import { useAction } from "./use-action";
import { cn } from "@/lib/utils";
import { friendlyError } from "@/lib/friendly-error";
import { UploadProgress } from "@/components/upload-progress";

const selectCls = "h-10 w-full rounded-md border border-input bg-white px-3 text-sm";

// ---------- New course ----------

/**
 * The full "New course" form, laid out like the other new forms: details and page text, cover photo,
 * then the prices, with one Save button at the bottom. Nothing is created until it's saved.
 * Lessons are added on the course's page next; it goes on the website once it has lessons.
 */
export function NewPackageForm() {
  const router = useRouter();
  const [f, setF] = useState({ title: "", price: "", priceAed: "", summary: "", description: "" });
  const [cover, setCover] = useState<{ key: string; preview: string } | null>(null);
  const [uploading, setUploading] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const { pending, run } = useAction();
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  async function pickCover(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please choose a JPG, PNG or WebP photo.");
      return;
    }
    try {
      setUploading(0);
      const { key } = await uploadFile(file, { purpose: "cover", filename: file.name, onProgress: setUploading });
      setCover({ key, preview: URL.createObjectURL(file) });
    } catch (e) {
      toast.error(friendlyError(e, "The photo didn't upload. Please try again."));
    } finally {
      setUploading(null);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (uploading !== null) return toast.error("Please wait for the photo to finish uploading.");
        run(
          () =>
            createLearningPackage({
              title: f.title,
              summary: f.summary,
              description: f.description,
              price: Number(f.price),
              priceAed: Number(f.priceAed),
              imageKey: cover?.key ?? null,
            }),
          "Course saved. Now add its lessons.",
          (r) => r.ok && router.push(`/admin/courses/${(r.data as { id: string }).id}`),
        );
      }}
    >
      {/* 1. About the course */}
      <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200 sm:p-6">
        <h2 className="font-serif text-xl text-stone-800">About the course</h2>
        <div className="space-y-1.5">
          <Label htmlFor="nc-title">Course name</Label>
          <Input id="nc-title" required maxLength={150} placeholder="e.g. Self-Hypnosis for Better Sleep" value={f.title} onChange={set("title")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nc-summary">Short summary</Label>
          <Input id="nc-summary" maxLength={200} placeholder="One line shown on the course list" value={f.summary} onChange={set("summary")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nc-desc">About this course (website)</Label>
          <PageTextEditor id="nc-desc" rows={12} maxLength={10000} bookButtons={false} value={f.description} onChange={(description) => setF((x) => ({ ...x, description }))} />
          <p className="text-xs text-stone-500">What people will learn, who it&apos;s for, how long it takes…</p>
        </div>
      </section>

      {/* 2. Cover photo */}
      <section className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-stone-200 sm:p-6">
        <h2 className="font-serif text-xl text-stone-800">Cover photo</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sage-50 ring-1 ring-stone-200">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover.preview} alt="Cover photo" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-8 w-8 text-sage-400" aria-hidden />
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-stone-600">Shown on the course card and at the top of its page (JPG, PNG or WebP, wide works best).</p>
            {uploading !== null && <UploadProgress pct={uploading} label="Uploading photo…" />}
            <div className="flex flex-wrap gap-2">
              <input suppressHydrationWarning ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && pickCover(e.target.files[0])} />
              <Button type="button" size="sm" variant="outline" disabled={uploading !== null} onClick={() => fileInput.current?.click()}>
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                {uploading !== null ? "Uploading…" : cover ? "Change photo" : "Add photo"}
              </Button>
              {cover && (
                <Button type="button" size="sm" variant="ghost" className="text-stone-500" onClick={() => setCover(null)}>
                  <X className="mr-1.5 h-3.5 w-3.5" /> Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Price (last, just above Save) */}
      <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200 sm:p-6">
        <h2 className="font-serif text-xl text-stone-800">Price</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="nc-price">Price (AUD)</Label>
            <Input id="nc-price" required type="number" min={0.5} step={0.01} placeholder="e.g. 149" value={f.price} onChange={set("price")} />
            <p className="text-xs text-stone-500">Everyone outside the UAE pays this.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nc-price-aed">Price (AED)</Label>
            <Input id="nc-price-aed" required type="number" min={2} step={0.01} placeholder="e.g. 365" value={f.priceAed} onChange={set("priceAed")} />
            <p className="text-xs text-stone-500">Visitors in the UAE see and pay this.</p>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-stone-200 bg-stone-50/95 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between md:-mx-8 md:px-8">
        <p className="text-sm text-stone-500">Saved as a draft. Next you add the lessons, then put it on the website.</p>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending || uploading !== null} className="bg-sage-600 hover:bg-sage-700">
            {pending ? "Saving…" : "Save course"}
          </Button>
        </div>
      </div>
    </form>
  );
}

/**
 * Delete a course (as a bin icon on the Courses list, or a button on its page).
 * A course with learners can't be deleted (they'd lose what they paid for): the same button offers to archive it instead.
 */
export function DeleteCourseButton({
  id,
  title,
  learners,
  archived,
  icon,
  onDeleted,
}: {
  id: string;
  title: string;
  learners: number;
  archived: boolean;
  icon?: boolean;
  onDeleted?: () => void;
}) {
  const { run } = useAction();
  const label = icon ? `Delete ${title}` : "Delete";
  if (learners > 0)
    return (
      <ConfirmButton
        icon={icon}
        label={label}
        title={`"${title}" can't be deleted`}
        description={`${learners} learner${learners === 1 ? " has" : "s have"} this course, so deleting it would take away what they paid for. ${
          archived ? "It's already archived: hidden from the website, and new people can't buy it." : "Archive it instead: it's hidden from the website and nobody new can buy it, but current learners keep it."
        }`}
        confirmLabel={archived ? "OK" : "Archive instead"}
        onConfirm={() => !archived && run(() => setLearningPackageArchived(id, true), "Archived. It's hidden from the website.")}
      />
    );
  return (
    <ConfirmButton
      icon={icon}
      label={label}
      title={`Delete "${title}"?`}
      description="The course, its sections and lessons are deleted and it disappears from the website. Files and videos stay in your Library. This can't be undone."
      onConfirm={() => run(() => deleteLearningPackage(id), "Course deleted", (r) => r.ok && onDeleted?.())}
    />
  );
}

/** "New course": opens the full form on its own page. */
export function NewPackageDialog() {
  return (
    <Button asChild className="bg-sage-600 hover:bg-sage-700">
      <Link href="/admin/courses/new">
        <Plus className="mr-2 h-4 w-4" /> New course
      </Link>
    </Button>
  );
}

// ---------- Details ----------

type Details = { id: string; slug: string; title: string; summary: string; description: string; price: number; priceAed: number | null; published: boolean; archived: boolean; lessons: number; learners: number };

/**
 * A course's page in the admin: its details, then `children` (cover photo and lessons), then one bar at the
 * bottom with everything you can do: show it on the website, save, archive, delete.
 * The photo and lessons save as soon as they're changed; the details save with "Save changes".
 */
export function PackageDetailsForm({ pkg, children }: { pkg: Details; children?: React.ReactNode }) {
  const router = useRouter();
  const initial = {
    title: pkg.title,
    summary: pkg.summary,
    description: pkg.description,
    price: String(pkg.price / 100),
    priceAed: pkg.priceAed ? String(pkg.priceAed / 100) : "",
    published: pkg.published,
  };
  const [f, setF] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const dirty = JSON.stringify(f) !== JSON.stringify(saved);
  const { pending, run } = useAction();

  // Ask before leaving the page with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = () =>
    run(
      () =>
        updateLearningPackage(pkg.id, {
          title: f.title,
          summary: f.summary,
          description: f.description,
          price: Number(f.price),
          priceAed: f.priceAed.trim() === "" ? Number.NaN : Number(f.priceAed),
          published: f.published,
        }),
      f.published && !saved.published ? "Saved. It's on the website now." : !f.published && saved.published ? "Saved. It's hidden from the website." : "Saved",
      (r) => r.ok && setSaved(f),
    );

  return (
    <div className="space-y-6">
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
        <div className="grid gap-4 sm:grid-cols-[1fr_9rem_9rem]">
          <div className="space-y-1.5">
            <Label htmlFor="pd-title">Name</Label>
            <Input id="pd-title" maxLength={150} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pd-price">Price (AUD)</Label>
            <Input id="pd-price" type="number" min={0.5} step={0.01} value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pd-price-aed">Price (AED)</Label>
            <Input
              id="pd-price-aed"
              type="number"
              min={2}
              step={0.01}
              placeholder="Needed"
              value={f.priceAed}
              onChange={(e) => setF({ ...f, priceAed: e.target.value })}
              className={cn(!f.priceAed.trim() && "border-amber-300 bg-amber-50")}
            />
          </div>
        </div>
        {!pkg.priceAed && <p className="-mt-2 text-xs text-amber-700">Add the AED price: visitors in the UAE see and pay it.</p>}
        <div className="space-y-1.5">
          <Label htmlFor="pd-summary">Short summary</Label>
          <Input id="pd-summary" maxLength={200} placeholder="One line shown on the course list" value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pd-desc">About this course</Label>
          <PageTextEditor id="pd-desc" rows={10} maxLength={10000} bookButtons={false} value={f.description} onChange={(description) => setF((x) => ({ ...x, description }))} />
        </div>
      </section>

      {children}

      {/* Everything you can do with the course, in one place at the bottom. */}
      <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-stone-200 bg-stone-50/95 px-4 py-3 backdrop-blur md:-mx-8 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="space-y-0.5">
          {pkg.archived ? (
            <p className="text-sm text-stone-600">Archived: hidden from the website and from learners.</p>
          ) : (
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input suppressHydrationWarning type="checkbox" checked={f.published} onChange={(e) => setF((x) => ({ ...x, published: e.target.checked }))} /> Show on the website
              {saved.published && (
                <a href={`/courses/${pkg.slug}`} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-1 text-sage-700 hover:underline">
                  View <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </label>
          )}
          <p className={cn("text-xs", dirty ? "font-medium text-amber-700" : "text-stone-500")}>
            {dirty ? "You have unsaved changes." : "The photo and lessons save as soon as you change them."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DeleteCourseButton id={pkg.id} title={pkg.title} learners={pkg.learners} archived={pkg.archived} onDeleted={() => router.push("/admin/courses")} />
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            className="text-stone-600"
            onClick={() =>
              run(() => setLearningPackageArchived(pkg.id, !pkg.archived), pkg.archived ? "Restored" : "Archived. It's hidden from the website and learners.", (r) => r.ok && router.refresh())
            }
          >
            {pkg.archived ? <ArchiveRestore className="mr-1.5 h-4 w-4" /> : <Archive className="mr-1.5 h-4 w-4" />}
            {pkg.archived ? "Restore" : "Archive"}
          </Button>
          <Button disabled={pending || !dirty} onClick={save} className="min-w-36 bg-sage-600 hover:bg-sage-700">
            {pending ? "Saving…" : dirty ? "Save changes" : "Saved"}
          </Button>
        </div>
      </div>
    </div>
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
  const videoRef = useRef<HTMLInputElement>(null);
  const [uploadName, setUploadName] = useState("");
  const options = [...added, ...library.filter((r) => !added.some((a) => a.id === r.id))];

  const onFile = async (file: File) => {
    try {
      if (!kindForFile(file.type, file.name)) {
        toast.error("This file type isn't supported. Use a video, recording, PDF, Word document or photo.");
        return;
      }
      setUploadName(file.name);
      setUploadPct(0);
      const [id] = await uploadToLibrary([file], { onProgress: (_, pct) => setUploadPct(pct) });
      const title = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
      setAdded((a) => [{ id, title, kind: kindForFile(file.type, file.name) ?? "PDF" }, ...a]);
      // Use the file's name for the lesson if it has none yet.
      setF((x) => ({ ...x, resourceId: id, title: x.title.trim() ? x.title : title }));
      toast.success("Uploaded and added to the Library");
    } catch (e) {
      toast.error(friendlyError(e, "Upload failed."));
    } finally {
      setUploadPct(null);
      setUploadName("");
      if (fileRef.current) fileRef.current.value = "";
      if (videoRef.current) videoRef.current.value = "";
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
      <DialogContent className="max-h-[92vh] w-[calc(100vw-2rem)] max-w-3xl overflow-y-auto overflow-x-hidden sm:p-8">
        <DialogHeader>
          <DialogTitle>{lesson ? "Edit lesson" : "New lesson"}</DialogTitle>
          <DialogDescription>A lesson can have text, a file or video from the Library, or both.</DialogDescription>
        </DialogHeader>
        <form
          className="min-w-0 space-y-5"
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
              <select suppressHydrationWarning id="ls-section" className={selectCls} value={f.sectionId} onChange={(e) => setF({ ...f, sectionId: e.target.value })}>
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
            <select suppressHydrationWarning id="ls-resource" className={selectCls} value={f.resourceId} onChange={(e) => setF({ ...f, resourceId: e.target.value })}>
              <option value="">None</option>
              {options.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({KIND_LABEL[r.kind as KindId]?.toLowerCase() ?? r.kind.toLowerCase()})
                </option>
              ))}
            </select>
            <div className="space-y-2 rounded-lg bg-stone-50 p-3">
              <p className="text-xs text-stone-500">Or add something new (it&apos;s saved in the Library too):</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" disabled={uploadPct !== null} onClick={() => videoRef.current?.click()}>
                  <Video className="mr-1.5 h-3.5 w-3.5" /> Upload a recorded video
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={uploadPct !== null} onClick={() => fileRef.current?.click()}>
                  <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload a file
                </Button>
                <input suppressHydrationWarning ref={videoRef} type="file" accept={VIDEO_ACCEPT} className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
                <input suppressHydrationWarning ref={fileRef} type="file" accept={ACCEPT_FILES} className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
              </div>
              <p className="text-xs text-stone-500">Video: MP4, MOV or WebM, up to 2 GB. File: audio, PDF, Word or image, up to 200 MB.</p>
              {uploadPct !== null && (
                <UploadProgress pct={uploadPct} label={uploadName ? `Uploading ${uploadName}…` : undefined} />
              )}
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
              rows={12}
              maxLength={20000}
              placeholder="Explain the lesson, give instructions or an exercise…"
              value={f.body}
              onChange={(e) => setF({ ...f, body: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={pending || uploadPct !== null} className="w-full bg-sage-600 hover:bg-sage-700">
            {pending ? "Saving…" : uploadPct !== null ? "Wait for the upload to finish…" : lesson ? "Save lesson" : "Add lesson"}
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
                    <button suppressHydrationWarning type="button" className="flex items-center gap-1 px-1 text-sm text-sage-700 hover:underline">
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
      toast.error(friendlyError(e, "Upload failed."));
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
      <input suppressHydrationWarning
        ref={ref}
        type="file"
        accept="application/pdf,.pdf,image/*,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
      {pct !== null && <UploadProgress pct={pct} compact />}
    </div>
  );
}

