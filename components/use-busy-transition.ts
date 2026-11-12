"use client";

import { useCallback, useTransition } from "react";
import { doneProgress, startProgress } from "./navigation-progress";

/** Like React's useTransition, but also shows the top progress bar while the work runs. */
export function useBusyTransition(): [boolean, (fn: () => Promise<void> | void) => void] {
  const [pending, startTransition] = useTransition();
  const start = useCallback((fn: () => Promise<void> | void) => {
    startProgress();
    startTransition(async () => {
      try {
        await fn();
      } finally {
        doneProgress();
      }
    });
  }, []);
  return [pending, start];
}
