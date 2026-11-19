import { db } from "@/lib/db";

/**
 * For the "what do they get?" pickers (Add person, approving an access request, adding a session plan):
 * the session services with their packages (as set up under Session services & prices; new ones appear
 * by themselves), and the active classes.
 */
export async function loadAccessOptions() {
  const [services, courses] = await Promise.all([
    db.sessionService.findMany({
      where: { planService: { not: null } }, // enquiry-only services (e.g. Corporate) don't make a client plan
      orderBy: [{ order: "asc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        planService: true,
        options: { orderBy: [{ order: "asc" }, { sessions: "asc" }], select: { id: true, title: true, sessions: true } },
      },
    }),
    db.course.findMany({ where: { archived: false }, select: { id: true, title: true }, orderBy: [{ order: "asc" }, { title: "asc" }] }),
  ]);
  // `packages` keeps its old name for the pages that pass it on; it now holds the session services.
  const packages = services.map((s) => ({ ...s, planService: s.planService! }));
  return { packages, courses };
}
