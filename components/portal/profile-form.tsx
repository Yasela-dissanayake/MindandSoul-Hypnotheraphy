"use client";

import { useBusyTransition } from "@/components/use-busy-transition";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateProfile } from "@/app/portal/actions";
import { formatHour } from "@/lib/dates";
import { TimezoneSelect } from "./timezone-select";

type Profile = { name: string; timezone: string; reminderHour: number; remindersOn: boolean; voiceOn: boolean };

export function ProfileForm({ initial }: { initial: Profile }) {
  const [p, setP] = useState(initial);
  const [pending, start] = useBusyTransition();
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setP((x) => ({ ...x, [k]: v }));

  return (
    <div className="space-y-5 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
      <div className="space-y-2">
        <Label htmlFor="name">Your name</Label>
        <Input id="name" value={p.name} onChange={(e) => set("name", e.target.value)} className="h-11" />
      </div>
      <div className="space-y-2">
        <Label>Time zone</Label>
        <TimezoneSelect value={p.timezone} onChange={(v) => set("timezone", v)} />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-stone-800">Reminder emails</p>
          <p className="text-sm text-stone-500">A gentle email if today&apos;s tasks aren&apos;t done yet.</p>
        </div>
        <Switch checked={p.remindersOn} onCheckedChange={(v) => set("remindersOn", v)} />
      </div>
      {p.remindersOn && (
        <div className="space-y-2">
          <Label>Remind me at</Label>
          <Select value={String(p.reminderHour)} onValueChange={(v) => set("reminderHour", Number(v))}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }, (_, h) => (
                <SelectItem key={h} value={String(h)}>
                  {formatHour(h)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-stone-800">Encouraging voice</p>
          <p className="text-sm text-stone-500">A short spoken message when you finish a task.</p>
        </div>
        <Switch checked={p.voiceOn} onCheckedChange={(v) => set("voiceOn", v)} />
      </div>
      <Button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await updateProfile(p);
            if (!res.ok) toast.error(res.error);
            else toast.success("Settings saved");
          })
        }
        className="h-11 w-full bg-sage-600 hover:bg-sage-700"
      >
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </div>
  );
}
