"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { navigateTo } from "@/components/navigation-progress";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCourse } from "@/app/admin/_actions/courses";
import { useAction } from "./use-action";

export function NewCourseDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", description: "" });
  const { pending, run } = useAction();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" /> New class
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-normal">New class</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Class name</Label>
            <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Reiki Master Teacher" />
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
                () => createCourse(f),
                "Class created",
                (r) => {
                  const id = r.ok ? (r.data as { id: string } | undefined)?.id : undefined;
                  if (id) navigateTo(router, `/admin/classes/${id}`);
                },
              )
            }
          >
            Create class
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
