"use client";

import { useEffect, useRef } from "react";
import { markJournalRepliesSeen } from "@/app/portal/actions";

/** Once the client has opened their journal, Rangika's new replies count as seen (clears the menu dot).
 *  The "New" labels stay on screen until the next visit. */
export function MarkRepliesSeen() {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const t = setTimeout(() => void markJournalRepliesSeen(), 1500);
    return () => clearTimeout(t);
  }, []);
  return null;
}
