"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageIcon, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadFile } from "@/lib/upload-client";
import { friendlyError } from "@/lib/friendly-error";
import { PageTextEditor } from "./page-text-editor";
import { ClassDaysEditor, type ClassDay } from "./course-editor";
import { createCourse } from "@/app/admin/_actions/courses";
import { useAction } from "./use-action";
import { UploadProgress } from "@/components/upload-progress";

const selectCls = "h-10 w-full rounded-md border border-input bg-white px-3 text-sm";

/** "New class": opens the full form on its own page. */
export function NewCourseDialog() {
  return (
    <Button asChild variant="outline">
      <Link href="/admin/classes/new">
        <Plus className="mr-2 h-4 w-4" /> New class
      </Link>
    </Button>
  );
}

/**
 * The full "New class" form for Reiki Training, laid out like a class's edit page: details and website text,
 * class days, price and places, bundle, cover photo, with one Save button at the bottom.
 * Nothing is created until it's saved. Modules and material are added on the class's page afterwards.
 */
export function NewClassForm({ classOptions }: { classOptions: { id: string; title: string }[] }) {
  const router = useRouter();
  const { pending, run } = useAction();
  const [f, setF] = useState({
    title: "",
    track: "REIKI" as "REIKI" | "ANIMAL",
    summary: "",
    details: "",
    highlights: "",
    format: "",
    schedule: "",
    prerequisite: "",
    price: "",
    priceAed: "",
    seats: "",
    published: false,
  });
  const [dates, setDates] = useState<ClassDay[]>([]);
  const [includeIds, setIncludeIds] = useState<string[]>([]);
  const [cover, setCover] = useState<{ key: string; preview: string } | null>(null);
  const [uploading, setUploading] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }));
  const toggleInclude = (id: string) => setIncludeIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  const isBundle = includeIds.length > 0;

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
        if (isBundle && includeIds.length < 2) return toast.error("A bundle needs at least two classes. Tick one more, or untick it.");
        run(
          () =>
            createCourse({
              title: f.title,
              track: f.track,
              summary: f.summary,
              details: f.details,
              highlights: f.highlights,
              format: f.format,
              schedule: f.schedule,
              prerequisite: f.prerequisite,
              price: Number(f.price),
              priceAed: Number(f.priceAed),
              seats: f.seats.trim() === "" ? null : Math.max(0, Math.floor(Number(f.seats))),
              imageKey: cover?.key ?? null,
              dates: isBundle ? [] : dates,
              includeIds,
              published: f.published,
            }),
          f.published ? "Class saved and on the website. Add its modules and material next." : "Class saved (not on the website yet). Add its modules and material next.",
          (r) => {
            const id = r.ok ? (r.data as { id: string } | undefined)?.id : undefined;
            if (id) router.push(`/admin/classes/${id}`);
          },
        );
      }}
    >
      {/* 1. About the class */}
      <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200 sm:p-6">
        <h2 className="font-serif text-xl text-stone-800">About the class</h2>
        <div className="grid gap-4 sm:grid-cols-[1fr_16rem]">
          <div className="space-y-1.5">
            <Label htmlFor="nc-title">Class name</Label>
            <Input id="nc-title" required maxLength={150} placeholder="e.g. Reiki Level 2 – Okuden" value={f.title} onChange={set("title")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nc-track">Shown under (Reiki Training menu)</Label>
            <select suppressHydrationWarning id="nc-track" className={selectCls} value={f.track} onChange={set("track")}>
              <option value="REIKI">Reiki (Usui Reiki levels)</option>
              <option value="ANIMAL">Animal Reiki</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nc-summary">Short summary</Label>
          <Input id="nc-summary" maxLength={200} placeholder="One line shown on the class list" value={f.summary} onChange={set("summary")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nc-details">About this class (website)</Label>
          <PageTextEditor id="nc-details" rows={10} maxLength={10000} bookButtons={false} value={f.details} onChange={(details) => setF((x) => ({ ...x, details }))} />
          <p className="text-xs text-stone-500">What people will learn, who it&apos;s for, what&apos;s included…</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nc-highlights">What you&apos;ll explore</Label>
          <Textarea
            id="nc-highlights"
            rows={5}
            maxLength={5000}
            placeholder={"One point per line, e.g.\nThe history and origins of Reiki\nThe Five Reiki Principles"}
            value={f.highlights}
            onChange={set("highlights")}
          />
          <p className="text-xs text-stone-500">Shown as a tick list on the class page. Optional.</p>
        </div>
      </section>

      {/* 2. When and where */}
      <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200 sm:p-6">
        <h2 className="font-serif text-xl text-stone-800">When and where</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="nc-format">Where and how long</Label>
            <Input id="nc-format" maxLength={120} placeholder="e.g. Online live group class · 2 days, 3 hours each" value={f.format} onChange={set("format")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nc-prereq">Before you join (optional)</Label>
            <Input id="nc-prereq" maxLength={120} placeholder="e.g. Reiki Level 1" value={f.prerequisite} onChange={set("prerequisite")} />
            <p className="text-xs text-stone-500">The class people must have completed first. Buyers tick a box to confirm it.</p>
          </div>
        </div>
        {isBundle ? (
          <p className="rounded-xl bg-stone-50 p-4 text-sm text-stone-600 ring-1 ring-stone-200">
            This is a bundle, so the website shows the class days of the classes it includes.
          </p>
        ) : (
          <ClassDaysEditor dates={dates} onChange={setDates} />
        )}
        <div className="space-y-1.5">
          <Label htmlFor="nc-schedule">Note about dates (optional)</Label>
          <Input id="nc-schedule" maxLength={200} placeholder="e.g. More dates coming soon. Ask about a private class." value={f.schedule} onChange={set("schedule")} />
          <p className="text-xs text-stone-500">Shown under the class days, or on its own when there are no days yet.</p>
        </div>
      </section>

      {/* 3. Cover photo */}
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
            <p className="text-sm text-stone-600">Shown on the class card and at the top of its page (JPG, PNG or WebP, wide works best).</p>
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

      {/* 4. Price and places (last, just above Save) */}
      <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200 sm:p-6">
        <h2 className="font-serif text-xl text-stone-800">Price and places</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="nc-price">Price (AUD)</Label>
            <Input id="nc-price" required type="number" min={0.5} step={0.01} placeholder="e.g. 325" value={f.price} onChange={set("price")} />
            <p className="text-xs text-stone-500">Everyone outside the UAE.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nc-price-aed">Price (AED)</Label>
            <Input id="nc-price-aed" required type="number" min={2} step={0.01} placeholder="e.g. 800" value={f.priceAed} onChange={set("priceAed")} />
            <p className="text-xs text-stone-500">Visitors in the UAE.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nc-seats">Places</Label>
            <Input id="nc-seats" type="number" min={0} step={1} placeholder="No limit" value={f.seats} onChange={set("seats")} />
            <p className="text-xs text-stone-500">Goes down by one with each payment. Empty = no limit.</p>
          </div>
        </div>
        {classOptions.length >= 2 && (
          <details className="rounded-xl border border-stone-200 p-4" open={isBundle}>
            <summary className="cursor-pointer font-medium text-stone-800">Sell it as a bundle (optional)</summary>
            <p className="mt-2 text-xs text-stone-500">
              Tick two or more classes to sell this as a bundle (e.g. “Reiki Level 1 &amp; 2”). Buying it enrolls the student in each ticked class, so they get each
              class&apos;s own content and certificate.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {classOptions.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm text-stone-700">
                  <input suppressHydrationWarning type="checkbox" checked={includeIds.includes(c.id)} onChange={() => toggleInclude(c.id)} />
                  {c.title}
                </label>
              ))}
            </div>
          </details>
        )}
      </section>

      {/* Save */}
      <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-stone-200 bg-stone-50/95 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between md:-mx-8 md:px-8">
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input suppressHydrationWarning type="checkbox" checked={f.published} onChange={(e) => setF((x) => ({ ...x, published: e.target.checked }))} /> Show on the
          website straight away
        </label>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending || uploading !== null} className="bg-sage-600 hover:bg-sage-700">
            {pending ? "Saving…" : "Save class"}
          </Button>
        </div>
      </div>
    </form>
  );
}
