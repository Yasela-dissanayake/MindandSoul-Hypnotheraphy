"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { createLinkResource } from "@/app/admin/_actions/library";
import { ACCEPT_FILES, KIND_LABEL, kindForFile } from "@/lib/catalog";
import { formatBytes } from "@/lib/format";
import { useAction } from "./use-action";
import { KIND_ICON, uploadToLibrary } from "./library-picker";

/** Upload recordings, PDFs, Word documents and images to the library.
 *  With `personalFor`, the files are made for one client only. */
export function LibraryUpload({ personalFor, tags = [] }: { personalFor?: { id: string; name: string }; tags?: string[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [tag, setTag] = useState("");
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState<{ i: number; pct: number } | null>(null);

  const add = (list: FileList | null) => {
    if (!list) return;
    const all = Array.from(list);
    const ok = all.filter((f) => kindForFile(f.type, f.name));
    if (ok.length < all.length) toast.error("Some files were skipped. Use recordings, videos, PDFs, Word documents or images.");
    setFiles((cur) => [...cur, ...ok]);
  };

  const upload = async () => {
    setBusy(true);
    try {
      const ids = await uploadToLibrary(files, { tag, personalForUserId: personalFor?.id ?? null, onProgress: (i, pct) => setProgress({ i, pct }) });
      toast.success(`${ids.length} file${ids.length === 1 ? "" : "s"} uploaded`);
      setFiles([]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => (e.preventDefault(), setDrag(true))}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => (e.preventDefault(), setDrag(false), add(e.dataTransfer.files))}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition ${drag ? "border-sage-500 bg-sage-50" : "border-stone-300 hover:bg-stone-50"}`}
      >
        <Upload className="h-8 w-8 text-sage-600" />
        <p className="font-medium text-stone-700">{personalFor ? `Upload something made for ${personalFor.name}` : "Drop files here"}</p>
        <p className="text-sm text-stone-500">Recordings, videos, PDFs, Word documents or images. Tap to choose.</p>
        <input suppressHydrationWarning ref={inputRef} type="file" multiple accept={ACCEPT_FILES} className="hidden" onChange={(e) => (add(e.target.files), (e.target.value = ""))} />
      </div>

      {files.length > 0 && (
        <div className="space-y-3 rounded-xl bg-stone-50 p-4">
          <ul className="space-y-2">
            {files.map((f, i) => {
              const kind = kindForFile(f.type, f.name) ?? "PDF";
              const Icon = KIND_ICON[kind];
              return (
                <li key={`${f.name}-${i}`} className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4 shrink-0 text-sage-600" />
                    <span className="min-w-0 flex-1 truncate">{f.name}</span>
                    <span className="shrink-0 text-xs text-stone-500">
                      {KIND_LABEL[kind]} · {formatBytes(f.size)}
                    </span>
                    {!busy && (
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setFiles((cur) => cur.filter((_, j) => j !== i))} aria-label="Remove">
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {progress?.i === i && <Progress value={progress.pct} className="h-1.5" />}
                </li>
              );
            })}
          </ul>
          {!personalFor && (
            <div className="space-y-1.5">
              <Label>Tag (optional, helps you find it later)</Label>
              <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g. Reiki Level 1, Weight loss" list="library-tags" />
              <datalist id="library-tags">
                {tags.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
          )}
          <Button onClick={upload} disabled={busy} className="w-full bg-sage-600 hover:bg-sage-700">
            {busy ? "Uploading…" : `Upload ${files.length} file${files.length === 1 ? "" : "s"}`}
          </Button>
          <p className="text-xs text-stone-500">Titles come from the file names. You can rename them afterwards.</p>
        </div>
      )}
    </div>
  );
}

/** Add a YouTube video or any other web link to the library. */
export function LinkForm({ tags = [] }: { tags?: string[] }) {
  const { pending, run } = useAction();
  const [f, setF] = useState({ title: "", url: "", description: "", tag: "" });
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Link</Label>
          <Input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="https://…" />
        </div>
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Tag (optional)</Label>
          <Input value={f.tag} onChange={(e) => setF({ ...f, tag: e.target.value })} list="library-tags-link" />
          <datalist id="library-tags-link">
            {tags.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>
      </div>
      <Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Short description (optional)" className="min-h-[60px]" />
      <p className="text-xs text-stone-500">YouTube links play inside the portal. Other links open in a new tab.</p>
      <Button
        disabled={pending || !f.url || !f.title}
        className="bg-sage-600 hover:bg-sage-700"
        onClick={() => run(() => createLinkResource(f), "Link added", (r) => r.ok && setF({ title: "", url: "", description: "", tag: "" }))}
      >
        Add link
      </Button>
    </div>
  );
}
