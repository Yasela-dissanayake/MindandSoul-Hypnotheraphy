"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, ImageIcon, Percent, Play, Tag, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/lib/upload-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { useAction } from "@/components/admin/use-action";
import { navigateTo } from "@/components/navigation-progress";
import {
  createPromotion,
  deletePromotion,
  endPromotion,
  restartPromotion,
  updatePromotion,
  type PromotionInput,
} from "@/app/admin/_actions/promotions";
import { friendlyError } from "@/lib/friendly-error";
import { UploadProgress } from "@/components/upload-progress";

export type PromoChoice = { value: string; title: string };
export type PromoChoices = { sessions: PromoChoice[]; classes: PromoChoice[]; courses: PromoChoice[] };

/**
 * Create or edit a promotion. When creating, the photo is chosen in the form too; afterwards the
 * Promotion page reloads and shows the new promotion. (When editing, the photo has its own box.)
 */
export function PromotionForm({ id, initial, choices }: { id?: string; initial?: PromotionInput; choices: PromoChoices }) {
  const router = useRouter();
  const { pending, run } = useAction();
  const blank: PromotionInput = { title: "", content: "", days: 7, link: "", free: false, discountPercent: null };
  const [f, setF] = useState<PromotionInput>(initial ?? blank);
  const kind = String(f.link ?? "").split(":")[0];
  // What the promotion does to the linked item's price.
  const [offer, setOffer] = useState<"none" | "discount" | "free">(initial?.free ? "free" : initial?.discountPercent ? "discount" : "none");
  const [pct, setPct] = useState(initial?.discountPercent ? String(initial.discountPercent) : "");
  const offerFields = () =>
    offer === "free" ? { free: true, discountPercent: null } : offer === "discount" ? { free: false, discountPercent: pct.trim() === "" ? "" : Number(pct) } : { free: false, discountPercent: null };
  // Photo for a new promotion: uploaded as soon as it's chosen, saved with the promotion.
  const fileInput = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<{ key: string; preview: string } | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  useEffect(() => () => void (photo && URL.revokeObjectURL(photo.preview)), [photo]);

  async function pickPhoto(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please choose a JPG, PNG or WebP photo.");
      return;
    }
    try {
      setProgress(0);
      const { key } = await uploadFile(file, { purpose: "cover", filename: file.name, onProgress: setProgress });
      setPhoto({ key, preview: URL.createObjectURL(file) });
    } catch (e) {
      toast.error(friendlyError(e, "Upload failed."));
    } finally {
      setProgress(null);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (progress !== null) return; // still uploading the photo
    if (offer === "discount" && !(Number(pct) >= 1 && Number(pct) <= 90)) {
      toast.error("Please enter the discount: a whole number from 1 to 90 (% off).");
      return;
    }
    const data = { ...f, ...offerFields() } as PromotionInput;
    if (id) run(() => updatePromotion(id, data), "Promotion saved", (r) => r.ok && navigateTo(router, "/admin/promotions"));
    else
      run(
        () => createPromotion({ ...data, imageKey: photo?.key ?? null }),
        "Promotion created. It's showing on the website now.",
        (r) => {
          if (!r.ok) return;
          // Back to the Promotion page, fresh, with the new promotion showing.
          setF(blank);
          setOffer("none");
          setPct("");
          setPhoto(null);
          if (window.location.pathname === "/admin/promotions") router.refresh();
          else navigateTo(router, "/admin/promotions");
        },
      );
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="promo-title">Title</Label>
        <Input id="promo-title" required maxLength={120} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Free Reiki taster session this month" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="promo-content">Content</Label>
        <Textarea
          id="promo-content"
          required
          rows={5}
          maxLength={4000}
          value={f.content}
          onChange={(e) => setF({ ...f, content: e.target.value })}
          placeholder="What's on offer, who it's for, and any dates or conditions. Line breaks are kept."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
        <div className="space-y-1.5">
          <Label htmlFor="promo-days">Show for (days)</Label>
          <Input
            id="promo-days"
            type="number"
            required
            min={1}
            max={365}
            value={String(f.days ?? "")}
            onChange={(e) => setF({ ...f, days: e.target.value as unknown as number })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="promo-link">Link to (optional)</Label>
          <select
            suppressHydrationWarning
            id="promo-link"
            value={f.link ?? ""}
            onChange={(e) => {
              setF({ ...f, link: e.target.value });
              if (!e.target.value) setOffer("none");
            }}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Not linked: just show the message</option>
            {choices.sessions.length > 0 && (
              <optgroup label="Sessions">
                {choices.sessions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.title}
                  </option>
                ))}
              </optgroup>
            )}
            {choices.classes.length > 0 && (
              <optgroup label="Classes">
                {choices.classes.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.title}
                  </option>
                ))}
              </optgroup>
            )}
            {choices.courses.length > 0 && (
              <optgroup label="Courses">
                {choices.courses.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.title}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <p className="text-xs text-stone-500">The linked item gets a button in the pop-up and is listed first on its page, with an offer badge.</p>
        </div>
      </div>
      {!id && (
        <div className="space-y-1.5">
          <Label>Photo (optional)</Label>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sage-50 ring-1 ring-stone-200">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo.preview} alt="Chosen photo" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-8 w-8 text-sage-400" aria-hidden />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-stone-600">Shown in the pop-up and the home page section (JPG, PNG or WebP, wide works best).</p>
              <div className="flex flex-wrap gap-2">
                <input
                  suppressHydrationWarning
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && pickPhoto(e.target.files[0])}
                />
                <Button type="button" size="sm" variant="outline" disabled={progress !== null || pending} onClick={() => fileInput.current?.click()}>
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  {progress !== null ? "Uploading…" : photo ? "Change photo" : "Add photo"}
                </Button>
                {photo && (
                  <Button type="button" size="sm" variant="ghost" className="text-stone-500" onClick={() => setPhoto(null)}>
                    <X className="mr-1.5 h-3.5 w-3.5" /> Remove
                  </Button>
                )}
              </div>
              {progress !== null && <UploadProgress pct={progress} label="Uploading photo…" />}
            </div>
          </div>
        </div>
      )}
      <fieldset className="space-y-2">
        <legend className="mb-1.5 text-sm font-medium text-stone-800">Price while it runs</legend>
        {!f.link && <p className="text-xs text-stone-500">Choose a session, class or course above to give a discount or make it free.</p>}
        <div className="grid gap-2 sm:grid-cols-3">
          {(
            [
              ["none", "Normal price", Tag, "Just promote it: the price doesn't change."],
              ["discount", "Discount", Percent, "Take a percentage off the price."],
              ["free", "Free", Gift, "People get it without paying."],
            ] as const
          ).map(([value, label, Icon, text]) => {
            const disabled = value !== "none" && !f.link;
            const on = offer === value;
            return (
              <label
                key={value}
                className={`flex cursor-pointer items-start gap-2.5 rounded-lg p-3 text-sm ring-1 transition ${
                  disabled ? "cursor-not-allowed bg-stone-50 text-stone-400 ring-stone-200" : on ? "bg-sage-50 text-stone-800 ring-2 ring-sage-500" : "bg-white text-stone-700 ring-stone-200 hover:ring-sage-300"
                }`}
              >
                <input suppressHydrationWarning type="radio" name="promo-offer" className="mt-1" disabled={disabled} checked={on} onChange={() => setOffer(value)} />
                <span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Icon className="h-4 w-4 text-sage-600" aria-hidden /> {label}
                  </span>
                  <span className="text-xs text-stone-500">{text}</span>
                </span>
              </label>
            );
          })}
        </div>
        {offer === "discount" && f.link && (
          <div className="space-y-2 rounded-lg bg-sage-50 p-3 ring-1 ring-sage-200">
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="promo-pct" className="text-sm">
                Discount
              </Label>
              <div className="relative w-28">
                <Input id="promo-pct" type="number" required min={1} max={90} step={1} value={pct} onChange={(e) => setPct(e.target.value)} placeholder="e.g. 20" className="bg-white pr-8" />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-500">%</span>
              </div>
              <span className="text-sm text-stone-600">off</span>
            </div>
            <p className="text-xs text-stone-600">
              {kind === "session"
                ? "Every price of this session is reduced (single session and packages), in AUD and AED."
                : kind === "class"
                  ? "The class price is reduced, in AUD and AED."
                  : "The course price is reduced, in AUD and AED."}{" "}
              The website shows the usual price crossed out next to the new one, and people pay the new price. Prices are rounded to a whole dollar / dirham.
            </p>
          </div>
        )}
        {offer === "free" && f.link && (
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-stone-700 ring-1 ring-amber-200">
            {kind === "session"
              ? "People book a single session without paying (one free booking per email). Packages keep their price."
              : kind === "class"
                ? "People join the class without paying. They get their account and login details by email, as with a paid place."
                : "People get the course without paying. They get their account and login details by email, as with a purchase."}
          </p>
        )}
      </fieldset>
      <Button type="submit" disabled={pending || progress !== null} className="bg-sage-600 hover:bg-sage-700">
        {pending ? "Saving…" : progress !== null ? "Uploading photo…" : id ? "Save changes" : "Create and show it now"}
      </Button>
    </form>
  );
}

/** End now / Run again / Delete. */
export function PromotionActions({ id, running, title, afterDelete }: { id: string; running: boolean; title: string; afterDelete?: string }) {
  const router = useRouter();
  const { pending, run } = useAction();
  return (
    <div className="flex flex-wrap items-center gap-2">
      {running ? (
        <ConfirmButton
          title={`Stop showing "${title}"?`}
          description="It disappears from the website straight away. You can run it again later."
          label="End now"
          confirmLabel="End now"
          onConfirm={() => run(() => endPromotion(id), "Promotion ended", (r) => r.ok && afterDelete && navigateTo(router, afterDelete))}
        />
      ) : (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => restartPromotion(id), "Promotion is showing again")}>
          <Play className="mr-1.5 h-3.5 w-3.5" /> Run again
        </Button>
      )}
      <ConfirmButton
        title={`Delete "${title}"?`}
        description="The promotion and its photo are removed for good."
        onConfirm={() => run(() => deletePromotion(id), "Promotion deleted", (r) => r.ok && afterDelete && navigateTo(router, afterDelete))}
      />
    </div>
  );
}
