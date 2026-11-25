"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookPackageSession } from "@/components/portal/book-package-session";

type Mode = "IN_PERSON" | "DISTANCE";

/** On the admin client page: "Book a session" for one of the sessions left on their plan. */
export function AdminBookSession({ planId, serviceSlug, modes, left, clientName }: { planId: string; serviceSlug: string; modes: Mode[]; left: number; clientName: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  if (!open)
    return (
      <Button size="sm" className="bg-sage-600 text-white hover:bg-sage-700" onClick={() => setOpen(true)}>
        <CalendarPlus className="mr-2 h-4 w-4" /> Book a session for them
      </Button>
    );
  return (
    <div className="space-y-3 rounded-xl bg-white p-4 ring-1 ring-stone-200">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-stone-800">Book a session for {clientName}</p>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setOpen(false)} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-stone-500">Times are shown in your time zone. No payment is taken: it uses one of the {left} session{left === 1 ? "" : "s"} left on their plan.</p>
      <BookPackageSession
        planId={planId}
        serviceSlug={serviceSlug}
        modes={modes}
        left={left}
        forClient={clientName}
        onDone={() => {
          setOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
