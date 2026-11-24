import { cache, Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/authz";
import { Toaster } from "@/components/ui/sonner";
import { PortalNav } from "@/components/portal/portal-nav";
import { SignOutButton } from "@/components/portal/sign-out-button";
import { TimezoneSync } from "@/components/timezone-sync";
import { getAreas } from "@/lib/plans";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "My space · Mind & Soul Works", robots: { index: false } };

/** The menu (which areas they have + the "new answer" dot). Streams in, so the page never waits for it. */
const navData = cache((userId: string) =>
  Promise.all([
    getAreas(userId),
    db.question.count({ where: { userId, answeredAt: { not: null }, answerSeenAt: null } }),
    db.journalEntry.count({ where: { userId, repliedAt: { not: null }, replySeenAt: null } }),
  ]),
);

async function Nav({ userId, variant }: { userId: string; variant: "top" | "bottom" }) {
  const [areas, newAnswers, newReplies] = await navData(userId); // shared by the top and bottom menus
  return <PortalNav {...areas} newAnswers={newAnswers} newReplies={newReplies} variant={variant} />;
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");
  const showNav = session.user.hasConsented;

  return (
    <div className="min-h-screen bg-stone-50 pb-24 md:pb-10">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/portal" className="flex items-center gap-2">
            <Image src="/brand/logo-mark.png" alt="" width={36} height={36} className="rounded-full" />
            <span className="font-brand text-lg font-medium text-sage-700">Mind & Soul Works</span>
          </Link>
          <div className="flex items-center gap-1">
            {showNav && (
              <Suspense fallback={null}>
                <Nav userId={session.user.id} variant="top" />
              </Suspense>
            )}
            <span className="mx-1 hidden h-5 w-px bg-stone-200 md:block" aria-hidden />
            <SignOutButton />
          </div>
        </div>
      </header>
      <TimezoneSync saved={session.user.timezone} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      {showNav && (
        <Suspense fallback={null}>
          <Nav userId={session.user.id} variant="bottom" />
        </Suspense>
      )}
      <Toaster position="top-center" />
    </div>
  );
}
