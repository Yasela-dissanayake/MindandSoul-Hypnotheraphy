"use client";

import { useRouter } from "next/navigation";
import { navigateTo } from "@/components/navigation-progress";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { duplicateTemplate } from "@/app/admin/_actions/plans";
import { useAction } from "./use-action";

export function DuplicateTemplateButton({ id }: { id: string }) {
  const router = useRouter();
  const { pending, run } = useAction();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        run(
          () => duplicateTemplate(id),
          "Copy created",
          (r) => {
            const newId = r.ok ? (r.data as { id: string } | undefined)?.id : undefined;
            if (newId) navigateTo(router, `/admin/plans/${newId}`);
          },
        )
      }
    >
      <Copy className="mr-1.5 h-3.5 w-3.5" /> Duplicate
    </Button>
  );
}
