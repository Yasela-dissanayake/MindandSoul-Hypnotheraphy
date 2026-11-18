import type { Prisma } from "@prisma/client";
import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { isDue } from "@/lib/plans";
import { serviceLabel } from "@/lib/catalog";
import { loadAccessOptions } from "@/lib/admin-data";
import { getSettings } from "@/lib/settings";
import { addDays, dayNumber, formatDate, todayIn } from "@/lib/dates";
import { AddPersonDialog } from "@/components/admin/add-person-dialog";
import { SITE_URL } from "@/lib/mail";
import { UsersList, type UserRow } from "@/components/admin/users-list";
import { viewerTimezone } from "@/lib/viewer-tz";

type SP = { q?: string; area?: string; status?: string; add?: string };

export default async function AllUsersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const tz = await viewerTimezone();
  await requireAdminPage();
  const sp = await searchParams;
  const area = sp.area === "sessions" || sp.area === "courses" ? sp.area : "";
  const status = sp.status === "finished" ? "finished" : sp.status === "all" ? "all" : "active";

  // Search is done in the browser (instant), so load everyone for the chosen area/status.
  const where: Prisma.UserWhereInput = {
    role: "CLIENT",
    ...(area === "sessions" ? { plans: { some: {} } } : area === "courses" ? { enrollments: { some: {} } } : {}),
    ...(status === "active" ? { status: { in: ["ACTIVE", "INVITED"] } } : status === "finished" ? { status: "FINISHED" } : {}),
  };
  // Every client's "today" is within a day of the server's, whatever their time zone.
  const serverToday = todayIn("UTC");
  const nearToday = [addDays(serverToday, -1), serverToday, addDays(serverToday, 1)];

  const [clients, { packages, courses }, settings] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: [{ status: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        status: true,
        timezone: true,
        lastActiveAt: true,
        plans: {
          where: { completedAt: null },
          orderBy: { startDate: "asc" },
          select: {
            startDate: true,
            service: true,
            tasks: { select: { id: true, recurrence: true, startDay: true, endDay: true, paused: true } },
          },
        },
        enrollments: { select: { course: { select: { title: true } } }, where: { completedAt: null } },
        // Only what "Today" needs: ticks near today, plus one-off tasks ever done.
        completions: {
          where: { OR: [{ forDate: { in: nearToday } }, { task: { recurrence: "ONCE" } }] },
          select: { taskId: true, forDate: true },
        },
        _count: { select: { journal: { where: { readAt: null } }, submissions: { where: { seenAt: null } } } },
      },
    }),
    loadAccessOptions(),
    getSettings(),
  ]);

  const rows: UserRow[] = clients.map((c) => {
    let today: string | null = null;
    if (c.status === "ACTIVE") {
      const date = todayIn(c.timezone);
      const doneToday = new Set(c.completions.filter((x) => x.forDate === date).map((x) => x.taskId));
      const doneEver = new Set(c.completions.map((x) => x.taskId));
      let due = 0;
      let done = 0;
      for (const p of c.plans) {
        if (!p.startDate) continue;
        const day = dayNumber(p.startDate, date);
        if (day < 1) continue;
        for (const t of p.tasks) {
          if (isDue(t, day, { doneToday: doneToday.has(t.id), doneEver: doneEver.has(t.id) })) {
            due++;
            if (doneToday.has(t.id)) done++;
          }
        }
      }
      if (due) today = `${done}/${due}`;
    }
    const services = [...new Set(c.plans.map((p) => serviceLabel(p.service)))];
    const started = c.plans.find((p) => p.startDate)?.startDate;
    return {
      id: c.id,
      name: c.name || c.email,
      email: c.email,
      username: c.username,
      status: c.status,
      what: [...services, ...c.enrollments.map((e) => e.course.title)].join(" · ") || "—",
      started: started ? formatDate(started) : "—",
      lastActive: c.lastActiveAt ? c.lastActiveAt.toLocaleDateString("en-AU", { timeZone: tz, day: "numeric", month: "short" }) : "—",
      today,
      newUploads: c._count.submissions,
      newJournal: c._count.journal,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-stone-800">All users</h1>
          <p className="text-stone-500">Everyone with an account: session clients and class students.</p>
        </div>
        <AddPersonDialog packages={packages} courses={courses} siteUrl={SITE_URL} defaultOpen={sp.add === "1"} />
      </div>
      <UsersList rows={rows} q={sp.q ?? ""} area={area} status={status} />
    </div>
  );
}
