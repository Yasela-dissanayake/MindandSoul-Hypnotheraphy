import { db } from "@/lib/db";

// Contact form messages (free consultation requests and questions).
// "Open" = Rangika hasn't marked them as contacted yet; shown as a red number in the dashboard menu.

export const openEnquiryWhere = { handledAt: null };

export function countOpenEnquiries() {
  return db.enquiry.count({ where: openEnquiryWhere });
}
