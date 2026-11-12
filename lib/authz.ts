import { cache } from "react";
import { redirect } from "next/navigation";
import { auth as authUncached } from "@/auth";
import { getUserRow } from "@/lib/request-cache";

// Every portal/admin page, server action and file route calls one of these.
// Never trust IDs sent from the browser without checking ownership.

/** The sign-in check, done once per page render (layout and page share it). */
export const auth = cache(() => authUncached());

export class AuthError extends Error {}

/** Signed-in, active client or student (for pages). Admins are sent to /admin. */
export async function requireClientPage(opts: { allowWithoutConsent?: boolean } = {}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");
  if (session.user.status === "FINISHED") redirect("/login?error=NotInvited");
  if (!opts.allowWithoutConsent && !session.user.hasConsented) redirect("/portal/welcome");
  const user = await getUserRow(session.user.id); // already loaded by the sign-in check
  if (!user) redirect("/login");
  return user;
}

/** Admin only (for pages). */
export async function requireAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/portal");
  return session.user;
}

/** Signed-in, active client (for server actions and API routes). */
export async function requireClient() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLIENT" || session.user.status === "FINISHED") {
    throw new AuthError("Not signed in");
  }
  return session.user;
}

/** Admin only (for server actions and API routes). */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new AuthError("Not allowed");
  return session.user;
}

/** Any signed-in, active user. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user || session.user.status === "FINISHED") throw new AuthError("Not signed in");
  return session.user;
}
