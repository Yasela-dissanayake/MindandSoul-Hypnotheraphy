"use client";

import { useRef, useState } from "react";
import { Download, ExternalLink, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteResource, updateResource } from "@/app/admin/_actions/library";
import { uploadFile } from "@/lib/upload-client";
import { formatBytes } from "@/lib/format";
import { ACCEPT_FILES, KIND_LABEL, type KindId } from "@/lib/catalog";
import { AudioPlayer } from "@/components/portal/audio-player";
import { useAction } from "./use-action";
import { ConfirmButton } from "./confirm-button";
import { KIND_ICON } from "./library-picker";

type R = {
  id: string;
  title: string;
  description: string | null;
  kind: KindId;
  url: string | null;
  sizeBytes: number | null;
  tag: string | null;
  personalForUserId: string | null;
  personalFor: string | null;
  usedIn: number;
};

export function ResourceRow({ r, tags = [] }: { r: R; tags?: string[] }) {
  const Icon = KIND_ICON[r.kind];
  const isLink = r.kind === "VIDEO" || r.kind === "LINK";
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const { pending, run } = useAction();
  const [f, setF] = useState({ title: r.title, description: r.description ?? "", tag: r.tag ?? "", url: r.url ?? "" });
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const file = `/api/files/resource/${r.id}`;

  const save = () =>
    run(async () => {
      let replace = null;
      if (replaceFile) {
        setProgress(0);
        const up = await uploadFile(replaceFile, { purpose: "library", filename: replaceFile.name, onProgress: setProgress });
        replace = { storageKey: up.key, contentType: up.contentType, sizeBytes: up.size, filename: replaceFile.name };
      }
      const res = await updateResource(r.id, {
        title: f.title,
        description: f.description,
        tag: f.tag,
        personalForUserId: r.personalForUserId,
        url: isLink ? f.url : null,
        replace,
      });
      setProgress(null);
      if (res.ok) {
        setOpen(false);
        setReplaceFile(null);
      }
      return res;
    }, "Saved");

  return (
    <li className="rounded-xl bg-white p-3 ring-1 ring-stone-200">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sage-50 text-sage-600">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-stone-800">{r.title}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
            <Badge variant="outline">{KIND_LABEL[r.kind]}</Badge>
            {r.tag && <Badge variant="outline">{r.tag}</Badge>}
            {r.personalFor && <Badge className="bg-sage-100 text-sage-800 hover:bg-sage-100">Only for {r.personalFor}</Badge>}
            <span className="text-stone-500">
              {formatBytes(r.sizeBytes)}
              {r.usedIn ? ` · used ${r.usedIn} time${r.usedIn === 1 ? "" : "s"}` : ""}
            </span>
          </div>
        </div>
        {r.kind === "AUDIO" && (
          <Button size="sm" variant="ghost" onClick={() => setPreview(!preview)}>
            {preview ? "Hide" : "Listen"}
          </Button>
        )}
        {(r.kind === "PDF" || r.kind === "IMAGE") && (
          <Button size="sm" variant="ghost" asChild>
            <a href={file} target="_blank" rel="noreferrer">
              Open
            </a>
          </Button>
        )}
        {r.kind === "DOCUMENT" && (
          <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
            <a href={file} aria-label="Download">
              <Download className="h-4 w-4" />
            </a>
          </Button>
        )}
        {isLink && r.url && (
          <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
            <a href={r.url} target="_blank" rel="noreferrer" aria-label="Open link">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setOpen(true)} aria-label="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
        <ConfirmButton
          icon
          title={`Delete "${r.title}"?`}
          description={r.usedIn ? `It's used in ${r.usedIn} session plan(s) or course(s) and will be removed from them.` : "It will be deleted for good."}
          onConfirm={() => run(() => deleteResource(r.id), "Deleted")}
        />
      </div>
      {preview && r.kind === "AUDIO" && (
        <div className="mt-3">
          <AudioPlayer resourceId={r.id} title={r.title} compact rememberPosition={false} />
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit item</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
            </div>
            {isLink && (
              <div className="space-y-1.5">
                <Label>Link</Label>
                <Input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} />
              </div>
            )}
            {!r.personalForUserId && (
              <div className="space-y-1.5">
                <Label>Tag</Label>
                <Input value={f.tag} onChange={(e) => setF({ ...f, tag: e.target.value })} list={`tags-${r.id}`} placeholder="e.g. Reiki Level 1" />
                <datalist id={`tags-${r.id}`}>
                  {tags.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>
            )}
            {!isLink && (
              <div className="space-y-1.5">
                <Label>Replace the file (optional)</Label>
                <input ref={fileRef} type="file" accept={ACCEPT_FILES} onChange={(e) => setReplaceFile(e.target.files?.[0] ?? null)} className="block w-full text-sm" />
                <p className="text-xs text-stone-500">Everyone who has this item will get the new version.</p>
                {progress !== null && <Progress value={progress} className="h-1.5" />}
              </div>
            )}
            <Button className="h-11 w-full bg-sage-600 hover:bg-sage-700" disabled={pending || !f.title.trim()} onClick={save}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </li>
  );
}
