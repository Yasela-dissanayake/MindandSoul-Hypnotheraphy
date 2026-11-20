"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserRoundSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * Pop-up on the "Get started" page after a Google sign-in from an email with no account.
 * Closing it removes "?from=google" from the address, so it doesn't show again on refresh.
 */
export function NoAccountDialog() {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const close = (next: boolean) => {
    setOpen(next);
    if (!next) router.replace(pathname, { scroll: false });
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader className="items-center text-center sm:text-center">
          <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-sage-100 text-sage-700">
            <UserRoundSearch className="h-6 w-6" aria-hidden />
          </span>
          <DialogTitle className="font-serif text-xl text-stone-800">There&apos;s no account for that Google email yet</DialogTitle>
          <DialogDescription className="space-y-3 pt-1 text-sm text-stone-600">
            <span className="block">
              Your private space is set up automatically when you book a session, enrol in a class or buy a course. Use the same email, and you can
              then sign in with Google.
            </span>
            <span className="block">Already booked or bought with a different email? Sign in with that one.</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
          <Button className="w-full bg-sage-600 hover:bg-sage-700" onClick={() => close(false)}>
            See what Rangika offers
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Sign in with another email</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
