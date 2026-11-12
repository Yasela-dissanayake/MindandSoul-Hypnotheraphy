"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircleQuestion, Pencil, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { answerQuestion, deleteQuestion } from "@/app/admin/_actions/questions";
import { cn } from "@/lib/utils";
import { useAction } from "./use-action";

export type QuestionRow = {
  id: string;
  clientId: string;
  clientName: string;
  topic: string | null;
  planTitle: string | null;
  body: string;
  answer: string | null;
  answeredAt: string | null;
  answerSeen: boolean;
  createdAt: string;
};

function when(iso: string, timezone: string) {
  return new Date(iso).toLocaleString("en-AU", { timeZone: timezone, weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

/** Questions from clients, with an answer box. `showClient` = list across all clients. */
export function QuestionsList({ items, timezone, showClient = false, empty }: { items: QuestionRow[]; timezone: string; showClient?: boolean; empty?: string }) {
  if (!items.length) {
    return <p className="rounded-xl bg-white p-5 text-sm text-stone-500 ring-1 ring-stone-200">{empty ?? "No questions yet."}</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((q) => (
        <QuestionCard key={q.id} q={q} timezone={timezone} showClient={showClient} />
      ))}
    </div>
  );
}

function QuestionCard({ q, timezone, showClient }: { q: QuestionRow; timezone: string; showClient: boolean }) {
  const [text, setText] = useState(q.answer ?? "");
  const [editing, setEditing] = useState(!q.answer);
  const [emailAgain, setEmailAgain] = useState(false);
  const { pending, run } = useAction();
  const waiting = !q.answeredAt;

  const send = () =>
    run(
      () => answerQuestion(q.id, text, { email: waiting ? true : emailAgain }),
      waiting ? `Answer sent to ${q.clientName}` : "Answer updated",
      (r) => r.ok && setEditing(false),
    );

  return (
    <article className={cn("space-y-3 rounded-2xl bg-white p-4 ring-1", waiting ? "ring-2 ring-amber-300" : "ring-stone-200")}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {showClient && (
            <Link href={`/admin/clients/${q.clientId}?tab=questions`} className="text-sm font-medium text-stone-800 hover:underline">
              {q.clientName}
            </Link>
          )}
          <span>{when(q.createdAt, timezone)}</span>
          {q.planTitle && <span>· {q.planTitle}</span>}
        </div>
        {waiting ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">Waiting for your answer</span>
        ) : (
          <span className="rounded-full bg-sage-100 px-2 py-0.5 font-medium text-sage-800">{q.answerSeen ? "Answered · seen" : "Answered"}</span>
        )}
      </div>

      {q.topic && <p className="text-sm text-sage-700">About: {q.topic}</p>}
      <p className="flex gap-2 whitespace-pre-line text-stone-800">
        <MessageCircleQuestion className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
        <span>{q.body}</span>
      </p>

      {!editing && q.answer ? (
        <div className="space-y-2 rounded-xl bg-sage-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-sage-700">Your answer{q.answeredAt ? ` · ${when(q.answeredAt, timezone)}` : ""}</p>
          <p className="whitespace-pre-line text-stone-800">{q.answer}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="h-8 px-2 text-stone-600" onClick={() => setEditing(true)}>
              <Pencil className="mr-1 h-3.5 w-3.5" /> Edit answer
            </Button>
            <DeleteButton id={q.id} />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. No, you don't have to. Once a day is enough."
            className="min-h-[90px] bg-white"
            aria-label={`Answer to ${q.clientName}`}
          />
          {!waiting && (
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input type="checkbox" checked={emailAgain} onChange={(e) => setEmailAgain(e.target.checked)} className="h-4 w-4 accent-sage-600" />
              Email the changed answer to {q.clientName}
            </label>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" className="bg-sage-600 hover:bg-sage-700" disabled={pending || !text.trim()} onClick={send}>
              <Send className="mr-1.5 h-3.5 w-3.5" />
              {pending ? "Sending…" : waiting ? "Send answer" : "Save answer"}
            </Button>
            {!waiting && (
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => {
                  setText(q.answer ?? "");
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
            )}
            {waiting && <DeleteButton id={q.id} />}
            {waiting && <span className="text-xs text-stone-500">They&apos;ll get an email with your answer.</span>}
          </div>
        </div>
      )}
    </article>
  );
}

function DeleteButton({ id }: { id: string }) {
  const { pending, run } = useAction();
  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-8 px-2 text-stone-500 hover:text-red-700"
      disabled={pending}
      onClick={() => {
        if (confirm("Delete this question? The client won't see it any more.")) run(() => deleteQuestion(id), "Question deleted");
      }}
    >
      <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
    </Button>
  );
}
