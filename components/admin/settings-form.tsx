"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimezoneSelect } from "@/components/portal/timezone-select";
import { updateSettings } from "@/app/admin/_actions/settings";
import { formatHour } from "@/lib/dates";
import { useAction } from "./use-action";

type S = {
  notifyMode: "IMMEDIATE" | "DAILY_DIGEST";
  activityEmails: boolean;
  defaultReminderHour: number;
  adminTimezone: string;
  welcomeNote: string;
  inviteEmailText: string;
  reminderEmailText: string;
};

const selectCls = "h-10 w-full rounded-md border border-input bg-white px-3 text-sm";

export function SettingsForm({ initial }: { initial: S }) {
  const [s, setS] = useState(initial);
  const { pending, run } = useAction();

  return (
    <section className="space-y-5 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
      <h2 className="font-serif text-xl text-stone-800">Emails & messages</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>When a client finishes a task, email me</Label>
          <select className={selectCls} value={s.notifyMode} onChange={(e) => setS({ ...s, notifyMode: e.target.value as S["notifyMode"] })}>
            <option value="IMMEDIATE">Straight away</option>
            <option value="DAILY_DIGEST">One summary per day (9 pm)</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Default reminder time for new clients</Label>
          <select className={selectCls} value={s.defaultReminderHour} onChange={(e) => setS({ ...s, defaultReminderHour: Number(e.target.value) })}>
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {formatHour(h)} (their time)
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-start gap-3 rounded-lg bg-stone-50 p-3 text-sm text-stone-700 sm:col-span-2">
          <input
            type="checkbox"
            checked={s.activityEmails}
            onChange={(e) => setS({ ...s, activityEmails: e.target.checked })}
            className="mt-0.5 h-4 w-4 accent-sage-600"
          />
          <span>
            Email me when a client writes in their journal, fills in a tracker or uploads work
            <span className="block text-xs text-stone-500">Questions from clients are always emailed to you straight away.</span>
          </span>
        </label>
        <div className="space-y-2 sm:col-span-2">
          <Label>Your time zone</Label>
          <TimezoneSelect value={s.adminTimezone} onChange={(adminTimezone) => setS({ ...s, adminTimezone })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Welcome note (shown on a client&apos;s first visit)</Label>
        <Textarea value={s.welcomeNote} onChange={(e) => setS({ ...s, welcomeNote: e.target.value })} placeholder="Leave empty to use the default message." className="min-h-[100px]" />
      </div>
      <div className="space-y-2">
        <Label>Login details email wording</Label>
        <Textarea value={s.inviteEmailText} onChange={(e) => setS({ ...s, inviteEmailText: e.target.value })} placeholder="Leave empty to use the default wording." className="min-h-[100px]" />
      </div>
      <div className="space-y-2">
        <Label>Reminder email wording</Label>
        <Textarea value={s.reminderEmailText} onChange={(e) => setS({ ...s, reminderEmailText: e.target.value })} placeholder="A gentle reminder: your practice for today is waiting for you." />
        <p className="text-xs text-stone-500">The list of unfinished tasks is added underneath automatically.</p>
      </div>
      <Button className="bg-sage-600 hover:bg-sage-700" disabled={pending} onClick={() => run(() => updateSettings(s), "Settings saved")}>
        Save settings
      </Button>
    </section>
  );
}
