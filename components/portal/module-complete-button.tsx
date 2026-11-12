"use client";

import { useBusyTransition } from "@/components/use-busy-transition";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setModuleComplete } from "@/app/portal/actions";

export function ModuleCompleteButton({ moduleId, done }: { moduleId: string; done: boolean }) {
  const [pending, start] = useBusyTransition();
  return (
    <Button
      variant={done ? "outline" : "default"}
      className={done ? "" : "bg-sage-600 hover:bg-sage-700"}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await setModuleComplete(moduleId, !done);
          if (!res.ok) toast.error(res.error);
          else if (!done) toast.success("Module complete. Well done! 🌿");
        })
      }
    >
      {done ? "Mark as not complete" : "Mark module as complete"}
    </Button>
  );
}
