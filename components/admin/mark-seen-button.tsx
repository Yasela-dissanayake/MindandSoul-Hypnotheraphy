"use client";

import { Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markSalesSeen, type SaleKind } from "@/app/admin/_actions/sales";
import { useAction } from "./use-action";

/** "Mark as seen" for one new booking/purchase, or "Mark all as seen" when no id is given. */
export function MarkSeenButton({ kind, id }: { kind: SaleKind; id?: string }) {
  const { pending, run } = useAction();
  return (
    <Button
      size="sm"
      variant={id ? "ghost" : "outline"}
      disabled={pending}
      className={id ? "h-7 px-2 text-xs text-sage-700 hover:bg-sage-100" : ""}
      onClick={() => run(() => markSalesSeen(kind, id), id ? undefined : "All marked as seen")}
    >
      {id ? <Check className="mr-1 h-3.5 w-3.5" /> : <CheckCheck className="mr-1.5 h-4 w-4" />}
      {id ? "Mark as seen" : "Mark all as seen"}
    </Button>
  );
}
