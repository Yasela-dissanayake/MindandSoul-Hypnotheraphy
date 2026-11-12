"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { navigateTo } from "@/components/navigation-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { approveAccessRequest, declineAccessRequest, deleteAccessRequest } from "@/app/admin/_actions/requests";
import { useAction } from "./use-action";
import { ConfirmButton } from "./confirm-button";
import { AccessPicker, accessPayload, emptyAccess, type CourseOption, type PackageOption } from "./access-picker";

type Request = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  status: "PENDING" | "APPROVED" | "DECLINED";
  attempts: number;
  when: string;
};

export function AccessRequestRow({ request, packages, courses }: { request: Request; packages: PackageOption[]; courses: CourseOption[] }) {
  const router = useRouter();
  const { pending, run } = useAction();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(request.name ?? "");
  const [access, setAccess] = useState(emptyAccess);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-stone-200">
      {request.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={request.image} alt="" className="h-10 w-10 rounded-full" referrerPolicy="no-referrer" />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100 font-medium text-sage-700">
          {(request.name || request.email)[0]?.toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-stone-800">{request.name || request.email}</p>
        <p className="truncate text-sm text-stone-500">
          {request.email} · {request.when}
          {request.attempts > 1 ? ` · tried ${request.attempts} times` : ""}
        </p>
      </div>
      {request.status === "PENDING" ? (
        <div className="flex gap-2">
          <Button className="bg-sage-600 hover:bg-sage-700" onClick={() => setOpen(true)}>
            Approve
          </Button>
          <ConfirmButton
            label="Decline"
            confirmLabel="Decline"
            title={`Decline ${request.name || request.email}?`}
            description="They'll see that their request wasn't approved. You can remove the request later to let them ask again."
            onConfirm={() => run(() => declineAccessRequest(request.id), "Request declined")}
          />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Badge variant={request.status === "APPROVED" ? "secondary" : "outline"}>{request.status === "APPROVED" ? "Approved" : "Declined"}</Badge>
          <ConfirmButton
            icon
            label="Remove"
            title="Remove this request?"
            description={request.status === "DECLINED" ? "They'll be able to ask for access again." : "This only removes the record. Their account stays."}
            onConfirm={() => run(() => deleteAccessRequest(request.id), "Removed")}
          />
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Approve {request.name || request.email}</DialogTitle>
            <DialogDescription>Choose their sessions and/or courses. They&apos;ll get an email and can then sign in with Google.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <AccessPicker value={access} onChange={setAccess} packages={packages} courses={courses} />
            <Button
              className="h-11 w-full bg-sage-600 hover:bg-sage-700"
              disabled={pending || !name.trim() || (!access.sessionsOn && access.courseIds.length === 0)}
              onClick={() =>
                run(
                  () => approveAccessRequest(request.id, { name, access: accessPayload(access) }),
                  "Approved. They can sign in now.",
                  (r) => {
                    if (!r.ok) return;
                    setOpen(false);
                    const userId = (r.data as { userId: string } | undefined)?.userId;
                    if (userId) navigateTo(router, `/admin/clients/${userId}`);
                  },
                )
              }
            >
              {pending ? "Approving…" : "Approve access"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
