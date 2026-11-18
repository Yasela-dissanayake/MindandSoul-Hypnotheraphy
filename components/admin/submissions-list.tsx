"use client";

import { useEffect, useRef } from "react";
import { Download, FileText, FileType2, Film, Headphones, ImageIcon } from "lucide-react";
import { VideoPlayer } from "@/components/portal/video-player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteSubmission, markSubmissionsSeen } from "@/app/admin/_actions/courses";
import { formatBytes } from "@/lib/format";
import { useAction } from "./use-action";
import { ConfirmButton } from "./confirm-button";

type Item = {
  id: string;
  title: string;
  note: string | null;
  contentType: string;
  sizeBytes: number;
  originalName: string;
  planTitle: string | null;
  createdAt: string;
  seen: boolean;
};

const iconFor = (t: string) =>
  t.startsWith("audio/") ? Headphones : t.startsWith("video/") ? Film : t.startsWith("image/") ? ImageIcon : t.includes("word") || t === "application/msword" ? FileType2 : FileText;

/** Work a client sent: worksheets, recordings, photos. Opening the tab marks them as seen. */
export function SubmissionsList({ clientId, items, timezone }: { clientId: string; items: Item[]; timezone: string }) {
  const { run } = useAction();
  const done = useRef(false);
  useEffect(() => {
    if (done.current || !items.some((i) => !i.seen)) return;
    done.current = true;
    const t = setTimeout(() => void markSubmissionsSeen(clientId), 1500);
    return () => clearTimeout(t);
  }, [clientId, items]);

  if (!items.length) return <p className="rounded-xl bg-white p-5 text-stone-500 ring-1 ring-stone-200">Nothing uploaded yet.</p>;

  return (
    <ul className="space-y-3">
      {items.map((s) => {
        const Icon = iconFor(s.contentType);
        const url = `/api/files/submission/${s.id}`;
        return (
          <li key={s.id} className={`space-y-2 rounded-2xl bg-white p-4 ring-1 ${s.seen ? "ring-stone-200" : "ring-2 ring-amber-300"}`}>
            <div className="flex flex-wrap items-center gap-3">
              <Icon className="h-5 w-5 text-sage-600" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-stone-800">
                  {s.title} {!s.seen && <Badge className="ml-1 bg-amber-500 hover:bg-amber-500">New</Badge>}
                </p>
                <p className="text-xs text-stone-500">
                  {new Date(s.createdAt).toLocaleString("en-AU", { timeZone: timezone, weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                  {s.planTitle ? ` · ${s.planTitle}` : ""} · {s.originalName} · {formatBytes(s.sizeBytes)}
                </p>
              </div>
              <Button size="sm" variant="outline" asChild>
                <a href={url} target="_blank" rel="noreferrer">
                  Open
                </a>
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                <a href={`${url}?download=1`} aria-label="Download">
                  <Download className="h-4 w-4" />
                </a>
              </Button>
              <ConfirmButton icon title={`Delete "${s.title}"?`} description="The file will be deleted for good." onConfirm={() => run(() => deleteSubmission(s.id), "Deleted")} />
            </div>
            {s.note && <p className="whitespace-pre-line rounded-lg bg-stone-50 p-3 text-sm text-stone-700">{s.note}</p>}
            {s.contentType.startsWith("audio/") && <audio src={url} controls preload="none" className="h-10 w-full" />}
            {s.contentType.startsWith("video/") && <VideoPlayer src={url} title={s.title} />}
            {s.contentType.startsWith("image/") && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={s.title} loading="lazy" className="max-h-72 rounded-xl" />
            )}
          </li>
        );
      })}
    </ul>
  );
}
