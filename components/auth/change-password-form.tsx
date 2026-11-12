"use client";

import { useBusyTransition } from "@/components/use-busy-transition";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { changeMyPassword } from "@/app/account-actions";
import { PasswordInput } from "./password-input";

/** Change your own password. `hasPassword` = false for Google-only accounts (no current password to enter). */
export function ChangePasswordForm({ hasPassword, note }: { hasPassword: boolean; note?: string }) {
  const [f, setF] = useState({ current: "", next: "", confirm: "" });
  const [pending, start] = useBusyTransition();

  return (
    <div className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
      <div>
        <h2 className="font-serif text-xl text-stone-800">{hasPassword ? "Change password" : "Set a password"}</h2>
        {note && <p className="text-sm text-stone-500">{note}</p>}
      </div>
      {hasPassword && (
        <div className="space-y-2">
          <Label htmlFor="pw-current">Current password</Label>
          <PasswordInput id="pw-current" value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} autoComplete="current-password" className="h-11" />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="pw-new">New password</Label>
        <PasswordInput id="pw-new" value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} autoComplete="new-password" className="h-11" />
        <p className="text-xs text-stone-500">At least 8 characters, with letters and a number.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="pw-confirm">Type the new password again</Label>
        <PasswordInput id="pw-confirm" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} autoComplete="new-password" className="h-11" />
      </div>
      <Button
        className="h-11 w-full bg-sage-600 hover:bg-sage-700"
        disabled={pending || !f.next || !f.confirm || (hasPassword && !f.current)}
        onClick={() =>
          start(async () => {
            const res = await changeMyPassword(f);
            if (!res.ok) return void toast.error(res.error);
            toast.success("Password changed");
            setF({ current: "", next: "", confirm: "" });
          })
        }
      >
        {pending ? "Saving…" : hasPassword ? "Change password" : "Set password"}
      </Button>
    </div>
  );
}
