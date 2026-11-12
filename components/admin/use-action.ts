"use client";

import { useBusyTransition } from "@/components/use-busy-transition";
import { toast } from "sonner";

type Result = { ok: true; data?: unknown } | { ok: false; error: string };

/** Runs a server action with a pending state and friendly toasts. */
export function useAction() {
  const [pending, start] = useBusyTransition();
  const run = (fn: () => Promise<Result>, success?: string, after?: (r: Result) => void) =>
    start(async () => {
      try {
        const res = await fn();
        if (!res.ok) toast.error(res.error);
        else if (success) toast.success(success);
        after?.(res);
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  return { pending, run };
}
