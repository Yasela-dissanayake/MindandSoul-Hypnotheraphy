"use client";

import type { ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// One popup for every card payment on the website (sessions, courses, online learning):
// a spinner while the payment goes through, then either a clear success or the error.

export type PaymentState =
  | null
  | { status: "processing"; message?: string }
  | { status: "error"; title?: string; message: string }
  | { status: "success"; title: string; body: ReactNode; action?: ReactNode };

export function PaymentDialog({ state, onClose }: { state: PaymentState; onClose: () => void }) {
  const processing = state?.status === "processing";
  return (
    <DialogPrimitive.Root open={state !== null} onOpenChange={(open) => !open && !processing && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-stone-900/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          // While the payment is going through the popup can't be closed.
          onEscapeKeyDown={(e) => processing && e.preventDefault()}
          onPointerDownOutside={(e) => processing && e.preventDefault()}
          onInteractOutside={(e) => processing && e.preventDefault()}
          className="fixed left-1/2 top-1/2 z-[91] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 text-center shadow-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:p-8"
        >
          {state?.status === "processing" && (
            <div className="space-y-4" role="status" aria-live="polite">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-sage-600" aria-hidden />
              <DialogPrimitive.Title className="font-serif text-2xl text-stone-800">Processing your payment</DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm text-stone-600">
                {state.message ?? "Please wait and don't close or refresh this page."}
              </DialogPrimitive.Description>
            </div>
          )}

          {state?.status === "error" && (
            <div className="space-y-4" role="alert">
              <XCircle className="mx-auto h-12 w-12 text-red-600" aria-hidden />
              <DialogPrimitive.Title className="font-serif text-2xl text-stone-800">{state.title ?? "Payment not completed"}</DialogPrimitive.Title>
              <DialogPrimitive.Description className="rounded-lg bg-red-50 p-3 text-sm text-red-800 ring-1 ring-red-200">
                {state.message}
              </DialogPrimitive.Description>
              <p className="text-xs text-stone-500">You have not been charged. Check your card details and try again, or use a different card.</p>
              <Button onClick={onClose} className="w-full bg-sage-600 hover:bg-sage-700">
                Try again
              </Button>
            </div>
          )}

          {state?.status === "success" && (
            <div className="space-y-4" role="status">
              <CheckCircle2 className="mx-auto h-12 w-12 text-sage-600" aria-hidden />
              <DialogPrimitive.Title className="font-serif text-2xl text-stone-800">{state.title}</DialogPrimitive.Title>
              <DialogPrimitive.Description asChild>
                <div className="text-sm leading-relaxed text-stone-600">{state.body}</div>
              </DialogPrimitive.Description>
              <div className="space-y-2">
                {state.action}
                <Button variant="outline" onClick={onClose} className="w-full">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
