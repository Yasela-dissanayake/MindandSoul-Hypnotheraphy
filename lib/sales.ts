import { cache } from "react";
import { db } from "@/lib/db";

// New session bookings and course / online-learning purchases that Rangika hasn't looked at yet.
// They show as a red number in the dashboard menu, a banner on the Overview and "New" on each row.

export const newBookingWhere = { status: "CONFIRMED" as const, seenAt: null };
export const newPurchaseWhere = { status: "PAID" as const, seenAt: null };

// Shared per page render: the menu badge and the page itself ask once between them.
export const countNewSales = cache(async () => {
  const [sessions, courses, learning] = await Promise.all([
    db.booking.count({ where: newBookingWhere }),
    db.coursePurchase.count({ where: newPurchaseWhere }),
    db.packagePurchase.count({ where: newPurchaseWhere }),
  ]);
  return { sessions, courses, learning, total: sessions + courses + learning };
});
