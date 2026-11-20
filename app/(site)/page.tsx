import { HomePage } from "@/components/site/home-page";
import { homePromotion } from "@/lib/promotions";

// The home page. Loaded fresh on every visit so a promotion appears (and disappears) on time.
export const dynamic = "force-dynamic";

export default async function Page() {
  return <HomePage promotion={await homePromotion()} />;
}
