"use client";

import { useState } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { CalendarDays, Check, Clock, Globe, Lock, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PaymentDialog, type PaymentState } from "@/components/payment-dialog";
import { SlotPicker, myTz, type Slot } from "@/components/booking/slot-picker";
import { cn } from "@/lib/utils";
import { friendlyError } from "@/lib/friendly-error";
import { useClientViewer } from "@/components/site/viewer-context";

// The booking page: pick a session (single or package) → in person or online → a time → your details → pay.
// (Self-paced recorded journeys are the pre-built Courses, not booked here.)
// The price shown comes from the server; the server works it out again when the payment starts.

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

// free = free under the running promotion (the server checks this again when booking).
export type BookingOption = {
  id: string;
  title: string;
  sessions: number;
  note: string | null;
  mode: "IN_PERSON" | "DISTANCE" | null;
  price: number;
  was?: number; // the usual price, when a promotion takes some off
  currency: "aud" | "aed";
  free?: boolean;
};
export type BookingService = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: "HYPNOTHERAPY" | "REIKI_HEALING" | "ANIMAL_REIKI";
  lengthLabel: string | null;
  inPerson: boolean;
  online: boolean;
  options: BookingOption[];
  promoted?: boolean; // the running promotion is about this service
  discount?: number; // % off its prices while the promotion runs
};
type Mode = "IN_PERSON" | "DISTANCE";

const GROUPS: { category: BookingService["category"]; label: string }[] = [
  { category: "HYPNOTHERAPY", label: "Clinical Hypnotherapy" },
  { category: "REIKI_HEALING", label: "Reiki Energy Healing" },
  { category: "ANIMAL_REIKI", label: "Animal Reiki & Communication" },
];

const money = (amount: number, currency: string) => {
  const v = amount / 100;
  return `${currency.toUpperCase()} ${v.toLocaleString("en-AU", { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 })}`;
};
/** "Free" (with the usual price crossed out) for a free option, otherwise the price. */
function Price({ o, className }: { o: BookingOption; className?: string }) {
  if (!o.free && o.was)
    return (
      <span className={cn("inline-flex items-baseline gap-1.5", className)}>
        <span className="text-amber-700">{money(o.price, o.currency)}</span>
        <span className="text-xs font-normal text-stone-400 line-through">{money(o.was, o.currency)}</span>
      </span>
    );
  if (!o.free) return <span className={className}>{money(o.price, o.currency)}</span>;
  return (
    <span className={cn("inline-flex items-baseline gap-1.5", className)}>
      <span className="text-amber-700">Free</span>
      {o.price > 0 && <span className="text-xs font-normal text-stone-400 line-through">{money(o.price, o.currency)}</span>}
    </span>
  );
}
const modesOf = (s: BookingService, o: BookingOption | null): Mode[] =>
  o?.mode ? [o.mode] : ([s.inPerson && "IN_PERSON", s.online && "DISTANCE"].filter(Boolean) as Mode[]);
const MODE_TEXT: Record<Mode, { title: string; text: string; icon: typeof MapPin }> = {
  IN_PERSON: { title: "In person", text: "At Rangika's practice in Perth", icon: MapPin },
  DISTANCE: { title: "Online / distance", text: "From home, wherever you are", icon: Globe },
};

function Step({ n, title, done, children }: { n: number; title: string; done?: boolean; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6">
      <h2 className="flex items-center gap-3 font-serif text-xl text-stone-800">
        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold", done ? "bg-sage-600 text-white" : "bg-sage-100 text-sage-800")}>
          {done ? <Check className="h-4 w-4" /> : n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function BookingFlow({
  services,
  initial,
}: {
  services: BookingService[];
  initial: { service?: string; sessions?: number; mode?: string };
}) {
  const start = services.find((s) => s.slug === initial.service) ?? null;
  const [serviceId, setServiceId] = useState<string | null>(start?.id ?? null);
  // Arriving from a service's page: show just that service, with a way to choose another.
  const [showAll, setShowAll] = useState(!start);
  const service = services.find((s) => s.id === serviceId) ?? null;
  const [optionId, setOptionId] = useState<string | null>(
    start ? (start.options.find((o) => o.sessions === initial.sessions) ?? (start.options.length === 1 ? start.options[0] : null))?.id ?? null : null,
  );
  const option = service?.options.find((o) => o.id === optionId) ?? null;
  const modes = service ? modesOf(service, option) : [];
  const [mode, setMode] = useState<Mode | null>(initial.mode === "in-person" ? "IN_PERSON" : initial.mode === "distance" || initial.mode === "online" ? "DISTANCE" : null);
  const chosenMode = mode && modes.includes(mode) ? mode : modes.length === 1 ? modes[0] : null;
  const [slot, setSlot] = useState<Slot | null>(null);
  const [date, setDate] = useState<string | null>(null);

  const pickService = (id: string) => {
    const s = services.find((x) => x.id === id)!;
    setServiceId(id);
    setOptionId(s.options.length === 1 ? s.options[0].id : null);
    setSlot(null);
    setDate(null);
    setShowAll(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="min-w-0 space-y-6">
        <Step n={1} title="Choose your session" done={Boolean(option && chosenMode)}>
          {!showAll && service ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sage-50 p-4 ring-2 ring-sage-500">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-sage-700">{GROUPS.find((g) => g.category === service.category)?.label}</p>
                <p className="font-medium text-stone-800">{service.title}</p>
              </div>
              <button suppressHydrationWarning type="button" onClick={() => setShowAll(true)} className="text-sm text-sage-700 underline">
                Choose a different session
              </button>
            </div>
          ) : (
          <div className="space-y-5">
            {GROUPS.map((g) => {
              const list = services.filter((s) => s.category === g.category);
              if (!list.length) return null;
              return (
                <div key={g.category} className="space-y-2">
                  <p className="text-sm font-medium text-stone-700">{g.label}</p>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((s) => {
              const from = s.options.reduce((m, o) => (o.price < m.price ? o : m), s.options[0]);
              const active = s.id === serviceId;
              return (
                <button suppressHydrationWarning
                  key={s.id}
                  type="button"
                  onClick={() => pickService(s.id)}
                  aria-pressed={active}
                  className={cn(
                    "space-y-1 rounded-xl p-3 text-left ring-1 transition",
                    active ? "bg-sage-50 ring-2 ring-sage-500" : "bg-white ring-stone-200 hover:ring-sage-300",
                  )}
                >
                  <p className="flex flex-wrap items-center gap-2 font-medium text-stone-800">
                    {s.title}
                    {s.promoted && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                        {s.options.some((o) => o.free) ? "Free session" : s.discount ? `${s.discount}% off` : "Special offer"}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-stone-500">
                    {[s.lengthLabel, s.inPerson && s.online ? "In person or online" : s.inPerson ? "In person" : "Online / distance"].filter(Boolean).join(" · ")}
                  </p>
                  {s.options.some((o) => o.free) ? (
                    <p className="text-sm font-medium text-amber-700">Single session free</p>
                  ) : (
                    from && (
                      <p className="text-sm text-sage-800">
                        {s.options.length > 1 ? "From " : ""}
                        <span className={from.was ? "font-medium text-amber-700" : undefined}>{money(from.price, from.currency)}</span>
                        {from.was && <span className="ml-1.5 text-xs text-stone-400 line-through">{money(from.was, from.currency)}</span>}
                      </p>
                    )
                  )}
                </button>
              );
            })}
                  </div>
                </div>
              );
            })}
          </div>
          )}

          {service && service.options.length > 1 && (
            <div className="space-y-2 border-t border-stone-100 pt-4">
              <p className="text-sm font-medium text-stone-700">Single session or a package</p>
              <div className="space-y-2">
                {service.options.map((o) => (
                  <label
                    key={o.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl p-3 ring-1 transition",
                      o.id === optionId ? "bg-sage-50 ring-2 ring-sage-500" : "ring-stone-200 hover:ring-sage-300",
                    )}
                  >
                    <input suppressHydrationWarning type="radio" name="option" className="mt-1" checked={o.id === optionId} onChange={() => (setOptionId(o.id), setSlot(null))} />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-medium text-stone-800">{o.title}</span>
                        <Price o={o} className="font-semibold text-stone-800" />
                      </span>
                      {o.sessions > 1 && (
                        <span className="block text-xs text-stone-500">
                          {money(Math.round(o.price / o.sessions), o.currency)} per session · you book your first session now and the rest from your private space
                        </span>
                      )}
                      {o.note && <span className="block text-xs text-sage-700">{o.note}</span>}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {service && option && modes.length > 1 && (
            <div className="space-y-2 border-t border-stone-100 pt-4">
              <p className="text-sm font-medium text-stone-700">In person or online?</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {modes.map((m) => {
                  const M = MODE_TEXT[m];
                  return (
                    <button suppressHydrationWarning
                      key={m}
                      type="button"
                      onClick={() => (setMode(m), setSlot(null), setDate(null))}
                      aria-pressed={chosenMode === m}
                      className={cn(
                        "flex items-start gap-3 rounded-xl p-3 text-left ring-1 transition",
                        chosenMode === m ? "bg-sage-50 ring-2 ring-sage-500" : "ring-stone-200 hover:ring-sage-300",
                      )}
                    >
                      <M.icon className="mt-0.5 h-4 w-4 text-sage-600" />
                      <span>
                        <span className="block font-medium text-stone-800">{M.title}</span>
                        <span className="block text-xs text-stone-500">{M.text}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </Step>

        {service && option && chosenMode && (
          <Step n={2} title="Choose a date and time" done={Boolean(slot)}>
            <SlotPicker serviceSlug={service.slug} mode={chosenMode} date={date} slot={slot} onDate={setDate} onSlot={setSlot} />
          </Step>
        )}

        {service && option && chosenMode && slot && (
          <Step n={3} title={option.free ? "Your details" : "Your details and payment"}>
            <Elements stripe={stripePromise}>
              <DetailsAndPay service={service} option={option} mode={chosenMode} slot={slot} onSlotTaken={() => setSlot(null)} />
            </Elements>
          </Step>
        )}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <p className="font-serif text-lg text-stone-800">Your booking</p>
          {!service ? (
            <p className="text-sm text-stone-500">Choose a session to start.</p>
          ) : (
            <ul className="space-y-2 text-sm text-stone-700">
              <li className="font-medium text-stone-800">{service.title}</li>
              {option && (
                <li className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-sage-600" /> {option.title}
                </li>
              )}
              {service.lengthLabel && (
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-sage-600" /> {service.lengthLabel}
                </li>
              )}
              {chosenMode && (
                <li className="flex items-center gap-2">
                  {chosenMode === "IN_PERSON" ? <MapPin className="h-4 w-4 text-sage-600" /> : <Globe className="h-4 w-4 text-sage-600" />} {MODE_TEXT[chosenMode].title}
                </li>
              )}
              {slot && (
                <li className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-sage-600" /> <SlotText slot={slot} />
                </li>
              )}
              {option && (
                <li className="border-t border-stone-100 pt-2 text-base font-semibold text-stone-800">
                  <Price o={option} />
                </li>
              )}
            </ul>
          )}
          <p className="text-xs text-stone-500">
            Not sure which session is right for you?{" "}
            <Link href={service ? `/contact?about=${encodeURIComponent(service.title)}#enquiry` : "/contact#enquiry"} className="text-sage-700 underline">
              Ask for a free consultation
            </Link>
            .
          </p>
        </div>
      </aside>
    </div>
  );
}

function SlotText({ slot }: { slot: Slot }) {
  const tz = myTz();
  const d = new Date(slot.startsAt);
  const day = d.toLocaleDateString("en-AU", { timeZone: tz, weekday: "short", day: "numeric", month: "short" });
  const t = (x: string) => new Date(x).toLocaleTimeString("en-AU", { timeZone: tz, hour: "numeric", minute: "2-digit" });
  return (
    <span>
      {day}, {t(slot.startsAt)} – {t(slot.endsAt)}
    </span>
  );
}

function DetailsAndPay({ service, option, mode, slot, onSlotTaken }: { service: BookingService; option: BookingOption; mode: Mode; slot: Slot; onSlotTaken: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  // Signed in: their name, email and phone are filled in (the email stays theirs, so the booking lands in their account).
  const me = useClientViewer();
  const [f, setF] = useState({
    firstName: me?.firstName ?? "",
    lastName: me?.lastName ?? "",
    email: me?.email ?? "",
    phone: me?.phone ?? "",
    concerns: "",
    previousTherapy: "",
    medicalConditions: "",
  });
  const goTo = me ? { href: "/portal/sessions", label: "Open my space" } : { href: "/login?bought=1", label: "Sign in" };
  const [agreed, setAgreed] = useState(false);
  const [dialog, setDialog] = useState<PaymentState>(null);
  const [slotTaken, setSlotTaken] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const busy = dialog?.status === "processing";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const free = Boolean(option.free);
    const card = free ? null : elements?.getElement(CardElement);
    if (!free && (!stripe || !card)) return;
    setDialog({ status: "processing" });
    let paymentIntentId: string | null = null;
    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: option.id, mode, currency: option.currency, date: slotDate(slot), start: slot.start, timezone: myTz(), ...f }),
      });
      const start = await res.json();
      if (!res.ok) {
        if (start.code === "SLOT_TAKEN") setSlotTaken(true);
        throw new Error(start.error || "Something went wrong. Please try again.");
      }
      if (start.free) {
        // Free under a promotion: booked and confirmed already, nothing to pay.
        setDialog({
          status: "success",
          title: "Your free session is booked!",
          body: (
            <>
              <p className="font-medium text-stone-800">
                {service.title} · {option.title}
              </p>
              <p className="mt-1">
                <SlotText slot={slot} /> · {MODE_TEXT[mode].title}
              </p>
              <p className="mt-2">
                We&apos;ve emailed the details to {f.email}.{" "}
                {me
                  ? "It's in your private space now."
                  : start.newAccount
                    ? "Your private space is ready: sign in with the username and password in that email."
                    : "You'll find it in your private space when you sign in."}
              </p>
            </>
          ),
          action: (
            <Button asChild className="w-full bg-sage-600 hover:bg-sage-700">
              <Link href={goTo.href}>{goTo.label}</Link>
            </Button>
          ),
        });
        return;
      }
      paymentIntentId = start.payment_intent_id;
      const { error, paymentIntent } = await stripe!.confirmCardPayment(start.client_secret, {
        payment_method: { card: card!, billing_details: { name: `${f.firstName} ${f.lastName}`, email: f.email, phone: f.phone || undefined } },
      });
      if (error || paymentIntent?.status !== "succeeded") {
        // Let the time go straight away so they (or someone else) can book it.
        void fetch(`/api/create-payment-intent?payment_intent_id=${encodeURIComponent(paymentIntentId!)}`, { method: "DELETE" });
        throw new Error(error?.message || "The payment didn't go through.");
      }
      await fetch("/api/booking/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentIntentId: paymentIntent.id }) }).catch(() => {});
      setDialog({
        status: "success",
        title: "Payment successful. Your session is booked!",
        body: (
          <>
            <p className="font-medium text-stone-800">
              {service.title} · {option.title}
            </p>
            <p className="mt-1">
              <SlotText slot={slot} /> · {MODE_TEXT[mode].title}
            </p>
            <p className="mt-2">
              We&apos;ve emailed the details to {f.email}.{" "}
              {me ? "It's in your private space now" : "Your private space is ready: sign in with the username and password in that email"}
              {option.sessions > 1
                ? `${me ? ", where you can book" : " to book"} your other ${option.sessions - 1} session${option.sessions - 1 === 1 ? "" : "s"} whenever it suits you`
                : ""}
              .
            </p>
          </>
        ),
        action: (
          <Button asChild className="w-full bg-sage-600 hover:bg-sage-700">
            <Link href={goTo.href}>{goTo.label}</Link>
          </Button>
        ),
      });
    } catch (err) {
      setDialog({ status: "error", message: friendlyError(err, "Something went wrong. Please try again.") });
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="bk-first">First name</Label>
          <Input id="bk-first" required maxLength={100} autoComplete="given-name" value={f.firstName} onChange={set("firstName")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bk-last">Last name</Label>
          <Input id="bk-last" required maxLength={100} autoComplete="family-name" value={f.lastName} onChange={set("lastName")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bk-email">Email</Label>
          <Input
            id="bk-email"
            required
            type="email"
            maxLength={200}
            autoComplete="email"
            value={f.email}
            onChange={set("email")}
            readOnly={Boolean(me)}
            className={cn(me && "bg-stone-50 text-stone-600")}
          />
          {me ? (
            <p className="text-xs text-stone-500">
              You&apos;re signed in, so this booking goes to your account.{" "}
              <Link href="/portal/profile" className="text-sage-700 underline">
                Change your details
              </Link>
            </p>
          ) : (
            <p className="text-xs text-stone-500">Your confirmation and login details are sent here.</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bk-phone">Phone</Label>
          <Input id="bk-phone" type="tel" maxLength={50} autoComplete="tel" value={f.phone} onChange={set("phone")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bk-concerns">What would you like support with? (optional)</Label>
        <Textarea id="bk-concerns" rows={3} maxLength={5000} value={f.concerns} onChange={set("concerns")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="bk-prev">Previous therapy or healing (optional)</Label>
          <Textarea id="bk-prev" rows={2} maxLength={5000} value={f.previousTherapy} onChange={set("previousTherapy")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bk-med">Medical conditions or medication (optional)</Label>
          <Textarea id="bk-med" rows={2} maxLength={5000} value={f.medicalConditions} onChange={set("medicalConditions")} />
        </div>
      </div>
      <p className="text-xs text-stone-500">Everything you share is private and only seen by Rangika.</p>

      {!option.free && (
        <div className="space-y-1.5">
          <Label>Card</Label>
          <div className="rounded-md border border-input bg-white p-3">
            <CardElement options={{ style: { base: { fontSize: "16px", color: "#292524", "::placeholder": { color: "#a8a29e" } } } }} />
          </div>
        </div>
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
          , and understand sessions are complementary to medical care.
        </span>
      </label>
      <Button type="submit" disabled={(!option.free && !stripe) || busy || !agreed} className="w-full bg-sage-600 py-3 hover:bg-sage-700">
        {option.free ? "Book my free session" : `Pay ${money(option.price, option.currency)} and book`}
      </Button>
      <p className="flex items-center justify-center gap-1 text-xs text-stone-500">
        {option.free ? (
          "Free during the current promotion (one free session per person). No card needed."
        ) : (
          <>
            <Lock className="h-3 w-3" /> Secure card payment by Stripe
          </>
        )}
      </p>
      <PaymentDialog
        state={dialog}
        onClose={() => {
          setDialog(null);
          if (slotTaken) {
            setSlotTaken(false);
            onSlotTaken();
          }
        }}
      />
    </form>
  );
}

/** The Perth date of a slot (the calendar works in Perth dates). */
function slotDate(slot: Slot) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Perth", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(slot.startsAt));
}
