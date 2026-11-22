"use client";

import { useRouter } from "next/navigation";
import { Check, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { useBusyTransition } from "@/components/use-busy-transition";
import { Button } from "@/components/ui/button";
import { markAllJournalRead, setJournalEntryRead } from "@/app/admin/_actions/journal";
import { cn } from "@/lib/utils";

/** Tick a journal entry as read once Rangika has gone through it (click again to make it unread). */
export function JournalReadButton({ entryId, read, compact }: { entryId: string; read: boolean; compact?: boolean }) {
  const router = useRouter();
  const [pending, start] = useBusyTransition();
  const toggle = () =>
    start(async () => {
      const res = await setJournalEntryRead(entryId, !read);
      if (!res.ok) return void toast.error(res.error);
      toast.success(read ? "Marked as unread" : "Marked as read");
      router.refresh();
    });

  if (read) {
    return (
      <button
        suppressHydrationWarning
        type="button"
        onClick={toggle}
        disabled={pending}
        title="Click to mark as unread"
        className="inline-flex items-center gap-1 rounded-full bg-sage-100 px-2.5 py-1 text-xs font-medium text-sage-800 transition hover:bg-sage-200 disabled:opacity-60"
      >
        <Check className="h-3.5 w-3.5" aria-hidden /> Read
      </button>
    );
  }
  return (
    <button
      suppressHydrationWarning
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label="Mark as read"
      title="Mark as read"
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-sage-300 bg-white font-medium text-sage-800 transition hover:border-sage-600 hover:bg-sage-600 hover:text-white disabled:opacity-60",
        compact ? "h-8 w-8 justify-center" : "px-3 py-1 text-xs",
      )}
    >
      <Check className={compact ? "h-4 w-4" : "h-3.5 w-3.5"} aria-hidden />
      {!compact && (pending ? "Marking…" : "Mark as read")}
    </button>
  );
}

/** Tick all of one person's unread entries at once. */
export function MarkAllJournalReadButton({ clientId, count }: { clientId: string; count: number }) {
  const router = useRouter();
  const [pending, start] = useBusyTransition();
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={pending}
      className="gap-2 border-sage-300 text-sage-800 hover:bg-sage-50"
      onClick={() =>
        start(async () => {
          const res = await markAllJournalRead(clientId);
          if (!res.ok) return void toast.error(res.error);
          toast.success("All entries marked as read");
          router.refresh();
        })
      }
    >
      <CheckCheck className="h-4 w-4" /> Mark all {count} as read
    </Button>
  );
}
