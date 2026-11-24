"use client";

import { useRef, useState } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadFile } from "@/lib/upload-client";
import { setCourseCover } from "@/app/admin/_actions/courses";
import { setLearningPackageCover } from "@/app/admin/_actions/learning";
import { setSessionCover } from "@/app/admin/_actions/session-services";
import { setPromotionImage } from "@/app/admin/_actions/promotions";
import { useAction } from "./use-action";
import { friendlyError } from "@/lib/friendly-error";

/** Cover photo shown on the website (course cards and pages, or the promotion pop-up and section). */
export function CoverUpload({ kind, id, url }: { kind: "course" | "package" | "session" | "promotion"; id: string; url: string | null }) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const { pending, run } = useAction();
  const save = kind === "course" ? setCourseCover : kind === "session" ? setSessionCover : kind === "promotion" ? setPromotionImage : setLearningPackageCover;

  async function pick(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please choose a JPG, PNG or WebP photo.");
      return;
    }
    try {
      setProgress(0);
      const { key } = await uploadFile(file, { purpose: "cover", filename: file.name, onProgress: setProgress });
      run(() => save(id, key), "Cover photo saved");
    } catch (e) {
      toast.error(friendlyError(e, "Upload failed."));
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  }

  const busy = pending || progress !== null;
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sage-50 ring-1 ring-stone-200">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Cover photo" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-8 w-8 text-sage-400" />
        )}
      </div>
      <div className="space-y-2">
        <p className="text-sm text-stone-600">{kind === "promotion" ? "Photo for the pop-up and the home page section" : "Cover photo for the website"} (JPG, PNG or WebP, wide works best).</p>
        <div className="flex flex-wrap gap-2">
          <input suppressHydrationWarning ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} />
          <Button size="sm" variant="outline" disabled={busy} onClick={() => input.current?.click()}>
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            {progress !== null ? `Uploading ${progress}%` : url ? "Change photo" : "Add photo"}
          </Button>
          {url && (
            <Button size="sm" variant="ghost" className="text-stone-500" disabled={busy} onClick={() => run(() => save(id, null), "Cover photo removed")}>
              <X className="mr-1.5 h-3.5 w-3.5" /> Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
