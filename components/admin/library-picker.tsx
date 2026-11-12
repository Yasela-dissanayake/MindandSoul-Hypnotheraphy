"use client";

import { useMemo, useRef, useState } from "react";
import { ExternalLink, FileText, FileType2, Headphones, ImageIcon, Link2, PlayCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { createFileResource, createLinkResource } from "@/app/admin/_actions/library";
import { ACCEPT_FILES, KIND_LABEL, type KindId } from "@/lib/catalog";
import { uploadFile } from "@/lib/upload-client";
import type { LibraryOption } from "@/lib/admin-plans";

export const KIND_ICON: Record<KindId, typeof FileText> = {
  AUDIO: Headphones,
  PDF: FileText,
  DOCUMENT: FileType2,
  IMAGE: ImageIcon,
  VIDEO: PlayCircle,
  LINK: ExternalLink,
};

const selectCls = "h-10 w-full rounded-md border border-input bg-white px-3 text-sm";
const titleFromName = (n: string) => n.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();

/** Upload files straight to the library (used by the pickers and the Library page). Returns new item ids. */
export async function uploadToLibrary(
  files: File[],
  opts: { tag?: string; personalForUserId?: string | null; onProgress?: (file: number, pct: number) => void },
): Promise<string[]> {
  const ids: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const up = await uploadFile(f, { purpose: "library", filename: f.name, onProgress: (p) => opts.onProgress?.(i, p) });
    const res = await createFileResource({
      title: titleFromName(f.name),
      storageKey: up.key,
      contentType: up.contentType,
      sizeBytes: up.size,
      filename: f.name,
      tag: opts.tag || null,
      personalForUserId: opts.personalForUserId ?? null,
    });
    if (!res.ok) throw new Error(`${f.name}: ${res.error}`);
    if (res.data) ids.push(res.data.id);
  }
  return ids;
}

type Target = { id: string; title: string };

/**
 * Add library items to a session plan or a course: pick existing ones, upload new files,
 * or paste a link. `targets` = weeks/modules to put them in.
 */
export function LibraryPicker(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  library: LibraryOption[];
  exclude: string[];
  targets: Target[];
  targetLabel: string; // "Week" or "Module"
  defaultTag?: string;
  personalForUserId?: string | null;
  showExtra?: boolean; // courses: "Extras" section
  onAdd: (ids: string[], targetId: string | null, extra: boolean) => Promise<void> | void;
  pending: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"pick" | "upload" | "link">("pick");
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [target, setTarget] = useState("");
  const [extra, setExtra] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState({ url: "", title: "" });

  const options = useMemo(
    () =>
      props.library
        .filter((r) => !props.exclude.includes(r.id))
        .filter((r) => !q || `${r.title} ${r.tag ?? ""}`.toLowerCase().includes(q.toLowerCase())),
    [props.library, props.exclude, q],
  );

  const close = (v: boolean) => {
    props.onOpenChange(v);
    if (!v) {
      setPicked([]);
      setFiles([]);
      setLink({ url: "", title: "" });
      setProgress(null);
    }
  };

  const finish = async (ids: string[]) => {
    await props.onAdd(ids, extra ? null : target || null, extra);
    close(false);
  };

  const doUpload = async () => {
    setBusy(true);
    try {
      const ids = await uploadToLibrary(files, {
        tag: props.defaultTag,
        personalForUserId: props.personalForUserId,
        onProgress: (i, p) => setProgress(`Uploading ${i + 1} of ${files.length}: ${p}%`),
      });
      await finish(ids);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const doLink = async () => {
    setBusy(true);
    try {
      const res = await createLinkResource({ url: link.url, title: link.title, tag: props.defaultTag || null, personalForUserId: props.personalForUserId ?? null });
      if (!res.ok) return void toast.error(res.error);
      await finish(res.data ? [res.data.id] : []);
    } finally {
      setBusy(false);
    }
  };

  const placement = (
    <div className="space-y-2">
      {props.showExtra && (
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              [false, "Course material"],
              [true, "Extras (bonus)"],
            ] as const
          ).map(([v, l]) => (
            <button
              key={l}
              type="button"
              onClick={() => setExtra(v)}
              className={`rounded-lg border px-3 py-2 text-sm ${extra === v ? "border-sage-500 bg-sage-50 text-sage-800" : "border-stone-200 text-stone-600"}`}
            >
              {l}
            </button>
          ))}
        </div>
      )}
      {!extra && props.targets.length > 0 && (
        <div className="space-y-1">
          <Label>Put in</Label>
          <select className={selectCls} value={target} onChange={(e) => setTarget(e.target.value)}>
            <option value="">No {props.targetLabel.toLowerCase()}</option>
            {props.targets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={props.open} onOpenChange={close}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add material</DialogTitle>
          <DialogDescription>Choose from your library, upload new files, or paste a link.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-stone-100 p-1 text-sm">
          {(
            [
              ["pick", "From library"],
              ["upload", "Upload new"],
              ["link", "Add a link"],
            ] as const
          ).map(([t, l]) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-md py-1.5 ${tab === t ? "bg-white shadow-sm" : "text-stone-600"}`}>
              {l}
            </button>
          ))}
        </div>

        {tab === "pick" && (
          <div className="space-y-3">
            <Input placeholder="Search by title or tag…" value={q} onChange={(e) => setQ(e.target.value)} />
            <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-stone-200 p-2">
              {options.length === 0 && <p className="p-2 text-sm text-stone-500">Nothing to add. Use &quot;Upload new&quot; instead.</p>}
              {options.map((r) => {
                const Icon = KIND_ICON[r.kind];
                return (
                  <label key={r.id} className="flex cursor-pointer items-center gap-3 rounded-md p-2 text-sm hover:bg-stone-50">
                    <Checkbox checked={picked.includes(r.id)} onCheckedChange={(v) => setPicked(v === true ? [...picked, r.id] : picked.filter((x) => x !== r.id))} />
                    <Icon className="h-4 w-4 shrink-0 text-sage-600" />
                    <span className="flex-1">
                      {r.title}
                      <span className="block text-xs text-stone-500">
                        {KIND_LABEL[r.kind]}
                        {r.tag ? ` · ${r.tag}` : ""}
                        {r.personalForUserId ? " · Personal" : ""}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            {placement}
            <Button className="w-full bg-sage-600 hover:bg-sage-700" disabled={!picked.length || props.pending} onClick={() => finish(picked)}>
              Add {picked.length || ""} item{picked.length === 1 ? "" : "s"}
            </Button>
          </div>
        )}

        {tab === "upload" && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-stone-300 p-6 text-stone-600 hover:bg-stone-50"
            >
              <Upload className="h-6 w-6 text-sage-600" />
              <span className="text-sm">{files.length ? `${files.length} file${files.length === 1 ? "" : "s"} chosen` : "Choose recordings, PDFs, Word documents or images"}</span>
              <input ref={fileRef} type="file" multiple accept={ACCEPT_FILES} className="hidden" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
            </button>
            {files.length > 0 && (
              <ul className="space-y-1 text-sm text-stone-600">
                {files.map((f) => (
                  <li key={f.name} className="truncate">
                    • {f.name}
                  </li>
                ))}
              </ul>
            )}
            {placement}
            {progress && (
              <div className="space-y-1">
                <p className="text-xs text-stone-500">{progress}</p>
                <Progress value={Number(progress.match(/(\d+)%/)?.[1] ?? 0)} className="h-1.5" />
              </div>
            )}
            <Button className="w-full bg-sage-600 hover:bg-sage-700" disabled={!files.length || busy} onClick={doUpload}>
              {busy ? "Uploading…" : "Upload and add"}
            </Button>
            <p className="text-xs text-stone-500">Files are also saved in your Library{props.defaultTag ? ` with the tag "${props.defaultTag}"` : ""}.</p>
          </div>
        )}

        {tab === "link" && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Link</Label>
              <Input value={link.url} onChange={(e) => setLink({ ...link, url: e.target.value })} placeholder="https://www.youtube.com/watch?v=… or any web address" />
            </div>
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={link.title} onChange={(e) => setLink({ ...link, title: e.target.value })} placeholder="e.g. Guided meditation for sleep" />
            </div>
            <p className="flex items-center gap-1 text-xs text-stone-500">
              <Link2 className="h-3 w-3" /> YouTube links play inside the portal. Other links open in a new tab.
            </p>
            {placement}
            <Button className="w-full bg-sage-600 hover:bg-sage-700" disabled={!link.url || !link.title || busy} onClick={doLink}>
              {busy ? "Adding…" : "Add link"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
