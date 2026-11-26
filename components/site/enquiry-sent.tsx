"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, Clock, Mail, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export type SentEnquiry = { type: "consultation" | "question"; name: string; method: string };

/** Pulls what the thank-you message needs from a submitted enquiry form. */
export function sentFrom(type: SentEnquiry["type"], body: Record<string, FormDataEntryValue>): SentEnquiry {
  const name = String(body.firstName || body.name || "").trim().split(/\s+/)[0] ?? "";
  return { type, name, method: String(body.contactMethod || "").trim() };
}

/** "by phone" / "by email" / "on WhatsApp", from the preferred contact method they chose. */
function howWeReply(method: string) {
  const m = method.toLowerCase();
  if (m.includes("whatsapp")) return { text: "on WhatsApp", icon: MessageCircle };
  if (m.includes("phone") || m.includes("call") || m.includes("text") || m.includes("sms")) return { text: "by phone", icon: Phone };
  return { text: "by email", icon: Mail };
}

/** Shown in place of the enquiry form once it has been sent: a calm, clear "thank you". */
export function EnquirySent({ sent, onAgain }: { sent: SentEnquiry; onAgain: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  // Bring the message into view and give it focus, so screen readers announce it too.
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    ref.current?.focus({ preventScroll: true });
  }, []);
  const reply = howWeReply(sent.method);
  const consultation = sent.type === "consultation";
  return (
    <div ref={ref} tabIndex={-1} role="status" aria-live="polite" className="space-y-5 py-4 text-center outline-none">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-100 ring-8 ring-sage-50">
        <CheckCircle2 className="h-8 w-8 text-sage-700" aria-hidden />
      </span>
      <div className="space-y-2">
        <h3 className="font-serif text-2xl text-stone-800">{sent.name ? `Thank you, ${sent.name}!` : "Thank you!"}</h3>
        <p className="mx-auto max-w-md text-stone-600">
          {consultation ? "Your request for a free consultation has been sent to Rangika." : "Your question has been sent to Rangika."}
        </p>
      </div>
      <div className="mx-auto flex max-w-md flex-col gap-2 rounded-xl bg-stone-50 p-4 text-left text-sm text-stone-700 ring-1 ring-stone-200">
        <p className="flex items-start gap-2.5">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" aria-hidden />
          She usually replies within 24 hours.
        </p>
        <p className="flex items-start gap-2.5">
          <reply.icon className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" aria-hidden />
          {consultation ? `She'll contact you ${reply.text} to arrange a time that suits you.` : "She'll reply by email."}
        </p>
      </div>
      <Button type="button" variant="outline" onClick={onAgain} className="border-sage-300 text-sage-800 hover:bg-sage-50">
        Send another message
      </Button>
    </div>
  );
}
