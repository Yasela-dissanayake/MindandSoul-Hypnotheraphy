"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { enrollStudent } from "@/app/admin/_actions/courses";
import { useAction } from "./use-action";

const selectCls = "h-10 min-w-0 flex-1 rounded-md border border-input bg-white px-3 text-sm sm:max-w-xs";

/** Enrol someone who already has an account (e.g. a session client) in a course. */
export function EnrolExistingPerson({ people, courses }: { people: { id: string; name: string }[]; courses: { id: string; title: string }[] }) {
  const [userId, setUserId] = useState("");
  const [courseId, setCourseId] = useState("");
  const { pending, run } = useAction();
  if (!people.length || !courses.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select suppressHydrationWarning value={userId} onChange={(e) => setUserId(e.target.value)} className={selectCls} aria-label="Person">
        <option value="">Someone who already has an account…</option>
        {people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <select suppressHydrationWarning value={courseId} onChange={(e) => setCourseId(e.target.value)} className={selectCls} aria-label="Class">
        <option value="">Choose a class…</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>
      <Button
        variant="outline"
        className="h-10"
        disabled={pending || !userId || !courseId}
        onClick={() =>
          run(
            () => enrollStudent(userId, courseId),
            "Enrolled",
            (r) => {
              if (r.ok) {
                setUserId("");
                setCourseId("");
              }
            },
          )
        }
      >
        <UserPlus className="mr-1.5 h-4 w-4" /> {pending ? "Enrolling…" : "Enrol"}
      </Button>
    </div>
  );
}
