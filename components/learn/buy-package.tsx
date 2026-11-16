"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

type Done = { newAccount: boolean; email: string };

function BuyForm({ packageId, title, priceLabel, onDone }: { packageId: string; title: string; priceLabel: string; onDone: (d: Done) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    if (!card) return;
    setBusy(true);
    setError(null);
    try {
      // 1. Start the payment (the server sets the price).
      const res = await fetch("/api/learn/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, name, email }),
      });
      const start = await res.json();
      if (!res.ok) throw new Error(start.error || "Something went wrong. Please try again.");

      // 2. Pay by card.
      const { error: payError, paymentIntent } = await stripe.confirmCardPayment(start.client_secret, {
        payment_method: { card, billing_details: { name, email } },
      });
      if (payError) throw new Error(payError.message || "The payment didn't go through.");
      if (paymentIntent?.status !== "succeeded") throw new Error("The payment didn't go through.");

      // 3. Set up their account and access (the server checks with Stripe).
      let newAccount = true;
      try {
        const c = await fetch("/api/learn/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        }).then((r) => r.json());
        newAccount = c.newAccount ?? true;
      } catch {
        // The Stripe webhook finishes the setup as well, so the purchase isn't lost.
      }
      onDone({ newAccount, email });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
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
        <Input id="buy-email" required type="email" maxLength={200} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <p className="text-xs text-stone-500">Your login details are sent here.</p>
      </div>
      <div className="space-y-1.5">
        <Label>Card</Label>
        <div className="rounded-md border border-input bg-white p-3">
          <CardElement options={{ style: { base: { fontSize: "16px", color: "#292524", "::placeholder": { color: "#a8a29e" } } } }} />
        </div>
      </div>
      <label className="flex items-start gap-2 text-sm text-stone-600">
        <input type="checkbox" className="mt-1" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
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
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">{error}</p>}
      <Button type="submit" disabled={!stripe || busy || !agreed} className="w-full bg-sage-600 py-3 hover:bg-sage-700">
        {busy ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…
          </>
        ) : (
          `Buy ${title} · ${priceLabel}`
        )}
      </Button>
      <p className="flex items-center justify-center gap-1 text-xs text-stone-500">
        <Lock className="h-3 w-3" /> Secure card payment by Stripe
      </p>
    </form>
  );
}

export function BuyPackage(props: { packageId: string; title: string; priceLabel: string }) {
  const [done, setDone] = useState<Done | null>(null);

  if (done) {
    return (
      <div className="space-y-3 rounded-xl bg-sage-50 p-4 text-stone-700 ring-1 ring-sage-200">
        <p className="flex items-center gap-2 font-medium text-sage-900">
          <CheckCircle2 className="h-5 w-5" /> Thank you! You&apos;re in.
        </p>
        <p className="text-sm">
          {done.newAccount
            ? `We've emailed your login details to ${done.email}. Sign in to start your first lesson.`
            : "The course has been added to your account. Sign in and open My learning."}
        </p>
        <Button asChild className="w-full bg-sage-600 hover:bg-sage-700">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }
  return (
    <Elements stripe={stripePromise}>
      <BuyForm {...props} onDone={setDone} />
    </Elements>
  );
}
