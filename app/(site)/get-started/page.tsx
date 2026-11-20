import type { Metadata } from "next";
import { ExploreServices } from "@/components/portal/explore-services";
import { NoAccountDialog } from "@/components/site/no-account-dialog";

// For people without an account. Accounts are never made just by signing in (anyone could make one);
// they're made automatically when someone books a session, enrols in a class or buys a course.
// Google sign-ins from emails with no account are sent here (?from=google).

export const metadata: Metadata = {
  title: "Get started · Mind & Soul Works",
  description: "One-to-one sessions, Reiki classes and self-paced courses with Rangika.",
  robots: { index: false },
};

export default async function GetStartedPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const fromGoogle = from === "google";

  return (
    <div className="bg-stone-50 py-12 lg:py-16">
      <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
        {/* After a Google sign-in from an email with no account: explain it in a pop-up. */}
        {fromGoogle && <NoAccountDialog />}

        <ExploreServices
          heading="Here's how Rangika can help"
          intro="Choose a one-to-one session, a Reiki class or a self-paced course. Once you book or buy, you get your own private space with everything in it."
        />
      </div>
    </div>
  );
}
