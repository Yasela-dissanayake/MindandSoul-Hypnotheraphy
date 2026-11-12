"use client";

import { useEffect, useRef, useState } from "react";
import { Moon, Pause, Play, RotateCcw, RotateCw, Sun } from "lucide-react";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  /** Library item id: streams from /api/files/resource/:id */
  resourceId?: string;
  /** Or a direct source (e.g. journal voice message) */
  src?: string;
  title: string;
  subtitle?: string;
  /** Remember where the listener stopped (per device). */
  rememberPosition?: boolean;
  /** Show the calm night-mode toggle. */
  nightToggle?: boolean;
  compact?: boolean;
};

const posKey = (id: string) => `hwr:pos:${id}`;

export function AudioPlayer({ resourceId, src, title, subtitle, rememberPosition = true, nightToggle, compact }: Props) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [night, setNight] = useState(false);
  const [error, setError] = useState(false);
  const source = src ?? `/api/files/resource/${resourceId}`;
  const id = resourceId ?? src ?? title;

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    const onLoaded = () => {
      setDuration(a.duration || 0);
      if (rememberPosition) {
        try {
          const saved = Number(localStorage.getItem(posKey(id)));
          if (saved > 5 && saved < a.duration - 5) a.currentTime = saved;
        } catch {}
      }
    };
    const onTime = () => {
      setTime(a.currentTime);
      if (rememberPosition && Math.floor(a.currentTime) % 5 === 0) {
        try {
          localStorage.setItem(posKey(id), String(a.currentTime));
        } catch {}
      }
    };
    const onEnded = () => {
      setPlaying(false);
      try {
        localStorage.removeItem(posKey(id));
      } catch {}
    };
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnded);
    a.addEventListener("play", () => setPlaying(true));
    a.addEventListener("pause", () => setPlaying(false));
    a.addEventListener("error", () => setError(true));
    return () => {
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnded);
    };
  }, [id, rememberPosition]);

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (a.paused) {
      a.play().catch(() => setError(true));
      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({ title, artist: "Heal With Rangika" });
        navigator.mediaSession.setActionHandler("seekbackward", () => skip(-15));
        navigator.mediaSession.setActionHandler("seekforward", () => skip(30));
      }
    } else a.pause();
  };
  const skip = (s: number) => {
    const a = ref.current;
    if (a) a.currentTime = Math.min(Math.max(0, a.currentTime + s), a.duration || 0);
  };

  const dark = night;
  return (
    <div
      className={cn(
        "rounded-2xl border transition-colors",
        compact ? "p-3" : "p-5",
        dark ? "border-stone-800 bg-stone-900 text-stone-100" : "border-sage-100 bg-white text-stone-800",
      )}
      onContextMenu={(e) => e.preventDefault()}
    >
      <audio ref={ref} src={source} preload="metadata" controlsList="nodownload" />
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full transition-transform active:scale-95",
            compact ? "h-11 w-11" : "h-16 w-16",
            dark ? "bg-sage-300 text-stone-900" : "bg-sage-600 text-white",
          )}
        >
          {playing ? <Pause className={compact ? "h-5 w-5" : "h-7 w-7"} /> : <Play className={cn("ml-1", compact ? "h-5 w-5" : "h-7 w-7")} />}
        </button>
        <div className="min-w-0 flex-1">
          <p className={cn("truncate font-medium", compact ? "text-sm" : "text-base")}>{title}</p>
          {subtitle && <p className={cn("truncate text-xs", dark ? "text-stone-400" : "text-stone-500")}>{subtitle}</p>}
          {error && <p className="text-xs text-red-500">This audio can't be played right now.</p>}
        </div>
        {nightToggle && (
          <button
            onClick={() => setNight(!night)}
            aria-label={night ? "Day mode" : "Night mode"}
            className={cn("rounded-full p-2", dark ? "text-stone-300 hover:bg-stone-800" : "text-stone-500 hover:bg-stone-100")}
          >
            {night ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        )}
      </div>
      <div className={cn("flex items-center gap-2", compact ? "mt-2" : "mt-4")}>
        <button onClick={() => skip(-15)} aria-label="Back 15 seconds" className="relative rounded-full p-1.5 opacity-80 hover:opacity-100">
          <RotateCcw className="h-5 w-5" />
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold">15</span>
        </button>
        <span className="w-10 text-right text-xs tabular-nums opacity-70">{formatDuration(time)}</span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={1}
          value={Math.min(time, duration || 0)}
          onChange={(e) => {
            if (ref.current) ref.current.currentTime = Number(e.target.value);
          }}
          aria-label="Position"
          className={cn("h-1.5 flex-1 cursor-pointer", dark ? "accent-sage-300" : "accent-sage-600")}
        />
        <span className="w-10 text-xs tabular-nums opacity-70">{duration ? formatDuration(duration) : "--:--"}</span>
        <button onClick={() => skip(30)} aria-label="Forward 30 seconds" className="relative rounded-full p-1.5 opacity-80 hover:opacity-100">
          <RotateCw className="h-5 w-5" />
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold">30</span>
        </button>
      </div>
    </div>
  );
}
