"use client";

import { useBusyTransition } from "@/components/use-busy-transition";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { navigateTo } from "@/components/navigation-progress";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TimezoneSelect } from "@/components/portal/timezone-select";
import { giveConsent } from "../actions";

export function WelcomeForm({ currentTimezone }: { currentTimezone: string }) {
  const router = useRouter();
  const [pending, start] = useBusyTransition();
  const [agreed, setAgreed] = useState(false);
  const [timezone, setTimezone] = useState(currentTimezone);

  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) setTimezone(detected);
    } catch {}
  }, []);

  const submit = () =>
    start(async () => {
      const res = await giveConsent({ timezone, agreed });
      if (!res.ok) return void toast.error(res.error);
      navigateTo(router, "/portal");
      router.refresh();
    });

  return (
    <div className="space-y-6 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
      <div className="space-y-2">
        <Label>Your time zone</Label>
        <TimezoneSelect value={timezone} onChange={setTimezone} />
        <p className="text-xs text-stone-500">Your daily tasks and reminders follow your local day.</p>
      </div>
      <label className="flex items-start gap-3 text-sm leading-relaxed text-stone-700">
        <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} className="mt-0.5" />
        <span>
          I agree to the{" "}
          <Link href="/privacy" target="_blank" className="text-sage-700 underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" target="_blank" className="text-sage-700 underline">
            Terms
          </Link>
          . I understand that Rangika will read my journal entries and listen to my voice messages to support my
          sessions, and that they're kept private.
        </span>
      </label>
      <Button onClick={submit} disabled={!agreed || pending} className="h-12 w-full bg-sage-600 text-base hover:bg-sage-700">
        {pending ? "One moment…" : "Continue"}
      </Button>
    </div>
  );
}
