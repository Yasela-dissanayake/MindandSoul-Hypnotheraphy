"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { emailLoginDetails } from "@/app/admin/_actions/clients";
import { useAction } from "./use-action";

async function copy(text: string, what: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${what} copied`);
  } catch {
    toast.error("Couldn't copy. Select the text and copy it instead.");
  }
}

export function loginMessage(opts: { name?: string | null; username: string; password: string; siteUrl: string }) {
  const first = opts.name?.split(" ")[0];
  return `Hi${first ? ` ${first}` : ""},

Here are your login details for your private space at Heal With Rangika:

Website: ${opts.siteUrl}/login
Username: ${opts.username}
Password: ${opts.password}

You can change your password after signing in, under Profile.`;
}

function Row({ label, value, secret }: { label: string; value: string; secret?: boolean }) {
  const [show, setShow] = useState(!secret);
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-stone-200">
      <span className="w-20 shrink-0 text-xs uppercase tracking-wide text-stone-500">{label}</span>
      <span className="min-w-0 flex-1 truncate font-mono text-sm text-stone-800">{show ? value : "•".repeat(Math.min(value.length, 14))}</span>
      {secret && (
        <button suppressHydrationWarning type="button" onClick={() => setShow(!show)} className="rounded p-1.5 text-stone-500 hover:bg-stone-100" aria-label={show ? "Hide" : "Show"}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
      <button suppressHydrationWarning
        type="button"
        onClick={() => {
          void copy(value, label);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="rounded p-1.5 text-stone-500 hover:bg-stone-100"
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check className="h-4 w-4 text-sage-600" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

/** Username + password the admin can copy or email to the person. */
export function CredentialsCard({
  userId,
  name,
  username,
  password,
  siteUrl,
  showPassword = false,
}: {
  userId: string;
  name?: string | null;
  username: string;
  password: string;
  siteUrl: string;
  showPassword?: boolean;
}) {
  const { pending, run } = useAction();
  return (
    <div className="space-y-3 rounded-xl bg-sage-50 p-4">
      <Row label="Website" value={`${siteUrl}/login`} />
      <Row label="Username" value={username} />
      <Row label="Password" value={password} secret={!showPassword} />
      <div className="flex flex-wrap gap-2 pt-1">
        <Button size="sm" className="bg-sage-600 hover:bg-sage-700" onClick={() => copy(loginMessage({ name, username, password, siteUrl }), "Message")}>
          <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy message to send
        </Button>
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => emailLoginDetails(userId), "Login details emailed")}>
          <Mail className="mr-1.5 h-3.5 w-3.5" /> Email these details
        </Button>
      </div>
      <p className="text-xs text-stone-500">Share these privately, e.g. by WhatsApp or email. The person can change their password after signing in.</p>
    </div>
  );
}
