import { notFound, redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { serviceEditHref } from "@/lib/session-areas";

// Old address of the service editor: it now lives under its area (Clinical Hypnotherapy or Reiki Energy Healing).
export default async function OldSessionServiceEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const s = await db.sessionService.findUnique({ where: { id }, select: { id: true, category: true } });
  if (!s) notFound();
  redirect(serviceEditHref(s.id, s.category));
}
