import { notFound, redirect } from "next/navigation";
import { viewerCurrency } from "@/lib/currency";
import { getActivePromotion } from "@/lib/promotions";
import { loadService, serviceMetadata, TAB_CATEGORIES } from "@/lib/service-page";
import { serviceHref } from "@/lib/site-routes";
import { ServiceDetail } from "@/components/site/service-detail";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return serviceMetadata((await params).slug);
}

/** One Clinical Hypnotherapy area, e.g. /hypnotherapy/smoking-cessation. */
export default async function HypnotherapyAreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const [s, currency, promo] = await Promise.all([params.then((p) => loadService(p.slug)), viewerCurrency(), getActivePromotion()]);
  if (!s) notFound();
  if (!TAB_CATEGORIES.hypnotherapy.includes(s.category)) redirect(serviceHref(s));
  return <ServiceDetail s={s} currency={currency} promo={promo} />;
}
