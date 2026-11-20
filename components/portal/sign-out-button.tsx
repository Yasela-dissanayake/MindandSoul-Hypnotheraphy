import { LogOut } from "lucide-react";
import { signOut } from "@/auth";
import { SubmitButton } from "@/components/submit-button";

/** "Sign out" in the portal's top bar (every page, desktop and phone). Takes them back to the website. */
export function SignOutButton() {
  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" }); // back to the website
  }
  return (
    <form action={logout}>
      <SubmitButton
        size="sm"
        pendingText="Signing out…"
        className="gap-1.5 rounded-full bg-sage-600 px-4 text-white shadow-sm hover:bg-sage-700"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Sign out
      </SubmitButton>
    </form>
  );
}
