"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { navigateTo } from "@/components/navigation-progress";
import { RefreshCw, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClientAccount, type CreatedAccount } from "@/app/admin/_actions/clients";
import { useAction } from "./use-action";
import { CredentialsCard } from "./credentials-card";
import { AccessPicker, accessPayload, emptyAccess, type CourseOption, type PackageOption } from "./access-picker";


const usernameFrom = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 30);

const WORDS = ["Amber", "Aspen", "Bloom", "Breeze", "Brook", "Cedar", "Clover", "Coral", "Dawn", "Fern", "Garden", "Grove", "Haven", "Hazel", "Iris", "Ivy", "Jade", "Lake", "Lily", "Lotus", "Maple", "Meadow", "Mint", "Moss", "Ocean", "Olive", "Pebble", "Pine", "River", "Rose", "Sage", "Shore", "Sky", "Stone", "Tide", "Valley", "Willow", "Wren"];
function suggestPassword() {
  const r = (n: number) => crypto.getRandomValues(new Uint32Array(1))[0] % n;
  const a = WORDS[r(WORDS.length)];
  let b = WORDS[r(WORDS.length)];
  while (b === a) b = WORDS[r(WORDS.length)];
  return `${a}-${b}-${1000 + r(9000)}`;
}

/** Create an account for a client or student, then show the login details to share. */
export function AddPersonDialog({
  packages,
  courses,
  siteUrl,
  defaultOpen = false,
}: {
  packages: PackageOption[];
  courses: CourseOption[];
  siteUrl: string;
  defaultOpen?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const { pending, run } = useAction();
  const [form, setForm] = useState({ name: "", email: "" });
  const [access, setAccess] = useState(() => emptyAccess(packages));
  const [username, setUsername] = useState("");
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [password, setPassword] = useState(suggestPassword);
  const [created, setCreated] = useState<CreatedAccount | null>(null);
  const shownUsername = useMemo(() => (usernameEdited ? username : usernameFrom(form.name)), [usernameEdited, username, form.name]);

  const reset = () => {
    setForm({ name: "", email: "" });
    setAccess(emptyAccess(packages));
    setUsername("");
    setUsernameEdited(false);
    setPassword(suggestPassword());
    setCreated(null);
  };

  const submit = () =>
    run(
      () => createClientAccount({ ...form, username: shownUsername, password, access: accessPayload(access, packages) }),
      "Account created",
      (res) => {
        if (res.ok && res.data) setCreated(res.data as CreatedAccount);
      },
    );

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          if (created) router.refresh();
          reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-sage-600 hover:bg-sage-700">
          <UserPlus className="mr-2 h-4 w-4" /> Add person
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-normal">Account ready for {created.name}</DialogTitle>
              <DialogDescription>Share these login details with them. You can see them again on their page until they change their password.</DialogDescription>
            </DialogHeader>
            <CredentialsCard userId={created.id} name={created.name} username={created.username} password={created.password} siteUrl={siteUrl} showPassword />
            <div className="flex flex-wrap gap-2">
              <Button className="bg-sage-600 hover:bg-sage-700" onClick={() => navigateTo(router, `/admin/clients/${created.id}`)}>
                Open their page
              </Button>
              <Button variant="outline" onClick={reset}>
                Add another person
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-normal">Add a client or student</DialogTitle>
              <DialogDescription>They&apos;ll sign in with the username and password below.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="p-name">Name</Label>
                <Input id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-email">Email</Label>
                <Input id="p-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <p className="text-xs text-stone-500">Used for reminders. They can also sign in with it.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="p-user">Username</Label>
                  <Input
                    id="p-user"
                    value={shownUsername}
                    autoCapitalize="none"
                    spellCheck={false}
                    onChange={(e) => (setUsernameEdited(true), setUsername(e.target.value.toLowerCase()))}
                    placeholder="e.g. sarah.m"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-pass">Password</Label>
                  <div className="flex gap-1">
                    <Input id="p-pass" value={password} onChange={(e) => setPassword(e.target.value)} className="font-mono" spellCheck={false} />
                    <Button type="button" variant="outline" size="icon" onClick={() => setPassword(suggestPassword())} aria-label="New password suggestion">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <p className="-mt-2 text-xs text-stone-500">Passwords need 8+ characters with letters and a number.</p>
              <div className="space-y-2">
                <Label>What do they get?</Label>
                <AccessPicker value={access} onChange={setAccess} packages={packages} courses={courses} />
              </div>
              <Button
                onClick={submit}
                disabled={pending || !form.email || !form.name || !shownUsername || !password || (!access.sessionsOn && access.courseIds.length === 0)}
                className="h-11 w-full bg-sage-600 hover:bg-sage-700"
              >
                {pending ? "Creating…" : "Create account"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
