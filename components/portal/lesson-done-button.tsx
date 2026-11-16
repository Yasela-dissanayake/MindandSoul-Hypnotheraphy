"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useBusyTransition } from "@/components/use-busy-transition";
import { completeLesson } from "@/app/portal/learning-actions";

export function LessonDoneButton({ packageId, lessonId, done, isLast }: { packageId: string; lessonId: string; done: boolean; isLast: boolean }) {
  const router = useRouter();
  const [pending, start] = useBusyTransition();

  if (done) {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-sage-700">
        <CheckCircle2 className="h-5 w-5" /> Lesson done
      </p>
    );
  }
  return (
    <Button
      disabled={pending}
      className="bg-sage-600 hover:bg-sage-700"
      onClick={() =>
        start(async () => {
          const r = await completeLesson(packageId, lessonId);
          if (!r.ok) return void toast.error(r.error);
          if (r.data?.finished) {
            toast.success("You've finished the course. Well done!");
            router.push(`/portal/learning/${packageId}`);
          } else if (r.data?.nextLessonId) {
            router.push(`/portal/learning/${packageId}?lesson=${r.data.nextLessonId}`);
          }
          router.refresh();
        })
      }
    >
      <CheckCircle2 className="mr-2 h-4 w-4" />
      {pending ? "Saving…" : isLast ? "Mark as done and finish" : "Mark as done and continue"}
    </Button>
  );
}
