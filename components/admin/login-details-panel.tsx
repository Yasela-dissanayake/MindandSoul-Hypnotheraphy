"use client";

import { useState } from "react";
import { KeyRound, Lock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { resetClientPassword, unlockAccount, updateUsername, type LoginDetails } from "@/app/admin/_actions/clients";
import { useAction } from "./use-action";
import { CredentialsCard } from "./credentials-card";

const fmt = (iso: string) => new Date(iso).toLocaleString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export function LoginDetailsPanel({ userId, name, details, siteUrl }: { userId: string; name: string; details: LoginDetails; siteUrl: string }) {
  const { pending, run } = useAction();
  const [editingUser, setEditingUser] = useState(false);
  const [username, setUsername] = useState(details.username ?? "");
  const [resetOpen, setResetOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const [fresh, setFresh] = useState<string | null>(null);

  const doReset = () =>
    run(
      () => resetClientPassword(userId, custom || undefined),
      "New password set",
      (r) => {
        if (r.ok) setFresh((r.data as { password: string }).password);
      },
    );

  return (
    <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-serif text-xl text-stone-800">
          <KeyRound className="h-5 w-5 text-sage-600" /> Login details
        </h2>
        <div className="flex gap-2">
          {details.google && <Badge variant="outline">Google sign-in linked</Badge>}
          {details.lockedUntil && <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Locked</Badge>}
        </div>
      </div>

      {/* Username */}
      <div className="space-y-1">
        <Label>Username</Label>
        {editingUser ? (
          <div className="flex gap-2">
            <Input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} autoCapitalize="none" spellCheck={false} />
            <Button className="bg-sage-600 hover:bg-sage-700" disabled={pending} onClick={() => run(() => updateUsername(userId, username), "Username saved", (r) => r.ok && setEditingUser(false))}>
              Save
            </Button>
            <Button variant="ghost" onClick={() => (setEditingUser(false), setUsername(details.username ?? ""))}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-mono text-stone-800">{details.username ?? "Not set"}</span>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingUser(true)} aria-label="Change username">
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}
        <p className="text-xs text-stone-500">They can sign in with this username or with {details.email}.</p>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label>Password</Label>
        {details.passwordState === "viewable" && details.password && details.username ? (
          <CredentialsCard userId={userId} name={name} username={details.username} password={details.password} siteUrl={siteUrl} />
        ) : (
          <p className="rounded-lg bg-stone-50 p-3 text-sm text-stone-600">
            {details.passwordState === "changed-by-client" &&
              `${name} chose their own password${details.passwordChangedAt ? ` on ${fmt(details.passwordChangedAt)}` : ""}, so it's private. Use "Reset password" if they've forgotten it.`}
            {details.passwordState === "none" && "No password yet. They sign in with Google. Reset the password to give them a username and password too."}
            {details.passwordState === "unreadable" && "This password can't be shown any more (the site's security key changed). Reset it to create a new one."}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => (setResetOpen(true), setFresh(null), setCustom(""))}>
          Reset password
        </Button>
        {details.lockedUntil && (
          <Button variant="outline" disabled={pending} onClick={() => run(() => unlockAccount(userId), "Account unlocked")}>
            <Lock className="mr-1.5 h-4 w-4" /> Unlock (locked until {fmt(details.lockedUntil)})
          </Button>
        )}
      </div>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{fresh ? "New password ready" : `Reset ${name}'s password`}</DialogTitle>
            <DialogDescription>
              {fresh ? "Share the new details with them. Their old password no longer works." : "Their old password stops working and they're signed out of every device."}
            </DialogDescription>
          </DialogHeader>
          {fresh && details.username ? (
            <CredentialsCard userId={userId} name={name} username={details.username} password={fresh} siteUrl={siteUrl} showPassword />
          ) : fresh ? (
            <p className="font-mono">{fresh}</p>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>New password (optional)</Label>
                <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Leave empty to create one automatically" className="font-mono" spellCheck={false} />
                <p className="text-xs text-stone-500">8+ characters with letters and a number.</p>
              </div>
              <Button className="w-full bg-sage-600 hover:bg-sage-700" disabled={pending} onClick={doReset}>
                {pending ? "Resetting…" : "Reset password"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
