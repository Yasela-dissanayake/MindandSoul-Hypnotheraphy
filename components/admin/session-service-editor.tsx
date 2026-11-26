"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { navigateTo } from "@/components/navigation-progress";
import Link from "next/link";
import { ArrowDown, ArrowUp, ExternalLink, ImageIcon, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/lib/upload-client";
import { friendlyError } from "@/lib/friendly-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createSessionService,
  deleteSessionOption,
  deleteSessionService,
  moveSessionOption,
  moveSessionService,
  saveSessionOption,
  updateSessionService,
} from "@/app/admin/_actions/session-services";
import { areaHref, areaOf, serviceEditHref } from "@/lib/session-areas";
import { useAction } from "./use-action";
import { ConfirmButton } from "./confirm-button";
import { PageTextEditor } from "./page-text-editor";
import { UploadProgress } from "@/components/upload-progress";

const selectCls = "h-10 w-full rounded-md border border-input bg-white px-3 text-sm";

export type EditorService = {
  id: string;
  slug: string;
  title: string;
  category: "HYPNOTHERAPY" | "REIKI_HEALING" | "ANIMAL_REIKI";
  tagline: string;
  summary: string;
  body: string;
  details: string;
  highlights: string;
  planService: "HYPNOTHERAPY" | "REIKI_HEALING" | "ANIMAL_REIKI";
  minutes: number | null;
  lengthLabel: string;
  inPerson: boolean;
  online: boolean;
  enquiryOnly: boolean;
  published: boolean;
  clients: number; // clients who bought it (shown in the delete warning)
};
export type EditorOption = {
  id: string;
  title: string;
  sessions: number;
  price: number;
  priceAed: number | null;
  mode: "IN_PERSON" | "DISTANCE" | null;
  note: string;
  recorded: boolean;
};

const TAB_PATH = { HYPNOTHERAPY: "/hypnotherapy", REIKI_HEALING: "/reiki-healing", ANIMAL_REIKI: "/reiki-healing" } as const;

const CATEGORY_LABEL: Record<EditorService["category"], string> = {
  HYPNOTHERAPY: "Clinical Hypnotherapy",
  REIKI_HEALING: "Reiki Energy Healing",
  ANIMAL_REIKI: "Animal Reiki & Communication",
};

/** "New session": opens the full form on its own page. */
export function NewSessionServiceButton({ categories }: { categories: EditorService["category"][] }) {
  return (
    <Button asChild className="bg-sage-600 hover:bg-sage-700">
      <Link href={`${areaHref(areaOf(categories[0]))}/services/new`}>
        <Plus className="mr-2 h-4 w-4" /> New session
      </Link>
    </Button>
  );
}

type NewPrice = { key: number; title: string; sessions: string; price: string; priceAed: string; mode: "" | "IN_PERSON" | "DISTANCE"; note: string };

/**
 * The "New session" page: everything in one form (prices and packages, details and page text, cover photo),
 * with one Save button at the bottom. Nothing is created until it's saved.
 */
export function NewSessionServiceForm({ categories }: { categories: EditorService["category"][] }) {
  const router = useRouter();
  const { pending, run } = useAction();
  const [f, setF] = useState({
    title: "",
    category: categories[0],
    planService: categories[0] as EditorService["planService"],
    tagline: "",
    summary: "",
    body: "",
    details: "",
    highlights: "",
    minutes: "",
    lengthLabel: "1 hour",
    inPerson: true,
    online: true,
    enquiryOnly: false,
    published: false,
  });
  const [prices, setPrices] = useState<NewPrice[]>([{ key: 1, title: "Single session", sessions: "1", price: "", priceAed: "", mode: "", note: "" }]);
  const [cover, setCover] = useState<{ key: string; preview: string } | null>(null);
  const [uploading, setUploading] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((x) => ({ ...x, [k]: e.target.value, ...(k === "category" ? { planService: e.target.value as EditorService["planService"] } : {}) }));
  const tick = (k: "inPerson" | "online" | "enquiryOnly" | "published") => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.checked });
  const setPrice = (key: number, k: keyof NewPrice) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setPrices((list) => list.map((p) => (p.key === key ? { ...p, [k]: e.target.value } : p)));
  const addPrice = () =>
    setPrices((list) => {
      const n = list.length ? Math.max(...list.map((p) => Number(p.sessions) || 1)) : 0;
      const sessions = n < 3 ? 3 : n + 2;
      return [...list, { key: Date.now(), title: `${sessions}-session package`, sessions: String(sessions), price: "", priceAed: "", mode: "", note: "" }];
    });

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

  const num = (v: string) => (v.trim() === "" ? Number.NaN : Number(v));
  const save = () =>
    run(
      () =>
        createSessionService({
          title: f.title,
          category: f.category,
          planService: f.planService,
          tagline: f.tagline,
          summary: f.summary,
          body: f.body,
          details: f.details,
          highlights: f.highlights,
          minutes: f.minutes.trim() === "" ? null : Math.round(Number(f.minutes)),
          lengthLabel: f.lengthLabel,
          inPerson: f.inPerson,
          online: f.online,
          enquiryOnly: f.enquiryOnly,
          published: f.published,
          imageKey: cover?.key ?? null,
          options: prices.map((p) => ({
            title: p.title,
            sessions: Math.round(num(p.sessions)) || 0,
            price: num(p.price),
            priceAed: num(p.priceAed),
            mode: p.mode || null,
            note: p.note,
          })),
        }),
      f.published ? "Session saved and shown on the website" : "Session saved (hidden from the website)",
      (r) => r.ok && router.push(serviceEditHref((r as { data?: { id: string } }).data?.id ?? "", f.category)),
    );

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      {/* 1. Details and page text */}
      <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200 sm:p-6">
        <h2 className="font-serif text-xl text-stone-800">Details</h2>
        <div className="grid gap-4 sm:grid-cols-[1fr_16rem]">
          <div className="space-y-1.5">
            <Label htmlFor="ns-title">Name</Label>
            <Input id="ns-title" required maxLength={150} placeholder="e.g. Inner Child Healing" value={f.title} onChange={set("title")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ns-cat">Website tab</Label>
            <select suppressHydrationWarning id="ns-cat" className={selectCls} value={f.category} onChange={set("category")} disabled={categories.length === 1}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ns-tagline">Tagline</Label>
          <Input id="ns-tagline" maxLength={200} placeholder="e.g. Break Free from Smoking. Build a Healthier Future." value={f.tagline} onChange={set("tagline")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ns-summary">Short summary</Label>
          <Input id="ns-summary" maxLength={300} placeholder="One or two lines on the tab page's card" value={f.summary} onChange={set("summary")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ns-body">Page text</Label>
          <PageTextEditor id="ns-body" rows={16} value={f.body} onChange={(body) => setF((x) => ({ ...x, body }))} />
        </div>
        <details className="space-y-3 rounded-lg px-3 py-2 ring-1 ring-stone-200">
          <summary className="cursor-pointer text-sm font-medium text-stone-700">Older fields (only shown when the page text is empty)</summary>
          <div className="mt-3 space-y-1.5">
            <Label htmlFor="ns-details">About this session</Label>
            <Textarea id="ns-details" rows={5} maxLength={10000} value={f.details} onChange={set("details")} />
          </div>
          <div className="mt-3 space-y-1.5">
            <Label htmlFor="ns-highlights">How it can help / areas of support</Label>
            <Textarea id="ns-highlights" rows={4} maxLength={5000} placeholder="One point per line" value={f.highlights} onChange={set("highlights")} />
          </div>
        </details>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="ns-minutes">Booking length (minutes)</Label>
            <Input id="ns-minutes" type="number" min={15} max={480} step={5} placeholder="Calendar default" value={f.minutes} onChange={set("minutes")} />
            <p className="text-xs text-stone-500">How long it blocks in your calendar. Empty = your normal length.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ns-length">Length shown on the website</Label>
            <Input id="ns-length" maxLength={60} placeholder="e.g. 1 hour (empty = not shown)" value={f.lengthLabel} onChange={set("lengthLabel")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ns-plan">Client plan type</Label>
            <select suppressHydrationWarning id="ns-plan" className={selectCls} value={f.planService} onChange={set("planService")}>
              <option value="HYPNOTHERAPY">Hypnotherapy</option>
              <option value="REIKI_HEALING">Reiki / energy healing</option>
              <option value="ANIMAL_REIKI">Animal Reiki</option>
            </select>
            <p className="text-xs text-stone-500">Where these clients appear on your Sessions page.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-700">
          <label className="flex items-center gap-2">
            <input suppressHydrationWarning type="checkbox" checked={f.inPerson} onChange={tick("inPerson")} /> In person (Perth)
          </label>
          <label className="flex items-center gap-2">
            <input suppressHydrationWarning type="checkbox" checked={f.online} onChange={tick("online")} /> Online / distance
          </label>
          <label className="flex items-center gap-2">
            <input suppressHydrationWarning type="checkbox" checked={f.enquiryOnly} onChange={tick("enquiryOnly")} /> Enquiry only (no online booking)
          </label>
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
            <p className="text-sm text-stone-600">Shown on its card and page (JPG, PNG or WebP, wide works best). Optional.</p>
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

      {/* 3. Prices and packages (last, just above Save) */}
      {!f.enquiryOnly && (
        <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200 sm:p-6">
          <div>
            <h2 className="font-serif text-xl text-stone-800">Prices and packages</h2>
            <p className="text-sm text-stone-500">Visitors in the UAE see the AED price; everyone else sees AUD. A package&apos;s other sessions are booked by the client from their private space.</p>
          </div>
          <ul className="space-y-3">
            {prices.map((p, i) => (
              <li key={p.key} className="space-y-3 rounded-xl bg-stone-50 p-4 ring-1 ring-stone-200">
                <div className="grid gap-3 sm:grid-cols-[1fr_7rem]">
                  <div className="space-y-1">
                    <Label htmlFor={`np-title-${p.key}`}>Name</Label>
                    <Input id={`np-title-${p.key}`} required maxLength={80} placeholder="e.g. Single session, 3-session package" value={p.title} onChange={setPrice(p.key, "title")} className="bg-white" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`np-sessions-${p.key}`}>Sessions</Label>
                    <Input id={`np-sessions-${p.key}`} required type="number" min={1} max={50} value={p.sessions} onChange={setPrice(p.key, "sessions")} className="bg-white" />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label htmlFor={`np-aud-${p.key}`}>Price (AUD)</Label>
                    <Input id={`np-aud-${p.key}`} required type="number" min={0.5} step={0.01} placeholder="e.g. 140" value={p.price} onChange={setPrice(p.key, "price")} className="bg-white" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`np-aed-${p.key}`}>Price (AED)</Label>
                    <Input id={`np-aed-${p.key}`} required type="number" min={2} step={0.01} placeholder="e.g. 350" value={p.priceAed} onChange={setPrice(p.key, "priceAed")} className="bg-white" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`np-mode-${p.key}`}>For</Label>
                    <select suppressHydrationWarning id={`np-mode-${p.key}`} className={selectCls} value={p.mode} onChange={setPrice(p.key, "mode")}>
                      <option value="">In person and online</option>
                      <option value="IN_PERSON">In person only</option>
                      <option value="DISTANCE">Online / distance only</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={`np-note-${p.key}`}>Note (optional)</Label>
                    <Input id={`np-note-${p.key}`} maxLength={200} placeholder="e.g. Recommended for IBS · completed within 6 weeks" value={p.note} onChange={setPrice(p.key, "note")} className="bg-white" />
                  </div>
                  {prices.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-stone-500 hover:text-red-700"
                      onClick={() => setPrices((list) => list.filter((x) => x.key !== p.key))}
                      aria-label={`Remove price ${i + 1}`}
                    >
                      <Trash2 className="mr-1.5 h-4 w-4" /> Remove
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <Button type="button" variant="outline" onClick={addPrice}>
            <Plus className="mr-2 h-4 w-4" /> Add another price or package
          </Button>
        </section>
      )}

      {/* Save */}
      <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-stone-200 bg-stone-50/95 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between md:-mx-8 md:px-8">
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input suppressHydrationWarning type="checkbox" checked={f.published} onChange={tick("published")} /> Show on the website straight away
        </label>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending || uploading !== null} className="min-w-32 bg-sage-600 hover:bg-sage-700">
            {pending ? "Saving…" : "Save session"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export function MoveServiceButtons({ id, first, last }: { id: string; first: boolean; last: boolean }) {
  const { pending, run } = useAction();
  return (
    <span className="inline-flex">
      <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending || first} onClick={() => run(() => moveSessionService(id, -1))} aria-label="Move up">
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending || last} onClick={() => run(() => moveSessionService(id, 1))} aria-label="Move down">
        <ArrowDown className="h-4 w-4" />
      </Button>
    </span>
  );
}

/** Deletes a service after an "Are you sure?" that says what happens to clients who already bought it. */
export function DeleteServiceButton({ id, title, clients, icon, onDeleted }: { id: string; title: string; clients: number; icon?: boolean; onDeleted?: () => void }) {
  const { run } = useAction();
  const description =
    clients > 0
      ? `It disappears from the website and its prices are removed. ${clients} client${clients === 1 ? " has" : "s have"} bought it: they keep their plan, past bookings and payments, but can't book any remaining sessions of it online. This can't be undone. To only take it off the website, use "Hide from the website" instead.`
      : "It disappears from the website and its prices are removed. This can't be undone.";
  return (
    <ConfirmButton
      icon={icon}
      label={icon ? `Delete ${title}` : "Delete"}
      title={`Delete "${title}"?`}
      description={description}
      onConfirm={() => run(() => deleteSessionService(id), "Deleted", (r) => r.ok && onDeleted?.())}
    />
  );
}

/** Name, text, length, in person / online and whether it's on the website. */
export function SessionServiceForm({ service }: { service: EditorService }) {
  const [f, setF] = useState({ ...service, minutes: service.minutes === null ? "" : String(service.minutes) });
  const { pending, run } = useAction();
  const router = useRouter();
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const tick = (k: "inPerson" | "online" | "enquiryOnly" | "published") => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.checked });
  const save = (published = f.published) =>
    run(
      () =>
        updateSessionService(service.id, {
          title: f.title,
          category: f.category,
          tagline: f.tagline,
          summary: f.summary,
          body: f.body,
          details: f.details,
          highlights: f.highlights,
          planService: f.planService,
          minutes: f.minutes.trim() === "" ? null : Math.round(Number(f.minutes)),
          lengthLabel: f.lengthLabel,
          inPerson: f.inPerson,
          online: f.online,
          enquiryOnly: f.enquiryOnly,
          published,
        }),
      published && !service.published ? "Saved and shown on the website" : !published && service.published ? "Hidden from the website" : "Saved",
      (r) => {
        if (!r.ok) return;
        setF((x) => ({ ...x, published }));
        // Back to its list (the website tab it's under now, if that was changed).
        navigateTo(router, `${areaHref(areaOf(f.category))}#services`);
      },
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl text-stone-800">Details</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${f.published ? "bg-sage-100 text-sage-800" : "bg-amber-100 text-amber-900"}`}>
          {f.published ? "On the website" : "Hidden"}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_16rem]">
        <div className="space-y-1.5">
          <Label htmlFor="ss-title">Name</Label>
          <Input id="ss-title" maxLength={150} value={f.title} onChange={set("title")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ss-category">Website tab</Label>
          <select suppressHydrationWarning id="ss-category" className={selectCls} value={f.category} onChange={set("category")}>
            <option value="HYPNOTHERAPY">Clinical Hypnotherapy</option>
            <option value="REIKI_HEALING">Reiki Energy Healing</option>
            <option value="ANIMAL_REIKI">Reiki Energy Healing · Animal</option>
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ss-tagline">Tagline</Label>
        <Input id="ss-tagline" maxLength={200} placeholder="e.g. Break Free from Smoking. Build a Healthier Future." value={f.tagline} onChange={set("tagline")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ss-summary">Short summary</Label>
        <Input id="ss-summary" maxLength={300} placeholder="One or two lines on the tab page's card" value={f.summary} onChange={set("summary")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ss-body">Page text</Label>
        <PageTextEditor id="ss-body" rows={22} value={f.body} onChange={(body) => setF((x) => ({ ...x, body }))} />
      </div>
      <details className="space-y-3 rounded-lg px-3 py-2 ring-1 ring-stone-200">
        <summary className="cursor-pointer text-sm font-medium text-stone-700">Older fields (only shown when the page text is empty)</summary>
        <div className="mt-3 space-y-1.5">
          <Label htmlFor="ss-details">About this session</Label>
          <Textarea id="ss-details" rows={6} maxLength={10000} value={f.details} onChange={set("details")} />
        </div>
        <div className="mt-3 space-y-1.5">
          <Label htmlFor="ss-highlights">How it can help / areas of support</Label>
          <Textarea id="ss-highlights" rows={5} maxLength={5000} placeholder={"One point per line"} value={f.highlights} onChange={set("highlights")} />
        </div>
      </details>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="ss-minutes">Booking length (minutes)</Label>
          <Input id="ss-minutes" type="number" min={15} max={480} step={5} placeholder="Calendar default" value={f.minutes} onChange={set("minutes")} />
          <p className="text-xs text-stone-500">How long it blocks in your calendar. Empty = your normal length.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ss-length">Length shown on the website</Label>
          <Input id="ss-length" maxLength={60} placeholder="e.g. 1 hour (empty = not shown)" value={f.lengthLabel} onChange={set("lengthLabel")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ss-plan">Client plan type</Label>
          <select suppressHydrationWarning id="ss-plan" className={selectCls} value={f.planService} onChange={set("planService")}>
            <option value="HYPNOTHERAPY">Hypnotherapy</option>
            <option value="REIKI_HEALING">Reiki / energy healing</option>
            <option value="ANIMAL_REIKI">Animal Reiki</option>
          </select>
          <p className="text-xs text-stone-500">Where these clients appear on your Sessions page.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-700">
        <label className="flex items-center gap-2">
          <input suppressHydrationWarning type="checkbox" checked={f.inPerson} onChange={tick("inPerson")} /> In person (Perth)
        </label>
        <label className="flex items-center gap-2">
          <input suppressHydrationWarning type="checkbox" checked={f.online} onChange={tick("online")} /> Online / distance
        </label>
        <label className="flex items-center gap-2">
          <input suppressHydrationWarning type="checkbox" checked={f.enquiryOnly} onChange={tick("enquiryOnly")} /> Enquiry only (no online booking)
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button disabled={pending} onClick={() => save()} className="bg-sage-600 hover:bg-sage-700">
          {pending ? "Saving…" : "Save"}
        </Button>
        {f.published ? (
          <Button variant="outline" disabled={pending} onClick={() => save(false)}>
            Hide from the website
          </Button>
        ) : (
          <Button variant="outline" disabled={pending} onClick={() => save(true)}>
            Show on the website
          </Button>
        )}
        {f.published && (
          <Button variant="ghost" asChild>
            <a href={`${TAB_PATH[f.category]}/${service.slug}`} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> View on website
            </a>
          </Button>
        )}
        <DeleteServiceButton id={service.id} title={service.title} clients={service.clients} onDeleted={() => navigateTo(router, `${areaHref(areaOf(service.category))}#services`)} />
      </div>
    </div>
  );
}

function OptionForm({ serviceId, option, onDone }: { serviceId: string; option: EditorOption | null; onDone: () => void }) {
  const [f, setF] = useState({
    title: option?.title ?? "",
    sessions: String(option?.sessions ?? 1),
    price: option ? String(option.price / 100) : "",
    priceAed: option?.priceAed ? String(option.priceAed / 100) : "",
    mode: option?.mode ?? "",
    note: option?.note ?? "",
    recorded: false, // the recorded-course option is no longer offered
  });
  const { pending, run } = useAction();
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="space-y-3 rounded-xl bg-stone-50 p-4 ring-1 ring-stone-200">
      <div className="grid gap-3 sm:grid-cols-[1fr_6rem]">
        <div className="space-y-1">
          <Label>Name</Label>
          <Input maxLength={80} placeholder='e.g. "5-session package"' value={f.title} onChange={set("title")} />
        </div>
        <div className="space-y-1">
          <Label>Sessions</Label>
          <Input type="number" min={1} max={50} value={f.sessions} onChange={set("sessions")} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label>Price (AUD)</Label>
          <Input type="number" min={0} step={0.01} value={f.price} onChange={set("price")} />
        </div>
        <div className="space-y-1">
          <Label>Price (AED)</Label>
          <Input type="number" required min={2} step={0.01} placeholder="e.g. 350" value={f.priceAed} onChange={set("priceAed")} />
        </div>
        <div className="space-y-1">
          <Label>For</Label>
          <select suppressHydrationWarning className={selectCls} value={f.mode} onChange={set("mode")}>
            <option value="">In person and online</option>
            <option value="IN_PERSON">In person only</option>
            <option value="DISTANCE">Online / distance only</option>
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <Label>Note (optional)</Label>
        <Input maxLength={200} placeholder="e.g. Recommended for IBS · completed within 6 weeks" value={f.note} onChange={set("note")} />
      </div>
      <div className="flex gap-2">
        <Button
          disabled={pending}
          className="bg-sage-600 hover:bg-sage-700"
          onClick={() =>
            run(
              () =>
                saveSessionOption(serviceId, option?.id ?? null, {
                  title: f.title,
                  sessions: Math.round(Number(f.sessions || 1)),
                  price: Number(f.price || 0),
                  priceAed: f.priceAed.trim() === "" ? null : Number(f.priceAed),
                  mode: f.mode === "" ? null : (f.mode as "IN_PERSON" | "DISTANCE"),
                  note: f.note,
                  recorded: f.recorded,
                }),
              "Price saved",
              (r) => r.ok && onDone(),
            )
          }
        >
          Save price
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

const fmt = (cents: number, cur: string) => `${cur} ${(cents / 100).toLocaleString("en-AU", { maximumFractionDigits: 2 })}`;

/** Single session and packages, each with an AUD and (optional) AED price. */
export function SessionOptionsEditor({ serviceId, options }: { serviceId: string; options: EditorOption[] }) {
  const [editing, setEditing] = useState<string | null>(null); // option id, "new", or null
  const { pending, run } = useAction();
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-serif text-xl text-stone-800">Prices and packages</h2>
          <p className="text-sm text-stone-500">Visitors in the UAE see the AED price; everyone else sees AUD. A package&apos;s other sessions are booked by the client from their private space.</p>
        </div>
        {editing !== "new" && (
          <Button variant="outline" onClick={() => setEditing("new")}>
            <Plus className="mr-2 h-4 w-4" /> Add price
          </Button>
        )}
      </div>
      {editing === "new" && <OptionForm serviceId={serviceId} option={null} onDone={() => setEditing(null)} />}
      {options.length === 0 && editing !== "new" && <p className="text-sm text-stone-500">No prices yet.</p>}
      <ul className="space-y-2">
        {options.map((o, i) =>
          editing === o.id ? (
            <li key={o.id}>
              <OptionForm serviceId={serviceId} option={o} onDone={() => setEditing(null)} />
            </li>
          ) : (
            <li key={o.id} className="flex flex-wrap items-center gap-3 rounded-xl px-4 py-3 ring-1 ring-stone-200">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-stone-800">
                  {o.title}{" "}
                  <span className="text-sm font-normal text-stone-500">
                    · {o.sessions} session{o.sessions === 1 ? "" : "s"}
                    {o.mode ? ` · ${o.mode === "IN_PERSON" ? "in person only" : "online only"}` : ""}
                  </span>
                </p>
                <p className="text-sm text-stone-600">
                  {fmt(o.price, "AUD")}
                  {o.priceAed ? ` / ${fmt(o.priceAed, "AED")}` : " (no AED price)"}
                </p>
                {o.note && <p className="text-xs text-stone-500">{o.note}</p>}
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending || i === 0} onClick={() => run(() => moveSessionOption(o.id, -1))} aria-label="Move up">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending || i === options.length - 1} onClick={() => run(() => moveSessionOption(o.id, 1))} aria-label="Move down">
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(o.id)} aria-label="Edit">
                <Pencil className="h-4 w-4" />
              </Button>
              <ConfirmButton
                icon
                title={`Remove "${o.title}"?`}
                description="It disappears from the website. Bookings already made are not affected."
                onConfirm={() => run(() => deleteSessionOption(o.id), "Removed")}
              />
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

