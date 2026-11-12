import { db } from "@/lib/db";

/** Ready-made session packages and active courses, for the "what do they get?" pickers. */
export async function loadAccessOptions() {
  const [packages, courses] = await Promise.all([
    db.plan.findMany({
      where: { userId: null },
      select: { id: true, title: true, service: true, totalSessions: true },
      orderBy: [{ service: "asc" }, { title: "asc" }],
    }),
    db.course.findMany({ where: { archived: false }, select: { id: true, title: true }, orderBy: [{ order: "asc" }, { title: "asc" }] }),
  ]);
  return { packages, courses };
}
