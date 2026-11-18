"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, GraduationCap, HelpCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBusyTransition } from "@/components/use-busy-transition";
import { cn } from "@/lib/utils";
import { sendAccessRequest } from "./actions";

type Wants = "SESSIONS" | "COURSE" | "UNSURE";

const CHOICES: { id: Wants | "ONLINE"; icon: typeof Sparkles; title: string; text: string }[] = [
  { id: "SESSIONS", icon: Sparkles, title: "Sessions with Rangika", text: "Hypnotherapy, Reiki or Animal Reiki, one to one" },
  { id: "COURSE", icon: GraduationCap, title: "A class", text: "A Reiki or Animal Reiki class with Rangika" },
  { id: "ONLINE", icon: BookOpen, title: "A self-paced course", text: "Self-paced courses you can buy and start straight away" },
  { id: "UNSURE", icon: HelpCircle, title: "I'm not sure yet", text: "Send the request and Rangika will help" },
];

const selectCls = "h-11 w-full rounded-md border border-input bg-white px-3 text-sm";

export function RequestAccessForm({
  token,
  services,
  courses,
  initial,
}: {
  token: string;
  services: { id: string; label: string }[];
  courses: { id: string; title: string }[];
  initial: { wants: Wants | null; service: string | null; courseId: string | null; message: string; phone: string };
}) {
  const [wants, setWants] = useState<Wants | "ONLINE" | null>(initial.wants);
  const [service, setService] = useState(initial.service ?? "");
  const [courseId, setCourseId] = useState(initial.courseId ?? "");
  const [message, setMessage] = useState(initial.message);
  const [phone, setPhone] = useState(initial.phone);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useBusyTransition();

  const ready = wants === "UNSURE" || (wants === "SESSIONS" && service) || (wants === "COURSE" && courseId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wants || wants === "ONLINE" || !ready) return;
    const choice: "SESSIONS" | "COURSE" | "UNSURE" = wants;
    setError(null);
    start(async () => {
      // On success the server sends them back to the sign-in page with "Request sent".
      const r = await sendAccessRequest(token, {
        wants: choice,
        service: (service || null) as "HYPNOTHERAPY" | "REIKI_HEALING" | "ANIMAL_REIKI" | null,
        courseId: courseId || null,
        message,
        phone,
      });
      if (r && !r.ok) setError(r.error);
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium text-stone-800">What are you here for?</legend>
        <div className="grid gap-2">
          {CHOICES.filter((c) => c.id !== "COURSE" || courses.length > 0).map((c) => {
            const Icon = c.icon;
            const on = wants === c.id;
            return (
              <label
                key={c.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl p-3 ring-1 transition",
                  on ? "bg-sage-50 ring-2 ring-sage-500" : "bg-white ring-stone-200 hover:bg-stone-50",
                )}
              >
                <input type="radio" name="wants" className="sr-only" checked={on} onChange={() => setWants(c.id)} />
                <span className={cn("mt-0.5 rounded-lg p-2", on ? "bg-sage-600 text-white" : "bg-stone-100 text-stone-600")}>
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span>
                  <span className="block font-medium text-stone-800">{c.title}</span>
                  <span className="block text-sm text-stone-500">{c.text}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {wants === "SESSIONS" && (
        <div className="space-y-1.5">
          <Label htmlFor="ra-service">Which sessions?</Label>
          <select id="ra-service" className={selectCls} value={service} onChange={(e) => setService(e.target.value)}>
            <option value="">Choose…</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {wants === "COURSE" && (
        <div className="space-y-1.5">
          <Label htmlFor="ra-course">Which class?</Label>
          <select id="ra-course" className={selectCls} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">Choose…</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {wants === "ONLINE" ? (
        <div className="space-y-3 rounded-xl bg-sage-50 p-4 text-sm text-stone-700 ring-1 ring-sage-200">
          <p>Self-paced courses don&apos;t need approval. Choose one and pay, and your account is set up straight away.</p>
          <Button asChild className="w-full bg-sage-600 hover:bg-sage-700">
            <Link href="/courses">See the courses</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="ra-message">Message for Rangika (optional)</Label>
            <Textarea
              id="ra-message"
              rows={3}
              maxLength={1000}
              placeholder="e.g. I booked a Reiki session for 20 Nov, or I did Level 1 with you last year"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ra-phone">Phone (optional)</Label>
            <Input id="ra-phone" type="tel" maxLength={40} autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800 ring-1 ring-red-200">{error}</p>}

          <Button type="submit" disabled={!ready || pending} className="h-12 w-full bg-sage-600 text-base hover:bg-sage-700">
            {pending ? "Sending…" : "Send request"}
          </Button>
          <p className="text-center text-xs text-stone-500">Rangika will check your request. You&apos;ll get an email as soon as she approves it.</p>
        </>
      )}
    </form>
  );
}
