"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addPrivateNote, deletePrivateNote } from "@/app/admin/_actions/clients";
import { useAction } from "./use-action";
import { ConfirmButton } from "./confirm-button";

export function NotesPanel({ clientId, notes }: { clientId: string; notes: { id: string; body: string; createdAt: string }[] }) {
  const [text, setText] = useState("");
  const { pending, run } = useAction();
  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
        <p className="flex items-center gap-2 text-sm text-stone-500">
          <Lock className="h-4 w-4" /> Only you can see these notes.
        </p>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Session 3: worked on sleep. Responded well to the beach visualisation." className="min-h-[100px]" />
        <Button className="bg-sage-600 hover:bg-sage-700" disabled={pending || !text.trim()} onClick={() => run(() => addPrivateNote(clientId, text), "Note saved", (r) => r.ok && setText(""))}>
          Save note
        </Button>
      </div>
      {notes.map((n) => (
        <article key={n.id} className="space-y-2 rounded-2xl bg-white p-4 ring-1 ring-stone-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">
              {new Date(n.createdAt).toLocaleString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}
            </span>
            <ConfirmButton icon title="Delete this note?" onConfirm={() => run(() => deletePrivateNote(n.id), "Deleted")} />
          </div>
          <p className="whitespace-pre-line text-stone-700">{n.body}</p>
        </article>
      ))}
    </div>
  );
}
