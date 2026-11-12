"use client";

import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/** A delete button that asks "Are you sure?" first. */
export function ConfirmButton({
  title,
  description,
  onConfirm,
  label = "Delete",
  icon,
  confirmLabel = "Delete",
}: {
  title: string;
  description?: string;
  onConfirm: () => void;
  label?: string;
  icon?: boolean;
  confirmLabel?: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {icon ? (
          <Button size="icon" variant="ghost" className="h-8 w-8 text-stone-500 hover:text-red-600" aria-label={label}>
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
            {label}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
