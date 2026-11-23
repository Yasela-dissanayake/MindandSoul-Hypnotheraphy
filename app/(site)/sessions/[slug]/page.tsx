import { notFound, permanentRedirect } from "next/navigation";
import { db } from "@/lib/db";
import { serviceHref } from "@/lib/site-routes";

// Old address: services now live under their tab (/hypnotherapy/<slug> or /reiki-healing/<slug>).
export default async function OldSessionPage({ params }: { params: Promise<{ slug: string }> }) {
  const s = await db.sessionService.findFirst({ where: { slug: (await params).slug, published: true }, select: { slug: true, category: true } });
  if (!s) notFound();
  permanentRedirect(serviceHref(s));
}
