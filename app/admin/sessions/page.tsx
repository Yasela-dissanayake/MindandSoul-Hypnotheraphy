import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { areaHref, areaQuestionWhere } from "@/lib/session-areas";

// The sessions are split into Clinical Hypnotherapy and Reiki Energy Healing. Old links (and the
// "a client asked a question" email) land here: open Reiki when only Reiki has questions waiting.
export default async function SessionsPage() {
  await requireAdminPage();
  const waiting = { answeredAt: null, user: { status: { not: "FINISHED" as const } } };
  const [hypno, reiki] = await Promise.all([
    db.question.count({ where: { AND: [areaQuestionWhere("hypnotherapy"), waiting] } }),
    db.question.count({ where: { AND: [areaQuestionWhere("reiki-healing"), waiting] } }),
  ]);
  redirect(areaHref(!hypno && reiki ? "reiki-healing" : "hypnotherapy"));
}
