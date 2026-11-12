"use client";

import { useEffect, useRef } from "react";
import { markJournalRead } from "@/app/admin/_actions/clients";

/** Marks the client's journal entries as read once Rangika has opened the Journal tab.
 *  "New" highlights stay on screen until the next visit. */
export function MarkJournalRead({ clientId }: { clientId: string }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const t = setTimeout(() => void markJournalRead(clientId), 1500);
    return () => clearTimeout(t);
  }, [clientId]);
  return null;
}
