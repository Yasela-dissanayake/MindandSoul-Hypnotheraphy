"use client";

import { useBusyTransition } from "@/components/use-busy-transition";
import { useState } from "react";
import { MessageCircleHeart, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateJournalEntry } from "@/app/portal/actions";
import { formatDuration } from "@/lib/format";

type Entry = {
  id: string;
  prompt: string | null;
  body: string | null;
  hasAudio: boolean;
  audioSeconds: number | null;
  createdAt: string;
  readAt: string | null;
  /** Rangika's reply, if she has written one. */
  reply: { text: string | null; hasAudio: boolean; audioSeconds: number | null; repliedAt: string; isNew: boolean } | null;
};

export function JournalEntryCard({ entry, timezone, editable }: { entry: Entry; timezone: string; editable: boolean }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(entry.body ?? "");
  const [pending, start] = useBusyTransition();
  const when = new Date(entry.createdAt).toLocaleString("en-AU", {
    timeZone: timezone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <article className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-stone-200">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-stone-500">
          {when}
          {entry.readAt && <span className="ml-2 text-sage-600">· Read by Rangika</span>}
        </p>
        {editable && !editing && (
          <button suppressHydrationWarning onClick={() => setEditing(true)} className="inline-flex items-center gap-1 text-xs text-sage-700 hover:underline">
            <Pencil className="h-3 w-3" /> Edit
          </button>
        )}
      </div>
      {entry.prompt && <p className="text-sm italic text-sage-700">{entry.prompt}</p>}
      {entry.hasAudio && (
        <div className="flex items-center gap-2">
          <audio src={`/api/files/journal/${entry.id}`} controls preload="none" className="h-10 w-full" />
          {entry.audioSeconds ? <span className="text-xs text-stone-500">{formatDuration(entry.audioSeconds)}</span> : null}
        </div>
      )}
      {editing ? (
        <div className="space-y-2">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[120px]" />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-sage-600 hover:bg-sage-700"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await updateJournalEntry(entry.id, text);
                  if (!res.ok) return void toast.error(res.error);
                  toast.success("Entry updated");
                  setEditing(false);
                })
              }
            >
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => (setEditing(false), setText(entry.body ?? ""))}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        entry.body && <p className="whitespace-pre-line text-stone-700">{entry.body}</p>
      )}
      {entry.reply && (
        <div className={`space-y-2 rounded-xl p-3 ring-1 ${entry.reply.isNew ? "bg-sage-50 ring-2 ring-sage-400" : "bg-sage-50/70 ring-sage-200"}`}>
          <p className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-sage-800">
            <MessageCircleHeart className="h-4 w-4" aria-hidden /> Rangika&apos;s reply
            <span className="font-normal text-stone-500">
              ·{" "}
              {new Date(entry.reply.repliedAt).toLocaleString("en-AU", { timeZone: timezone, day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
            </span>
            {entry.reply.isNew && <span className="rounded-full bg-sage-600 px-2 py-0.5 text-[11px] font-semibold text-white">New</span>}
          </p>
          {entry.reply.hasAudio && (
            <div className="flex items-center gap-2">
              <audio
                src={`/api/files/journal-reply/${entry.id}?v=${encodeURIComponent(entry.reply.repliedAt)}`}
                controls
                preload="none"
                className="h-10 w-full"
              />
              {entry.reply.audioSeconds ? <span className="text-xs text-stone-500">{formatDuration(entry.reply.audioSeconds)}</span> : null}
            </div>
          )}
          {entry.reply.text && <p className="whitespace-pre-line text-sm text-stone-700">{entry.reply.text}</p>}
        </div>
      )}
    </article>
  );
}
