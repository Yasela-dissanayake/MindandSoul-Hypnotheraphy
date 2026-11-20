"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/format";

export type Recording = { blob: Blob; seconds: number; url: string; type: string };

const MAX_SECONDS = 10 * 60;

function pickMimeType() {
  if (typeof MediaRecorder === "undefined") return null;
  const options = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  return options.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

/** Record a voice message. Calls onChange with the recording (or null when discarded). */
export function VoiceRecorder({
  value,
  onChange,
  disabled,
  label = "Record a voice message",
}: {
  value: Recording | null;
  onChange: (r: Recording | null) => void;
  disabled?: boolean;
  label?: string;
}) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const started = useRef(0);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && pickMimeType() !== null);
    return () => {
      if (timer.current) clearInterval(timer.current);
      recRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType() || undefined;
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunks.current = [];
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const type = (rec.mimeType || mimeType || "audio/webm").split(";")[0];
        const blob = new Blob(chunks.current, { type });
        const secs = Math.round((Date.now() - started.current) / 1000);
        onChange({ blob, seconds: secs, url: URL.createObjectURL(blob), type });
      };
      recRef.current = rec;
      started.current = Date.now();
      rec.start(1000);
      setRecording(true);
      setSeconds(0);
      timer.current = setInterval(() => {
        const s = Math.round((Date.now() - started.current) / 1000);
        setSeconds(s);
        if (s >= MAX_SECONDS) stop();
      }, 500);
    } catch {
      setError("We couldn't use your microphone. Please allow microphone access and try again.");
    }
  };

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    recRef.current?.state === "recording" && recRef.current.stop();
    setRecording(false);
  };

  if (!supported) {
    return <p className="text-sm text-stone-500">Voice recording isn't available in this browser. You can type instead.</p>;
  }

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-sage-200 bg-sage-50 p-3">
        <audio src={value.url} controls className="h-10 flex-1" />
        <span className="text-xs text-stone-500">{formatDuration(value.seconds)}</span>
        <Button type="button" variant="ghost" size="icon" onClick={() => onChange(null)} disabled={disabled} aria-label="Discard recording">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recording ? (
        <button suppressHydrationWarning
          type="button"
          onClick={stop}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-50 px-4 py-4 text-red-700 ring-1 ring-red-200"
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
          </span>
          <span className="font-medium">Recording {formatDuration(seconds)}</span>
          <Square className="h-4 w-4 fill-current" />
          <span className="text-sm">Tap to stop</span>
        </button>
      ) : (
        <button suppressHydrationWarning
          type="button"
          onClick={start}
          disabled={disabled}
          className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-sage-300 px-4 py-4 text-sage-700 hover:bg-sage-50 disabled:opacity-50"
        >
          <Mic className="h-5 w-5" />
          <span className="font-medium">{label}</span>
        </button>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
