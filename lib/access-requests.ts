import { serviceLabel } from "@/lib/catalog";

/** "Reiki Healing sessions", "Reiki Level 1 course", "Not sure yet" — for Rangika's list and email. */
export function describeWants(r: { wants: string | null; wantsService: string | null; wantsCourseId: string | null }, courseTitle?: string | null) {
  if (r.wants === "SESSIONS") return `${serviceLabel(r.wantsService)} sessions`;
  if (r.wants === "COURSE") return courseTitle ? `${courseTitle} course` : "A course";
  if (r.wants === "UNSURE") return "Not sure yet";
  return null; // sent before the form existed
}
