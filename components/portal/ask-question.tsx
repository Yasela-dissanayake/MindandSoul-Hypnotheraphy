"use client";

import { useState } from "react";
import { MessageCircleQuestion } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useBusyTransition } from "@/components/use-busy-transition";
import { askQuestion } from "@/app/portal/actions";
import { cn } from "@/lib/utils";

/**
 * "Ask Rangika a question" — opens a small typing box.
 * `topic` says what it's about (e.g. the tracker or exercise name) so Rangika knows the context.
 */
export function AskQuestion({
  topic,
  topicHref,
  planId,
  label = "Ask Rangika a question",
  placeholder = "e.g. Do I have to write this every time, or is once a day enough?",
  startOpen = false,
  className,
}: {
  topic?: string | null;
  topicHref?: string | null;
  planId?: string | null;
  label?: string;
  placeholder?: string;
  startOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(startOpen);
  const [text, setText] = useState("");
  const [pending, start] = useBusyTransition();

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={cn("inline-flex items-center gap-1.5 text-sm text-sage-700 hover:underline", className)}>
        <MessageCircleQuestion className="h-4 w-4" /> {label}
      </button>
    );
  }

  const send = () =>
    start(async () => {
      const res = await askQuestion({ body: text, topic, topicHref, planId });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Sent. Rangika will answer you soon, and you'll get an email.");
      setText("");
      if (!startOpen) setOpen(false);
    });

  return (
    <div className={cn("space-y-2 rounded-xl bg-stone-50 p-3 ring-1 ring-stone-200", className)}>
      {topic && <p className="text-xs text-stone-500">About: {topic}</p>}
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="min-h-[80px] bg-white text-base"
        aria-label="Your question"
        autoFocus={!startOpen}
        maxLength={3000}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" className="bg-sage-600 hover:bg-sage-700" disabled={pending || !text.trim()} onClick={send}>
          {pending ? "Sending…" : "Send question"}
        </Button>
        {!startOpen && (
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => setOpen(false)}>
            Cancel
          </Button>
        )}
        <span className="text-xs text-stone-500">Only Rangika sees this.</span>
      </div>
    </div>
  );
}
