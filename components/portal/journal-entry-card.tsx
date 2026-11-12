"use client";

import { useBusyTransition } from "@/components/use-busy-transition";
import { useState } from "react";
import { Pencil } from "lucide-react";
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
          <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1 text-xs text-sage-700 hover:underline">
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
    </article>
  );
}
