"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Play, Upload, X } from "lucide-react";
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
  const [f, setF] = useState<PromotionInput>(initial ?? { title: "", content: "", days: 7, link: "", free: false });
  const kind = String(f.link ?? "").split(":")[0];
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
    if (id) run(() => updatePromotion(id, f), "Promotion saved");
    else
      run(
        () => createPromotion({ ...f, imageKey: photo?.key ?? null }),
        "Promotion created. It's showing on the website now.",
        (r) => {
          if (!r.ok) return;
          // Back to the Promotion page, fresh, with the new promotion showing.
          setF({ title: "", content: "", days: 7, link: "", free: false });
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
            onChange={(e) => setF({ ...f, link: e.target.value, free: e.target.value ? f.free : false })}
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
      <label className={`flex items-start gap-2 rounded-lg p-3 text-sm ring-1 ${f.link ? "bg-sage-50 text-stone-700 ring-sage-200" : "bg-stone-50 text-stone-400 ring-stone-200"}`}>
        <input
          suppressHydrationWarning
          type="checkbox"
          className="mt-1"
          disabled={!f.link}
          checked={Boolean(f.free)}
          onChange={(e) => setF({ ...f, free: e.target.checked })}
        />
        <span>
          <span className="block font-medium">Free while the promotion runs</span>
          {kind === "session"
            ? "People book a single session without paying (one free booking per email). Packages keep their price."
            : kind === "class"
              ? "People join the class without paying. They get their account and login details by email, as with a paid place."
              : kind === "course"
                ? "People get the course without paying. They get their account and login details by email, as with a purchase."
                : "Choose a session, class or course above first."}
        </span>
      </label>
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
          onConfirm={() => run(() => endPromotion(id), "Promotion ended")}
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
