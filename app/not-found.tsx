import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { NotFoundContent } from "@/components/not-found-content";

// Any address that doesn't exist, and notFound() on website pages.
export const metadata: Metadata = { title: "Page not found · Mind & Soul Works" };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh] bg-white">
        <NotFoundContent area="site" />
      </main>
    </>
  );
}
