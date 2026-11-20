"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { navigateTo } from "@/components/navigation-progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteClient, setClientFinished, updateClient } from "@/app/admin/_actions/clients";
import { formatHour } from "@/lib/dates";
import { useAction } from "./use-action";

type Client = {
  id: string;
  name: string;
  email: string;
  timezone: string;
  reminderHour: number;
  remindersOn: boolean;
  status: "INVITED" | "ACTIVE" | "FINISHED";
  consentAt: string | null;
};

const selectCls = "h-10 w-full rounded-md border border-input bg-white px-3 text-sm";

export function ClientDetailsForm({ client }: { client: Client }) {
  const router = useRouter();
  const { pending, run } = useAction();
  const [f, setF] = useState({
    name: client.name,
    email: client.email,
    timezone: client.timezone,
    reminderHour: client.reminderHour,
    remindersOn: client.remindersOn,
  });
  const [confirm, setConfirm] = useState("");

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Time zone</Label>
            <p className="rounded-md bg-stone-50 px-3 py-2 text-sm text-stone-700 ring-1 ring-stone-200">
              {f.timezone.replace(/_/g, " ")} <span className="text-stone-500">· set automatically from their device when they sign in</span>
            </p>
          </div>
          <div className="space-y-2">
            <Label>Reminder time</Label>
            <select suppressHydrationWarning className={selectCls} value={f.reminderHour} onChange={(e) => setF({ ...f, reminderHour: Number(e.target.value) })}>
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 px-3">
            <span className="text-sm">Reminder emails</span>
            <Switch checked={f.remindersOn} onCheckedChange={(remindersOn) => setF({ ...f, remindersOn })} />
          </label>
        </div>
        <Button className="bg-sage-600 hover:bg-sage-700" disabled={pending} onClick={() => run(() => updateClient(client.id, f), "Saved")}>
          Save details
        </Button>
        <p className="text-xs text-stone-500">
          {client.consentAt ? `Agreed to the privacy policy on ${new Date(client.consentAt).toLocaleDateString("en-AU")}.` : "Hasn't signed in and agreed to the privacy policy yet."}
        </p>
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
        <h2 className="font-serif text-xl text-stone-800">Account</h2>
        <div className="flex flex-wrap gap-2">
          {client.status === "FINISHED" ? (
            <Button variant="outline" disabled={pending} onClick={() => run(() => setClientFinished(client.id, false), "Reactivated")}>
              Reactivate
            </Button>
          ) : (
            <Button variant="outline" disabled={pending} onClick={() => run(() => setClientFinished(client.id, true), "Marked as finished")}>
              Mark as finished
            </Button>
          )}
          <Button variant="outline" asChild>
            <a href={`/api/admin/clients/${client.id}/export`}>Download their data</a>
          </Button>
        </div>
        <p className="text-xs text-stone-500">
          &ldquo;Finished&rdquo; people can&apos;t sign in, but their history is kept. &ldquo;Download their data&rdquo; gives a file for privacy requests.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-red-200 bg-red-50/40 p-5">
        <h2 className="font-serif text-xl text-red-800">Remove completely</h2>
        <p className="text-sm text-stone-600">
          Deletes their account and everything about them: plans, progress, journal, voice messages, recordings and uploads, class and course
          access, session bookings, purchase records and enquiries. Payments stay in your Stripe account. This can&apos;t be undone.
        </p>
        <AlertDialog onOpenChange={() => setConfirm("")}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
              Remove {client.name || "this person"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove {client.name || client.email} completely?</AlertDialogTitle>
              <AlertDialogDescription>
                Type <strong>{client.email}</strong> to confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={client.email} />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                className="bg-red-600 hover:bg-red-700"
                disabled={pending || confirm.trim().toLowerCase() !== client.email}
                onClick={() => run(() => deleteClient(client.id, confirm), "Removed", (r) => r.ok && navigateTo(router, "/admin/clients"))}
              >
                Remove permanently
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}
