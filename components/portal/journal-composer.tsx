"use client";

import { useBusyTransition } from "@/components/use-busy-transition";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { saveJournalEntry } from "@/app/portal/actions";
import { uploadFile } from "@/lib/upload-client";
import { VoiceRecorder, type Recording } from "./voice-recorder";

export function JournalComposer({ prompt }: { prompt: string | null }) {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState<Recording | null>(null);
  const [usePrompt, setUsePrompt] = useState(Boolean(prompt));
  const [progress, setProgress] = useState<number | null>(null);
  const [pending, start] = useBusyTransition();

  const save = () =>
    start(async () => {
      try {
        let audio;
        if (recording) {
          setProgress(0);
          const ext = recording.type.includes("mp4") ? "m4a" : recording.type.includes("ogg") ? "ogg" : "webm";
          const up = await uploadFile(recording.blob, {
            purpose: "journal",
            filename: `voice-message.${ext}`,
            onProgress: setProgress,
          });
          audio = { key: up.key, type: up.contentType, seconds: recording.seconds, bytes: up.size };
        }
        const res = await saveJournalEntry({
          body: text.trim() || undefined,
          prompt: usePrompt && prompt ? prompt : undefined,
          audio,
        });
        if (!res.ok) return void toast.error(res.error);
        toast.success("Saved to your journal 🌿");
        setText("");
        setRecording(null);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not save. Please try again.");
      } finally {
        setProgress(null);
      }
    });

  return (
    <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
      {prompt && (
        <div className="rounded-xl bg-sage-50 p-4">
          <p className="text-xs uppercase tracking-wide text-sage-700">Today&apos;s prompt</p>
          <p className="mt-1 font-serif text-lg text-stone-700">{prompt}</p>
          <label className="mt-2 flex items-center gap-2 text-xs text-stone-500">
            <input suppressHydrationWarning type="checkbox" checked={usePrompt} onChange={(e) => setUsePrompt(e.target.checked)} className="accent-sage-600" />
            I&apos;m answering this prompt
          </label>
        </div>
      )}
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write how you're feeling, what you noticed, anything at all…"
        className="min-h-[140px] text-base"
        disabled={pending}
      />
      <div className="space-y-1">
        <p className="text-xs text-stone-500">Or, if it's easier, speak:</p>
        <VoiceRecorder value={recording} onChange={setRecording} disabled={pending} />
      </div>
      {progress !== null && <Progress value={progress} className="h-1.5" />}
      <Button
        onClick={save}
        disabled={pending || (!text.trim() && !recording)}
        className="h-12 w-full bg-sage-600 text-base hover:bg-sage-700"
      >
        {pending ? "Saving…" : "Save entry"}
      </Button>
    </section>
  );
}
