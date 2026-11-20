"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { grantLearningPackage, revokeLearningPackage } from "@/app/admin/_actions/learning";
import { useAction } from "./use-action";
import { ConfirmButton } from "./confirm-button";

/** "Give a course" on the client page: access to a self-paced course without a website payment. */
export function GiveCourse({ userId, courses }: { userId: string; courses: { id: string; title: string }[] }) {
  const [pick, setPick] = useState("");
  const { pending, run } = useAction();
  if (!courses.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select suppressHydrationWarning value={pick} onChange={(e) => setPick(e.target.value)} className="h-10 min-w-0 flex-1 rounded-md border border-input bg-white px-3 text-sm sm:max-w-sm" aria-label="Course">
        <option value="">Give them a course…</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>
      <Button
        className="h-10 bg-sage-600 hover:bg-sage-700"
        disabled={!pick || pending}
        onClick={() => run(() => grantLearningPackage(userId, pick), "Course added. It's in their private space now.", (r) => r.ok && setPick(""))}
      >
        <Plus className="mr-1.5 h-4 w-4" /> Give course
      </Button>
    </div>
  );
}

/** Remove a course from this person (their lesson progress and certificate for it are deleted). */
export function RemoveCourse({ enrollmentId, title }: { enrollmentId: string; title: string }) {
  const { run } = useAction();
  return (
    <ConfirmButton
      icon
      label="Remove course"
      title={`Remove "${title}" from this person?`}
      description="They'll no longer see it. Their lesson progress and certificate for it are deleted. Payments are not refunded here."
      confirmLabel="Remove"
      onConfirm={() => run(() => revokeLearningPackage(enrollmentId), "Course removed")}
    />
  );
}
