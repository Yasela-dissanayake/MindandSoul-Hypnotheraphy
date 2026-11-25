import { cache } from "react";
import { unstable_rethrow } from "next/navigation";
import { auth } from "@/lib/authz";
import { db } from "@/lib/db";

/** The signed-in person looking at the public website (null for visitors), for the menu and to fill in forms. */
export type SiteViewer = {
  role: "CLIENT" | "ADMIN";
  name: string | null;
  firstName: string;
  lastName: string;
  email: string;
  /** From their latest booking or purchase (accounts don't store a phone number). */
  phone: string | null;
  image: string | null;
};

/**
 * Who is signed in, once per page. Never throws: if anything goes wrong the website simply shows
 * the visitor version (Client login, empty forms).
 */
export const getSiteViewer = cache(async (): Promise<SiteViewer | null> => {
  try {
    const s = await auth();
    const u = s?.user;
    if (!u?.id || !u.email) return null;
    const [first = "", ...rest] = (u.name ?? "").trim().split(/\s+/);
    let phone: string | null = null;
    if (u.role === "CLIENT") {
      const [b, c] = await Promise.all([
        db.booking.findFirst({ where: { clientEmail: u.email, clientPhone: { not: null } }, orderBy: { createdAt: "desc" }, select: { clientPhone: true } }),
        db.coursePurchase.findFirst({ where: { email: u.email, phone: { not: null } }, orderBy: { createdAt: "desc" }, select: { phone: true } }),
      ]);
      phone = b?.clientPhone || c?.phone || null;
    }
    return { role: u.role, name: u.name ?? null, firstName: first, lastName: rest.join(" "), email: u.email, phone, image: u.image ?? null };
  } catch (e) {
    unstable_rethrow(e); // Next.js's own signals (e.g. "this page reads cookies, so render it per visitor") must pass through
    console.error("Could not read the signed-in visitor:", e);
    return null;
  }
});
