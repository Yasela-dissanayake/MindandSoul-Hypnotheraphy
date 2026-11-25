"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Lock } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaymentDialog, type PaymentState } from "@/components/payment-dialog";
import { friendlyError } from "@/lib/friendly-error";
import { useClientViewer } from "@/components/site/viewer-context";
import { cn } from "@/lib/utils";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

type Done = { newAccount: boolean; email: string };
type Kind = "package" | "course";

const API: Record<Kind, string> = { package: "/api/learn", course: "/api/courses" };

function doneMessage(kind: Kind, done: Done) {
  return kind === "course"
    ? done.newAccount
      ? `Your place is booked. We've emailed your login details to ${done.email}. Rangika will be in touch with the class details.`
      : "Your place is booked and the class is in your account under My classes. Rangika will be in touch with the class details."
    : done.newAccount
      ? `We've emailed your login details to ${done.email}. Sign in to start your first lesson.`
      : "The course has been added to your account. Sign in and open My courses.";
}

/**
 * Extra settings: the currency they pay in (as shown), a prerequisite to confirm (classes), and
 * `free` = free under the running promotion (no card; the server checks this again).
 */
type ClassOptions = { currency?: "aud" | "aed"; prerequisite?: string | null; free?: boolean };

function BuyForm({
  packageId,
  title,
  priceLabel,
  kind,
  onDone,
  currency,
  prerequisite,
  free = false,
}: { packageId: string; title: string; priceLabel: string; kind: Kind; onDone: (d: Done) => void } & ClassOptions) {
  const stripe = useStripe();
  const elements = useElements();
  // Signed in: their details are filled in (the email stays theirs, so the purchase lands in their account).
  const me = useClientViewer();
  const [name, setName] = useState(me?.name ?? "");
  const [email, setEmail] = useState(me?.email ?? "");
  const [phone, setPhone] = useState(me?.phone ?? "");
  const mySpace = kind === "course" ? "/portal/classes" : "/portal/courses";
  const [agreed, setAgreed] = useState(false);
  const [prereqDone, setPrereqDone] = useState(false);
  const [dialog, setDialog] = useState<PaymentState>(null);
  const [paid, setPaid] = useState<Done | null>(null);
  const busy = dialog?.status === "processing";

  const closeDialog = () => {
    setDialog(null);
    if (paid) onDone(paid);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const card = free ? null : elements?.getElement(CardElement);
    if (!free && (!stripe || !card)) return;
    setDialog({ status: "processing" });
    try {
      // 1. Start the payment (the server sets the price).
      const res = await fetch(`${API[kind]}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          kind === "course"
            ? { itemId: packageId, name, email, phone, currency, prerequisiteDone: prereqDone, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }
            : { packageId, name, email, currency },
        ),
      });
      const start = await res.json();
      if (!res.ok) {
        // They already have it (or already paid): offer "Sign in" instead of "Try again".
        // A bundle with classes they already have: offer only the missing class(es) instead.
        const suggest: { title: string; href: string }[] = Array.isArray(start.suggest) ? start.suggest : [];
        if (start.owned && suggest.length) {
          setDialog({
            status: "error",
            title: "You already have part of this bundle",
            message: start.error,
            hint: "You have not been charged.",
            action: (
              <div className="space-y-2">
                {suggest.map((s) => (
                  <Button key={s.href} asChild className="h-auto w-full whitespace-normal bg-sage-600 py-2.5 hover:bg-sage-700">
                    <Link href={s.href}>Buy {s.title} only</Link>
                  </Button>
                ))}
              </div>
            ),
          });
          return;
        }
        if (start.owned) {
          setDialog({
            status: "error",
            title: kind === "course" ? "You're already enrolled" : "You already have this course",
            message: start.error,
            hint: me ? "You have not been charged again. It's already in your private space." : "You have not been charged again. Sign in with the username and password we emailed you when you first bought it.",
            action: (
              <Button asChild className="w-full bg-sage-600 hover:bg-sage-700">
                <Link href={me ? mySpace : "/login"}>{me ? "Open my space" : "Sign in"}</Link>
              </Button>
            ),
          });
          return;
        }
        throw new Error(start.error || "Something went wrong. Please try again.");
      }

      // Free under a promotion: the server has already set up their account and access.
      if (start.free) {
        const done = { newAccount: Boolean(start.newAccount), email };
        setPaid(done);
        setDialog({
          status: "success",
          title: kind === "course" ? "You're enrolled, free of charge!" : "The course is yours, free of charge!",
          body: (
            <>
              <p className="font-medium text-stone-800">{title}</p>
              <p className="mt-2">{doneMessage(kind, done)}</p>
            </>
          ),
          action: (
            <Button asChild className="w-full bg-sage-600 hover:bg-sage-700">
              <Link href={me ? mySpace : "/login?bought=1"}>{me ? "Open my space" : "Sign in"}</Link>
            </Button>
          ),
        });
        return;
      }

      // 2. Pay by card.
      const { error: payError, paymentIntent } = await stripe!.confirmCardPayment(start.client_secret, {
        payment_method: { card: card!, billing_details: { name, email } },
      });
      if (payError) throw new Error(payError.message || "The payment didn't go through.");
      if (paymentIntent?.status !== "succeeded") throw new Error("The payment didn't go through.");

      // 3. Set up their account and access (the server checks with Stripe).
      let newAccount = true;
      try {
        const c = await fetch(`${API[kind]}/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        }).then((r) => r.json());
        newAccount = c.newAccount ?? true;
      } catch {
        // The Stripe webhook finishes the setup as well, so the purchase isn't lost.
      }
      const done = { newAccount, email };
      setPaid(done);
      setDialog({
        status: "success",
        title: kind === "course" ? "Payment successful. You're enrolled!" : "Payment successful. You're in!",
        body: (
          <>
            <p className="font-medium text-stone-800">{title}</p>
            <p className="mt-2">{doneMessage(kind, done)}</p>
          </>
        ),
        action: (
          <Button asChild className="w-full bg-sage-600 hover:bg-sage-700">
            <Link href={me ? mySpace : "/login?bought=1"}>{me ? "Open my space" : "Sign in"}</Link>
          </Button>
        ),
      });
    } catch (err) {
      setDialog({ status: "error", message: friendlyError(err, "Something went wrong. Please try again.") });
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="buy-name">Your name</Label>
        <Input id="buy-name" required maxLength={100} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="buy-email">Email</Label>
        <Input
          id="buy-email"
          required
          type="email"
          maxLength={200}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          readOnly={Boolean(me)}
          className={cn(me && "bg-stone-50 text-stone-600")}
        />
        <p className="text-xs text-stone-500">{me ? "You're signed in, so this goes to your account." : "Your login details are sent here."}</p>
      </div>
      {kind === "course" && (
        <div className="space-y-1.5">
          <Label htmlFor="buy-phone">Phone (optional)</Label>
          <Input id="buy-phone" type="tel" maxLength={40} autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <p className="text-xs text-stone-500">So Rangika can reach you about the class.</p>
        </div>
      )}
      {!free && (
        <div className="space-y-1.5">
          <Label>Card</Label>
          <div className="rounded-md border border-input bg-white p-3">
            <CardElement options={{ style: { base: { fontSize: "16px", color: "#292524", "::placeholder": { color: "#a8a29e" } } } }} />
          </div>
        </div>
      )}
      {prerequisite && (
        <label className="flex items-start gap-2 rounded-lg bg-sage-50 p-3 text-sm text-stone-700 ring-1 ring-sage-200">
          <input suppressHydrationWarning type="checkbox" className="mt-1" required checked={prereqDone} onChange={(e) => setPrereqDone(e.target.checked)} />
          <span>I have completed {prerequisite} (with Rangika or another Reiki teacher).</span>
        </label>
      )}
      <label className="flex items-start gap-2 text-sm text-stone-600">
        <input suppressHydrationWarning type="checkbox" className="mt-1" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        <span>
          I agree to the{" "}
          <a href="/terms" target="_blank" rel="noreferrer" className="text-sage-700 underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" target="_blank" rel="noreferrer" className="text-sage-700 underline">
            Privacy Policy
          </a>
          .
        </span>
      </label>
      <Button
        type="submit"
        disabled={(!free && !stripe) || busy || !agreed || (Boolean(prerequisite) && !prereqDone)}
        className="w-full bg-sage-600 py-3 hover:bg-sage-700"
      >
        {free ? (kind === "course" ? "Join for free" : "Get it for free") : `${kind === "course" ? "Enroll" : "Buy"} · ${priceLabel}`}
      </Button>
      <p className="flex items-center justify-center gap-1 text-xs text-stone-500">
        {free ? (
          "Free during the current promotion. No card needed."
        ) : (
          <>
            <Lock className="h-3 w-3" /> Secure card payment by Stripe
          </>
        )}
      </p>
      <PaymentDialog state={dialog} onClose={closeDialog} />
    </form>
  );
}

export function BuyPackage({ kind = "package", ...props }: { packageId: string; title: string; priceLabel: string; kind?: Kind } & ClassOptions) {
  const [done, setDone] = useState<Done | null>(null);
  const me = useClientViewer();

  if (done) {
    return (
      <div className="space-y-3 rounded-xl bg-sage-50 p-4 text-stone-700 ring-1 ring-sage-200">
        <p className="flex items-center gap-2 font-medium text-sage-900">
          <CheckCircle2 className="h-5 w-5" /> Thank you! You&apos;re in.
        </p>
        <p className="text-sm">{doneMessage(kind, done)}</p>
        <Button asChild className="w-full bg-sage-600 hover:bg-sage-700">
          <Link href={me ? (kind === "course" ? "/portal/classes" : "/portal/courses") : "/login?bought=1"}>{me ? "Open my space" : "Sign in"}</Link>
        </Button>
      </div>
    );
  }
  return (
    <Elements stripe={stripePromise}>
      <BuyForm {...props} kind={kind} onDone={setDone} />
    </Elements>
  );
}
