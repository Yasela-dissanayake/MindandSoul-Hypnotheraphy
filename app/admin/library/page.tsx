import type { Prisma } from "@prisma/client";
import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { STORAGE_FREE_BYTES, STORAGE_WARN_BYTES } from "@/lib/storage";
import { formatBytes } from "@/lib/format";
import { KIND_LABEL, type KindId } from "@/lib/catalog";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LibraryUpload, LinkForm } from "@/components/admin/library-upload";
import { ResourceRow } from "@/components/admin/resource-row";

type SP = { q?: string; kind?: string; tag?: string; show?: string };
const KINDS = Object.keys(KIND_LABEL) as KindId[];

export default async function LibraryPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdminPage();
  const sp = await searchParams;
  const q = sp.q?.trim();
  const where: Prisma.ResourceWhereInput = {
    ...(sp.show === "personal" ? { personalForUserId: { not: null } } : sp.show === "all" ? {} : { personalForUserId: null }),
    ...(KINDS.includes(sp.kind as KindId) ? { kind: sp.kind as KindId } : {}),
    ...(sp.tag ? { tag: sp.tag } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { tag: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, tagRows, files, voice, journal, subs, certs] = await Promise.all([
    db.resource.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { personalFor: { select: { name: true, email: true } }, _count: { select: { planItems: true, courseItems: true } } },
    }),
    db.resource.findMany({ where: { tag: { not: null } }, distinct: ["tag"], select: { tag: true }, orderBy: { tag: "asc" } }),
    db.resource.aggregate({ _sum: { sizeBytes: true } }),
    db.voiceClip.aggregate({ _sum: { sizeBytes: true } }),
    db.journalEntry.aggregate({ _sum: { audioBytes: true } }),
    db.submission.aggregate({ _sum: { sizeBytes: true } }),
    db.enrollment.count({ where: { certificateKey: { not: null } } }),
  ]);
  const tags = tagRows.map((t) => t.tag!).filter(Boolean);
  // Certificates aren't sized individually; allow ~1 MB each.
  const used = (files._sum.sizeBytes ?? 0) + (voice._sum.sizeBytes ?? 0) + (journal._sum.audioBytes ?? 0) + (subs._sum.sizeBytes ?? 0) + certs * 1024 * 1024;
  const warn = used >= STORAGE_WARN_BYTES;
  const selectCls = "h-10 rounded-md border border-input bg-white px-3 text-sm";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-stone-800">Library</h1>
        <p className="text-stone-500">Every recording, worksheet, document, image and link you share. Add them to session plans, classes and courses.</p>
      </div>

      <section className={`space-y-2 rounded-2xl p-5 ring-1 ${warn ? "bg-amber-50 ring-amber-200" : "bg-white ring-stone-200"}`}>
        <div className="flex justify-between text-sm">
          <span className="font-medium text-stone-700">Storage used</span>
          <span className="text-stone-600">
            {formatBytes(used) || "0 KB"} of {formatBytes(STORAGE_FREE_BYTES)} free
          </span>
        </div>
        <Progress value={Math.min(100, (used / STORAGE_FREE_BYTES) * 100)} className={`h-2 ${warn ? "[&>div]:bg-amber-500" : "[&>div]:bg-sage-500"}`} />
        {warn && <p className="text-sm text-amber-800">You&apos;re close to the free storage limit. Extra storage costs a few dollars a month. Talk to your developer.</p>}
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
        <h2 className="font-serif text-xl text-stone-800">Upload files</h2>
        <LibraryUpload tags={tags} />
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
        <h2 className="font-serif text-xl text-stone-800">Add a YouTube video or link</h2>
        <LinkForm tags={tags} />
      </section>

      <section className="space-y-3">
        <form className="flex flex-wrap gap-2" action="/admin/library">
          <Input name="q" defaultValue={q} placeholder="Search" className="h-10 w-full sm:w-56" />
          <select suppressHydrationWarning name="kind" defaultValue={sp.kind ?? ""} className={selectCls}>
            <option value="">All types</option>
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {KIND_LABEL[k]}
              </option>
            ))}
          </select>
          <select suppressHydrationWarning name="tag" defaultValue={sp.tag ?? ""} className={selectCls}>
            <option value="">All tags</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select suppressHydrationWarning name="show" defaultValue={sp.show ?? ""} className={selectCls}>
            <option value="">Shared items</option>
            <option value="personal">Made for one client</option>
            <option value="all">Everything</option>
          </select>
          <Button type="submit" variant="outline" className="h-10">
            Filter
          </Button>
        </form>
        {items.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-stone-500 ring-1 ring-stone-200">Nothing here yet.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((r) => (
              <ResourceRow
                key={r.id}
                tags={tags}
                r={{
                  id: r.id,
                  title: r.title,
                  description: r.description,
                  kind: r.kind,
                  url: r.url,
                  sizeBytes: r.sizeBytes,
                  tag: r.tag,
                  personalForUserId: r.personalForUserId,
                  personalFor: r.personalFor ? r.personalFor.name || r.personalFor.email : null,
                  usedIn: r._count.planItems + r._count.courseItems,
                }}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
