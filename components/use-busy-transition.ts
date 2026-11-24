"use client";

import { useCallback, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { doneProgress, startProgress } from "./navigation-progress";

/**
 * Like React's useTransition, but also shows the top progress bar while the work runs.
 * If the work fails unexpectedly (no internet, the server didn't answer, the site was just updated),
 * a friendly message pops up instead of the page crashing.
 */
export function useBusyTransition(): [boolean, (fn: () => Promise<void> | void) => void] {
  const [pending, startTransition] = useTransition();
  const start = useCallback((fn: () => Promise<void> | void) => {
    startProgress();
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        unstable_rethrow(e); // let Next.js handle its own redirects and "not found"
        console.error(e);
        toast.error(friendlyError(e));
      } finally {
        doneProgress();
      }
    });
  }, []);
  return [pending, start];
}
