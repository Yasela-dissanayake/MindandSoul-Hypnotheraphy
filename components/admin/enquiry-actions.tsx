"use client";

import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteEnquiry, setEnquiryHandled } from "@/app/admin/_actions/enquiries";
import { ConfirmButton } from "./confirm-button";
import { useAction } from "./use-action";

/** "Mark as contacted" / "Move back to open" and Delete for one enquiry. */
export function EnquiryActions({ id, name, handled }: { id: string; name: string; handled: boolean }) {
  const { pending, run } = useAction();
  return (
    <div className="flex shrink-0 items-center gap-1">
      {handled ? (
        <Button size="sm" variant="ghost" disabled={pending} className="text-stone-500" onClick={() => run(() => setEnquiryHandled(id, false), "Moved back to open")}>
          <RotateCcw className="mr-1 h-3.5 w-3.5" /> Move back to open
        </Button>
      ) : (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setEnquiryHandled(id, true), "Marked as contacted")}>
          <Check className="mr-1 h-3.5 w-3.5" /> Mark as contacted
        </Button>
      )}
      <ConfirmButton
        icon
        title={`Delete the message from ${name}?`}
        description="It will be deleted for good."
        onConfirm={() => run(() => deleteEnquiry(id), "Deleted")}
      />
    </div>
  );
}
