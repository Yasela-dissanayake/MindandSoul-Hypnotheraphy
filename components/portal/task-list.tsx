"use client";

import { useBusyTransition } from "@/components/use-busy-transition";
import { useOptimistic, useState } from "react";
import { Check, FileText, Headphones, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { completeTask, undoTask } from "@/app/portal/actions";
import { Celebration, useEncourage, type EncourageConfig } from "./encourage";
import { ResourceItem, type ResourceView } from "./resource-item";
import { AskQuestion } from "./ask-question";

type Task = {
  id: string;
  title: string;
  instructions: string | null;
  done: boolean;
  context: string | null;
  resource: { id: string; title: string; kind: ResourceView["kind"]; url: string | null } | null;
};

export function TaskList({ tasks, encourage }: { tasks: Task[]; encourage: EncourageConfig }) {
  const [, start] = useBusyTransition();
  const [optimistic, setOptimistic] = useOptimistic(tasks, (state, { id, done }: { id: string; done: boolean }) =>
    state.map((t) => (t.id === id ? { ...t, done } : t)),
  );
  const [celebrate, setCelebrate] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const play = useEncourage(encourage);

  const toggle = (task: Task) => {
    const done = !task.done;
    if (done) {
      // Speak/animate straight away (inside the tap, so phones allow audio).
      play();
      setCelebrate((c) => c + 1);
    }
    start(async () => {
      setOptimistic({ id: task.id, done });
      const res = done ? await completeTask(task.id) : await undoTask(task.id);
      if (!res.ok) toast.error(res.error);
    });
  };

  return (
    <>
      <Celebration show={celebrate > 0} key={celebrate} />
      <ul className="space-y-3">
        {optimistic.map((t) => {
          const Icon = t.resource?.kind === "AUDIO" ? Headphones : t.resource?.kind === "VIDEO" || t.resource?.kind === "VIDEO_FILE" ? PlayCircle : FileText;
          const expanded = open === t.id;
          return (
            <li key={t.id} className={cn("rounded-2xl bg-white ring-1 transition", t.done ? "ring-sage-200" : "ring-stone-200")}>
              <div className="flex items-start gap-4 p-4">
                <button suppressHydrationWarning
                  onClick={() => toggle(t)}
                  aria-label={t.done ? `Mark "${t.title}" as not done` : `Mark "${t.title}" as done`}
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-all active:scale-90",
                    t.done ? "border-sage-500 bg-sage-500 text-white" : "border-stone-300 text-transparent hover:border-sage-400",
                  )}
                >
                  <Check className="h-6 w-6" />
                </button>
                <div className="min-w-0 flex-1 pt-1">
                  {t.context && <p className="text-xs uppercase tracking-wide text-sage-600">{t.context}</p>}
                  <p className={cn("font-medium", t.done ? "text-stone-400 line-through" : "text-stone-800")}>{t.title}</p>
                  {t.instructions && <p className="mt-1 whitespace-pre-line text-sm text-stone-600">{t.instructions}</p>}
                  {t.resource && (
                    <button suppressHydrationWarning
                      onClick={() => setOpen(expanded ? null : t.id)}
                      className="mt-2 inline-flex items-center gap-1.5 text-sm text-sage-700 hover:underline"
                    >
                      <Icon className="h-4 w-4" />
                      {expanded ? "Hide" : t.resource.kind === "AUDIO" ? "Listen" : t.resource.kind === "VIDEO" || t.resource.kind === "VIDEO_FILE" ? "Watch" : "Open"}:{" "}
                      {t.resource.title}
                    </button>
                  )}
                  <div className="mt-2">
                    <AskQuestion topic={t.title} topicHref="/portal" label="Ask about this" className="text-xs" />
                  </div>
                </div>
              </div>
              {expanded && t.resource && (
                <div className="px-4 pb-4">
                  <ResourceItem r={{ ...t.resource, description: null }} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
