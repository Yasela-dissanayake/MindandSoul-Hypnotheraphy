"use client";

import { useCallback, useEffect, useState } from "react";
import { Leaf } from "lucide-react";

export type EncourageConfig = {
  enabled: boolean; // the client's own "encouraging voice" setting
  mode: "COMPUTER" | "RECORDED" | "BOTH";
  messages: string[];
  clipIds: string[];
};

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  const voices = synth.getVoices().filter((v) => v.lang.startsWith("en"));
  const preferred =
    voices.find((v) => /karen|catherine|samantha|serena|moira|libby|natasha|female/i.test(v.name)) ||
    voices.find((v) => /en-(AU|GB)/i.test(v.lang)) ||
    voices[0];
  const u = new SpeechSynthesisUtterance(text);
  if (preferred) u.voice = preferred;
  u.rate = 0.9;
  u.pitch = 1;
  synth.cancel();
  synth.speak(u);
}

/** Returns a function that plays a short encouraging message (computer voice or Rangika's recording). */
export function useEncourage(config: EncourageConfig) {
  useEffect(() => {
    // Some browsers load voices lazily.
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.getVoices();
  }, []);

  return useCallback(() => {
    if (!config.enabled) return;
    const canRecorded = config.clipIds.length > 0;
    const useRecorded =
      canRecorded && (config.mode === "RECORDED" || (config.mode === "BOTH" && Math.random() < 0.5));
    if (useRecorded) {
      const audio = new Audio(`/api/files/voice/${pick(config.clipIds)}`);
      audio.play().catch(() => speak(pick(config.messages)));
    } else {
      speak(pick(config.messages));
    }
  }, [config]);
}

/** A gentle leaf animation shown for a moment after a task is ticked. */
export function Celebration({ show, message }: { show: boolean; message?: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!show) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(t);
  }, [show]);
  if (!visible) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center" aria-live="polite">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/95 px-8 py-6 shadow-xl animate-in fade-in zoom-in-90 duration-500">
        <Leaf className="h-12 w-12 text-sage-500 animate-bounce" />
        <p className="font-serif text-lg text-sage-700">{message || "Well done"}</p>
      </div>
    </div>
  );
}
