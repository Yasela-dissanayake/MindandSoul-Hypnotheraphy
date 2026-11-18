"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, GraduationCap, HelpCircle, MessageSquare, Phone, Sparkles } from "lucide-react";
import { navigateTo } from "@/components/navigation-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { approveAccessRequest, declineAccessRequest, deleteAccessRequest } from "@/app/admin/_actions/requests";
import type { ServiceId } from "@/lib/catalog";
import { useAction } from "./use-action";
import { ConfirmButton } from "./confirm-button";
import { AccessPicker, accessPayload, emptyAccess, type AccessState, type CourseOption, type PackageOption } from "./access-picker";

type Request = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  status: "PENDING" | "APPROVED" | "DECLINED";
  attempts: number;
  when: string;
  wants: "SESSIONS" | "COURSE" | "UNSURE" | null;
  wantsService: string | null;
  wantsCourseId: string | null;
  wantsLabel: string | null;
  message: string | null;
  phone: string | null;
  sentForm: boolean;
  booking: string | null;
};

const SERVICE_IDS: ServiceId[] = ["HYPNOTHERAPY", "REIKI_HEALING", "ANIMAL_REIKI"];

/** Approve opens with what they asked for already chosen. */
function accessFromRequest(r: Request, packages: PackageOption[], courses: CourseOption[]): AccessState {
  const a = emptyAccess();
  if (r.wants === "SESSIONS" && SERVICE_IDS.includes(r.wantsService as ServiceId)) {
    const service = r.wantsService as ServiceId;
    const onlyPackage = packages.filter((p) => p.service === service);
    return { ...a, sessionsOn: true, service, templateId: onlyPackage.length === 1 ? onlyPackage[0].id : "" };
  }
  if (r.wants === "COURSE" && r.wantsCourseId && courses.some((c) => c.id === r.wantsCourseId)) {
    return { ...a, courseIds: [r.wantsCourseId] };
  }
  return a;
}

export function AccessRequestRow({ request, packages, courses }: { request: Request; packages: PackageOption[]; courses: CourseOption[] }) {
  const router = useRouter();
  const { pending, run } = useAction();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(request.name ?? "");
  const [access, setAccess] = useState(() => accessFromRequest(request, packages, courses));
  const WantsIcon = request.wants === "SESSIONS" ? Sparkles : request.wants === "COURSE" ? GraduationCap : HelpCircle;
  const preset = request.wants === "SESSIONS" || request.wants === "COURSE";

  return (
    <div className="space-y-3 rounded-xl bg-white p-4 ring-1 ring-stone-200">
      <div className="flex flex-wrap items-center gap-3">
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
            <Button
              className="bg-sage-600 hover:bg-sage-700"
              onClick={() => {
                setAccess(accessFromRequest(request, packages, courses));
                setOpen(true);
              }}
            >
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
      </div>

      {/* What they asked for */}
      {request.status === "PENDING" && (
        <div className="space-y-1.5 rounded-lg bg-stone-50 p-3 text-sm sm:ml-[3.25rem]">
          {request.wantsLabel ? (
            <p className="flex items-center gap-2 text-stone-800">
              <WantsIcon className="h-4 w-4 shrink-0 text-sage-600" />
              <span>
                <span className="text-stone-500">Wants:</span> <strong className="font-medium">{request.wantsLabel}</strong>
              </span>
            </p>
          ) : (
            <p className="flex items-center gap-2 text-stone-500">
              <HelpCircle className="h-4 w-4 shrink-0" />
              {request.sentForm ? "Not said" : "Didn't say what they're here for (they haven't filled in the request form)"}
            </p>
          )}
          {request.booking && (
            <p className="flex items-center gap-2 text-sage-800">
              <CalendarCheck className="h-4 w-4 shrink-0" />
              <span>
                <span className="text-stone-500">Has a paid booking:</span> {request.booking}
              </span>
            </p>
          )}
          {request.phone && (
            <p className="flex items-center gap-2 text-stone-700">
              <Phone className="h-4 w-4 shrink-0 text-stone-400" />
              <a href={`tel:${request.phone}`} className="hover:underline">
                {request.phone}
              </a>
            </p>
          )}
          {request.message && (
            <p className="flex items-start gap-2 text-stone-700">
              <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
              <span className="whitespace-pre-line">&ldquo;{request.message}&rdquo;</span>
            </p>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Approve {request.name || request.email}</DialogTitle>
            <DialogDescription>
              {preset
                ? `They asked for ${request.wantsLabel}, so that's already chosen. Change it if needed, then approve.`
                : "Choose their sessions and/or classes. They'll get an email and can then sign in with Google."}
            </DialogDescription>
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
