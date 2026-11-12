"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { navigateTo } from "@/components/navigation-progress";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPlan } from "@/app/admin/_actions/plans";
import { SERVICES, type ServiceId } from "@/lib/catalog";
import { useAction } from "./use-action";

/** Create a ready-made session package (e.g. "Weight loss: 6 sessions"). */
export function NewTemplateDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { pending, run } = useAction();
  const [f, setF] = useState({ title: "", description: "", service: "HYPNOTHERAPY" as ServiceId, sessions: "6" });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-sage-600 hover:bg-sage-700">
          <Plus className="mr-2 h-4 w-4" /> New package
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-normal">New session package</DialogTitle>
          <DialogDescription>Build the weekly work once, then give it to any client in one step.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {SERVICES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setF({ ...f, service: s.id })}
                className={`rounded-lg border px-2 py-3 text-sm ${f.service === s.id ? "border-sage-500 bg-sage-50 text-sage-800" : "border-stone-200 text-stone-600"}`}
              >
                {s.short}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Weight loss, Quit smoking, Anxiety relief" />
          </div>
          <div className="space-y-2">
            <Label>Number of sessions</Label>
            <Input type="number" min={1} value={f.sessions} onChange={(e) => setF({ ...f, sessions: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          </div>
          <Button
            className="h-11 w-full bg-sage-600 hover:bg-sage-700"
            disabled={pending || !f.title.trim()}
            onClick={() =>
              run(
                () => createPlan({ title: f.title, description: f.description, service: f.service, totalSessions: f.sessions ? Number(f.sessions) : null }),
                "Package created",
                (r) => {
                  const id = r.ok ? (r.data as { id: string } | undefined)?.id : undefined;
                  if (id) navigateTo(router, `/admin/plans/${id}`);
                },
              )
            }
          >
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
