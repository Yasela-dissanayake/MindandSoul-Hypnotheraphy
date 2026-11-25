import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { countWaitingQuestionsByArea } from "@/lib/questions";
import { countNewSales } from "@/lib/sales";
import { countOpenEnquiries } from "@/lib/enquiries";
import { signOut } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import { AdminNav } from "@/components/admin/admin-nav";
import { TimezoneSync } from "@/components/timezone-sync";
import { ViewerClock } from "@/components/admin/viewer-clock";
import { NotificationBell } from "@/components/portal/notification-bell";

export const metadata: Metadata = { title: "Dashboard · Mind & Soul Works", robots: { index: false } };

async function logout() {
  "use server";
  await signOut({ redirectTo: "/" }); // back to the website
}

/** The menu with its red badges. Streams in, so the page itself never waits for the counts. */
async function NavWithBadges({ name }: { name: string }) {
  const [questions, sales, enquiries] = await Promise.all([
    countWaitingQuestionsByArea(),
    countNewSales(),
    countOpenEnquiries(),
  ]);
  return <AdminNav name={name} logout={logout} badges={{ ...questions, sales: sales.total, enquiries }} />;
}

/** Rangika's bell with its unread number (streams in). Never breaks the dashboard if the count fails. */
async function Bell({ userId }: { userId: string }) {
  let unread = 0;
  try {
    unread = await db.notification.count({ where: { userId, readAt: null } });
  } catch (e) {
    console.error("Notification count failed:", e);
  }
  return <NotificationBell initialUnread={unread} scope="admin" />;
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminPage();
  const name = user.name ?? user.email ?? "Rangika";

  return (
    <div className="min-h-screen bg-stone-50 md:flex">
      <Suspense fallback={<AdminNav name={name} logout={logout} />}>
        <NavWithBadges name={name} />
      </Suspense>
      <TimezoneSync saved={user.timezone} />
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-5xl">
          <div className="-mt-2 mb-4 flex items-center justify-end gap-2 md:-mt-4">
            <ViewerClock />
            <Suspense fallback={<span className="h-9 w-9" aria-hidden />}>
              <Bell userId={user.id} />
            </Suspense>
          </div>
          {children}
        </div>
      </main>
      <Toaster position="top-center" />
    </div>
  );
}
