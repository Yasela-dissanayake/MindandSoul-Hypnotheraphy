import { cache } from "react";
import { db } from "@/lib/db";

// Contact form messages (free consultation requests and questions).
// "Open" = Rangika hasn't marked them as contacted yet; shown as a red number in the dashboard menu.

export const openEnquiryWhere = { handledAt: null };

// Shared per page render (menu badge + Overview banner).
export const countOpenEnquiries = cache(() => db.enquiry.count({ where: openEnquiryWhere }));

export const countPendingRequests = cache(() => db.accessRequest.count({ where: { status: "PENDING" } }));
