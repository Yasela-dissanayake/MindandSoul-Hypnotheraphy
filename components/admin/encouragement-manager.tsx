"use client";

import { useState } from "react";
import { Play, Trash2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VoiceRecorder, type Recording } from "@/components/portal/voice-recorder";
import { addEncouragement, addVoiceClip, deleteEncouragement, deleteVoiceClip, setVoiceMode } from "@/app/admin/_actions/settings";
import { uploadFile } from "@/lib/upload-client";
import { useAction } from "./use-action";
import { UploadProgress } from "@/components/upload-progress";

type Mode = "COMPUTER" | "RECORDED" | "BOTH";

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function EncouragementManager({
  voiceMode,
  messages,
  clips,
}: {
  voiceMode: Mode;
  messages: { id: string | null; text: string }[];
  clips: { id: string; label: string }[];
}) {
  const { pending, run } = useAction();
  const [text, setText] = useState("");
  const [recording, setRecording] = useState<Recording | null>(null);
  const [label, setLabel] = useState("");
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>(voiceMode);

  const saveMode = (m: Mode) => {
    setMode(m);
    run(() => setVoiceMode(m), "Saved");
  };

  const saveClip = () =>
    run(async () => {
      if (!recording) return { ok: false as const, error: "Record a message first." };
      setUploadPct(0);
      const ext = recording.type.includes("mp4") ? "m4a" : recording.type.includes("ogg") ? "ogg" : "webm";
      const up = await uploadFile(recording.blob, { purpose: "voice", filename: `encouragement.${ext}`, onProgress: setUploadPct });
      setUploadPct(null);
      const res = await addVoiceClip({ label: label || "Voice message", storageKey: up.key, sizeBytes: up.size });
      if (res.ok) {
        setRecording(null);
        setLabel("");
      }
      return res;
    }, "Recording saved");

  const uploadClipFile = (file: File) =>
    run(async () => {
      setUploadPct(0);
      const up = await uploadFile(file, { purpose: "voice", filename: file.name, onProgress: setUploadPct });
      setUploadPct(null);
      return addVoiceClip({ label: label || file.name.replace(/\.[^.]+$/, ""), storageKey: up.key, sizeBytes: up.size });
    }, "Recording saved");

  return (
    <section className="space-y-6 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
      <div>
        <h2 className="font-serif text-xl text-stone-800">Encouraging voice</h2>
        <p className="text-sm text-stone-500">Played when a client ticks off a task. Clients can turn it off in their settings.</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {(
          [
            ["COMPUTER", "Computer voice"],
            ["RECORDED", "My recordings"],
            ["BOTH", "Both, mixed"],
          ] as const
        ).map(([m, l]) => (
          <button suppressHydrationWarning
            key={m}
            type="button"
            disabled={pending}
            onClick={() => saveMode(m)}
            className={`rounded-lg border px-3 py-3 text-sm ${mode === m ? "border-sage-500 bg-sage-50 text-sage-800" : "border-stone-200 text-stone-600"}`}
          >
            {l}
          </button>
        ))}
      </div>
      {mode !== "COMPUTER" && clips.length === 0 && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">You haven&apos;t recorded any messages yet, so the computer voice is used for now.</p>
      )}

      <div className="space-y-3">
        <h3 className="font-medium text-stone-800">Computer voice messages</h3>
        <ul className="space-y-2">
          {messages.map((m, i) => (
            <li key={m.id ?? i} className="flex items-center gap-2 rounded-lg border border-stone-200 p-2.5 text-sm">
              <span className="flex-1 text-stone-700">{m.text}</span>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => speak(m.text)} aria-label="Hear it">
                <Volume2 className="h-4 w-4" />
              </Button>
              {m.id && (
                <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending} onClick={() => run(() => deleteEncouragement(m.id!), "Deleted")} aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a message, e.g. You're doing so well." />
          <Button disabled={pending || !text.trim()} onClick={() => run(() => addEncouragement(text), "Added", (r) => r.ok && setText(""))} className="bg-sage-600 hover:bg-sage-700">
            Add
          </Button>
        </div>
        {messages.every((m) => !m.id) && <p className="text-xs text-stone-500">These are the built-in messages. Adding your own keeps them and adds yours.</p>}
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-stone-800">My recorded messages</h3>
        <ul className="space-y-2">
          {clips.map((c) => (
            <li key={c.id} className="flex items-center gap-2 rounded-lg border border-stone-200 p-2.5 text-sm">
              <span className="flex-1 text-stone-700">{c.label}</span>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => new Audio(`/api/files/voice/${c.id}`).play()} aria-label="Play">
                <Play className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending} onClick={() => run(() => deleteVoiceClip(c.id), "Deleted")} aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
        <div className="space-y-3 rounded-xl bg-stone-50 p-4">
          <div className="space-y-1.5">
            <Label>Label (optional)</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Well done, short" />
          </div>
          <VoiceRecorder value={recording} onChange={setRecording} disabled={pending} label="Record a short message (5–10 seconds)" />
          {recording && (
            <Button className="w-full bg-sage-600 hover:bg-sage-700" disabled={pending} onClick={saveClip}>
              Save recording
            </Button>
          )}
          <label className="block text-xs text-stone-500">
            Or upload an audio file:{" "}
            <input suppressHydrationWarning type="file" accept="audio/*" className="text-xs" onChange={(e) => e.target.files?.[0] && uploadClipFile(e.target.files[0])} />
          </label>
          {uploadPct !== null && <UploadProgress pct={uploadPct} label="Uploading voice clip…" />}
        </div>
      </div>
    </section>
  );
}
