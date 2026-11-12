"use client";

import { useBusyTransition } from "@/components/use-busy-transition";
import { useRef, useState } from "react";
import { Check, FileUp, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { createSubmission, deleteMySubmission } from "@/app/portal/actions";
import { uploadFile } from "@/lib/upload-client";
import { formatBytes } from "@/lib/format";
import { VoiceRecorder, type Recording } from "./voice-recorder";

const ACCEPT = "audio/*,.mp3,.m4a,.pdf,application/pdf,.doc,.docx,image/*,.jpg,.jpeg,.png,.heic";
const nameWithoutExt = (n: string) => n.replace(/\.[^.]+$/, "");

/** A client sends a file or a recording to Rangika. */
export function SubmissionUpload({ plans }: { plans: { id: string; title: string }[] }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [mode, setMode] = useState<"file" | "record">("file");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [progress, setProgress] = useState<number | null>(null);
  const [pending, start] = useBusyTransition();

  const send = () =>
    start(async () => {
      try {
        const blob: Blob | null = mode === "file" ? file : (recording?.blob ?? null);
        if (!blob) return void toast.error(mode === "file" ? "Choose a file first." : "Record something first.");
        const ext = recording?.type.includes("mp4") ? "m4a" : recording?.type.includes("ogg") ? "ogg" : "webm";
        const filename = mode === "file" && file ? file.name : `recording.${ext}`;
        setProgress(0);
        const up = await uploadFile(blob, { purpose: "submission", filename, onProgress: setProgress });
        const res = await createSubmission({
          key: up.key,
          title: title.trim() || (mode === "file" && file ? nameWithoutExt(file.name) : "Voice recording"),
          note,
          planId: planId || null,
          contentType: up.contentType,
          size: up.size,
          originalName: filename,
        });
        if (!res.ok) return void toast.error(res.error);
        toast.success("Sent to Rangika 🌿");
        setFile(null);
        setRecording(null);
        setTitle("");
        setNote("");
        if (fileRef.current) fileRef.current.value = "";
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed. Please try again.");
      } finally {
        setProgress(null);
      }
    });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ["file", "Upload a file"],
            ["record", "Record audio"],
          ] as const
        ).map(([m, l]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-lg border px-3 py-2.5 text-sm ${mode === m ? "border-sage-500 bg-sage-50 text-sage-800" : "border-stone-200 text-stone-600"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {mode === "file" ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-sage-300 px-4 py-5 text-sage-700 hover:bg-sage-50"
        >
          <FileUp className="h-5 w-5" />
          <span className="truncate font-medium">{file ? `${file.name} (${formatBytes(file.size)})` : "Choose a worksheet, photo or recording"}</span>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);
              if (f && !title) setTitle(nameWithoutExt(f.name));
            }}
          />
        </button>
      ) : (
        <VoiceRecorder value={recording} onChange={setRecording} disabled={pending} label="Record a message or exercise" />
      )}

      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title, e.g. Week 2 worksheet" className="h-11" />
      <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="A note for Rangika (optional)" className="min-h-[70px]" />
      {plans.length > 1 && (
        <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="h-11 w-full rounded-md border border-input bg-white px-3 text-sm">
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              For: {p.title}
            </option>
          ))}
        </select>
      )}
      {progress !== null && <Progress value={progress} className="h-1.5" />}
      <Button onClick={send} disabled={pending || (mode === "file" ? !file : !recording)} className="h-11 w-full bg-sage-600 hover:bg-sage-700">
        {pending ? "Sending…" : "Send to Rangika"}
      </Button>
    </div>
  );
}

type Sub = { id: string; title: string; note: string | null; contentType: string; createdAt: string; seen: boolean };

/** The client's own uploads. */
export function MySubmissions({ items, timezone }: { items: Sub[]; timezone: string }) {
  const [pending, start] = useBusyTransition();
  if (!items.length) return null;
  return (
    <div className="space-y-2 border-t border-stone-100 pt-4">
      <p className="text-sm font-medium text-stone-700">What you&apos;ve sent</p>
      {items.map((s) => (
        <div key={s.id} className="flex items-center gap-3 rounded-xl bg-stone-50 p-3 text-sm">
          <div className="min-w-0 flex-1">
            <a href={`/api/files/submission/${s.id}`} target="_blank" rel="noreferrer" className="block truncate font-medium text-stone-800 hover:underline">
              {s.title}
            </a>
            <span className="text-xs text-stone-500">
              {new Date(s.createdAt).toLocaleDateString("en-AU", { timeZone: timezone, day: "numeric", month: "short" })}
              {s.seen ? (
                <span className="ml-2 inline-flex items-center gap-1 text-sage-700">
                  <Check className="h-3 w-3" /> Seen by Rangika
                </span>
              ) : null}
            </span>
          </div>
          {!s.seen && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              disabled={pending}
              aria-label={`Remove ${s.title}`}
              onClick={() =>
                start(async () => {
                  const res = await deleteMySubmission(s.id);
                  if (!res.ok) toast.error(res.error);
                  else toast.success("Removed");
                })
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
