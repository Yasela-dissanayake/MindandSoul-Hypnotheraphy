"use client";

import { useEffect, useState } from "react";
import { MessageCircleQuestion, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useBusyTransition } from "@/components/use-busy-transition";
import { deleteMyQuestion, markAnswersSeen } from "@/app/portal/actions";
import { cn } from "@/lib/utils";

export type MyQuestion = {
  id: string;
  topic: string | null;
  body: string;
  answer: string | null;
  createdAt: string;
  answeredAt: string | null;
  isNew: boolean; // answered, not seen yet
};

/** The client's questions and Rangika's answers. Opening this list marks new answers as seen. */
export function MyQuestions({ items, timezone }: { items: MyQuestion[]; timezone: string }) {
  // Remember which answers were new when the page opened, so they stay highlighted
  // after we tell the server they've been seen (which clears the dot on the menu).
  const [newIds] = useState(() => new Set(items.filter((q) => q.isNew).map((q) => q.id)));
  const hasNew = items.some((q) => q.isNew);
  useEffect(() => {
    if (hasNew) void markAnswersSeen();
  }, [hasNew]);
  items = items.map((q) => ({ ...q, isNew: q.isNew || newIds.has(q.id) }));

  if (!items.length) return null;
  const when = (iso: string) => new Date(iso).toLocaleString("en-AU", { timeZone: timezone, day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

  return (
    <ul className="space-y-3">
      {items.map((q) => (
        <li key={q.id} className={cn("space-y-2 rounded-xl p-4 ring-1", q.isNew ? "bg-sage-50 ring-2 ring-sage-400" : "bg-white ring-stone-200")}>
          <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
            <span>
              {when(q.createdAt)}
              {q.topic ? ` · ${q.topic}` : ""}
            </span>
            {q.isNew ? (
              <span className="rounded-full bg-sage-600 px-2 py-0.5 font-medium text-white">New answer</span>
            ) : !q.answeredAt ? (
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-stone-600">Waiting for an answer</span>
            ) : null}
          </div>
          <p className="flex gap-2 whitespace-pre-line text-stone-800">
            <MessageCircleQuestion className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" aria-hidden />
            <span>{q.body}</span>
          </p>
          {q.answer ? (
            <div className="rounded-lg bg-white p-3 ring-1 ring-sage-200">
              <p className="text-xs font-medium uppercase tracking-wide text-sage-700">Rangika{q.answeredAt ? ` · ${when(q.answeredAt)}` : ""}</p>
              <p className="mt-1 whitespace-pre-line font-serif text-stone-800">{q.answer}</p>
            </div>
          ) : (
            <TakeBack id={q.id} />
          )}
        </li>
      ))}
    </ul>
  );
}

function TakeBack({ id }: { id: string }) {
  const [pending, start] = useBusyTransition();
  return (
    <button suppressHydrationWarning
      type="button"
      disabled={pending}
      className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-red-700 disabled:opacity-50"
      onClick={() => {
        if (!confirm("Take back this question?")) return;
        start(async () => {
          const res = await deleteMyQuestion(id);
          if (!res.ok) toast.error(res.error);
        });
      }}
    >
      <Trash2 className="h-3.5 w-3.5" /> {pending ? "Removing…" : "Take back"}
    </button>
  );
}
