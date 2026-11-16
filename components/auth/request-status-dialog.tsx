"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type RequestStatus = "RequestSent" | "RequestPending" | "RequestDeclined";

const CONTENT: Record<RequestStatus, { icon: typeof CheckCircle2; tone: string; title: string; text: string; next: string }> = {
  RequestSent: {
    icon: CheckCircle2,
    tone: "bg-sage-100 text-sage-700",
    title: "Request sent successfully",
    text: "Your request has been sent to Rangika. You'll get an email as soon as she approves it.",
    next: "You don't need to do anything else for now.",
  },
  RequestPending: {
    icon: Clock,
    tone: "bg-amber-100 text-amber-700",
    title: "Still waiting for approval",
    text: "Your request is still waiting for Rangika's approval. You'll get an email when it's approved.",
    next: "There's no need to send it again.",
  },
  RequestDeclined: {
    icon: XCircle,
    tone: "bg-red-100 text-red-700",
    title: "Request not approved",
    text: "Your access request wasn't approved.",
    next: "Please contact Rangika if you think this is a mistake.",
  },
};

/** Pop-up shown after signing in with a Google account that doesn't have access yet. */
export function RequestStatusDialog({ status }: { status: RequestStatus }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(true), []);
  const c = CONTENT[status];
  const Icon = c.icon;

  const close = () => {
    setOpen(false);
    // Clear the message from the address so it doesn't pop up again on refresh.
    router.replace("/login", { scroll: false });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-sm text-center sm:max-w-md">
        <div className={cn("mx-auto flex h-16 w-16 items-center justify-center rounded-full", c.tone)}>
          <Icon className="h-9 w-9" aria-hidden />
        </div>
        <DialogHeader className="space-y-2 sm:text-center">
          <DialogTitle className="text-center font-serif text-2xl font-normal text-stone-800">{c.title}</DialogTitle>
          <DialogDescription className="text-center text-base text-stone-600">{c.text}</DialogDescription>
        </DialogHeader>
        <p className="text-sm text-stone-500">{c.next}</p>
        <Button onClick={close} className="mx-auto w-full max-w-[12rem] bg-sage-600 hover:bg-sage-700">
          OK
        </Button>
      </DialogContent>
    </Dialog>
  );
}
