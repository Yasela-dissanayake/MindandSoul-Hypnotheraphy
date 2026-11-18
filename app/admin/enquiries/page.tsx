import Link from "next/link";
import type { ReactNode } from "react";
import type { EnquiryKind } from "@prisma/client";
import { Search } from "lucide-react";
import { requireAdminPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { viewerTimezone } from "@/lib/viewer-tz";
import { cn } from "@/lib/utils";
import { EnquiryActions } from "@/components/admin/enquiry-actions";

// Messages from the website's contact forms: free consultation requests and questions.
// Open ones stay at the top until Rangika marks them as contacted.

type SP = { show?: string; kind?: string; q?: string };

const KIND_LABEL = { CONSULTATION: "Free consultation", QUESTION: "Question" } as const;

function Chip({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm ring-1",
        active ? "bg-sage-600 text-white ring-sage-600" : "bg-white text-stone-600 ring-stone-200 hover:bg-stone-50",
      )}
    >
      {children}
    </Link>
  );
}

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdminPage();
  const tz = await viewerTimezone();
  const sp = await searchParams;
  const show = sp.show === "done" ? "done" : "open";
  const kind: EnquiryKind | undefined = sp.kind === "CONSULTATION" || sp.kind === "QUESTION" ? sp.kind : undefined;
  const q = (sp.q ?? "").trim().slice(0, 100);

  const match = {
    ...(kind ? { kind } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q } },
            { message: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const [items, open, done] = await Promise.all([
    db.enquiry.findMany({
      where: { ...match, handledAt: show === "open" ? null : { not: null } },
      orderBy: show === "open" ? { createdAt: "asc" } : { handledAt: "desc" },
      take: 200,
    }),
    db.enquiry.count({ where: { ...match, handledAt: null } }),
    db.enquiry.count({ where: { ...match, handledAt: { not: null } } }),
  ]);

  const when = (d: Date) => d.toLocaleString("en-AU", { timeZone: tz, day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
  const href = (next: Partial<SP>) => {
    const m = { show, kind, q, ...next };
    const p = new URLSearchParams();
    if (m.show === "done") p.set("show", "done");
    if (m.kind) p.set("kind", m.kind);
    if (m.q) p.set("q", m.q);
    const s = p.toString();
    return `/admin/enquiries${s ? `?${s}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-stone-800">Enquiries</h1>
        <p className="text-stone-500">Free consultation requests and questions sent from the website. Mark each one as contacted once you&apos;ve replied.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Chip href={href({ show: "open" })} active={show === "open"}>
          Open ({open})
        </Chip>
        <Chip href={href({ show: "done" })} active={show === "done"}>
          Contacted ({done})
        </Chip>
        <span className="mx-1 h-5 w-px bg-stone-200" aria-hidden />
        <Chip href={href({ kind: undefined })} active={!kind}>
          All
        </Chip>
        <Chip href={href({ kind: "CONSULTATION" })} active={kind === "CONSULTATION"}>
          Free consultations
        </Chip>
        <Chip href={href({ kind: "QUESTION" })} active={kind === "QUESTION"}>
          Questions
        </Chip>
      </div>

      <form action="/admin/enquiries" className="flex items-center gap-2">
        {show === "done" && <input type="hidden" name="show" value="done" />}
        {kind && <input type="hidden" name="kind" value={kind} />}
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name, email, phone or message"
            className="h-10 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100"
          />
        </div>
        <button type="submit" className="h-10 rounded-lg bg-sage-600 px-4 text-sm font-medium text-white hover:bg-sage-700">
          Search
        </button>
        {q && (
          <Link href={href({ q: "" })} className="text-sm text-stone-500 hover:underline">
            Clear
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <p className="rounded-xl bg-white p-5 text-sm text-stone-500 ring-1 ring-stone-200">
          {q ? `Nothing matches "${q}".` : show === "open" ? "No open enquiries. You're all caught up." : "Nothing marked as contacted yet."}
        </p>
      ) : (
        <ul className="divide-y divide-stone-100 overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200">
          {items.map((e) => (
            <li key={e.id} className={cn("flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-4 py-3", !e.handledAt && "bg-sage-50")}>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-sage-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{KIND_LABEL[e.kind]}</span>
                  <span className="font-medium text-stone-800">{e.name}</span>
                  {e.topic && <span className="text-stone-600">{e.topic}</span>}
                </p>
                <p className="text-sm text-stone-500">
                  {when(e.createdAt)} · <span className="select-all">{e.email}</span>
                  {e.phone ? <> · <span className="select-all">{e.phone}</span></> : null}
                  {e.contactMethod ? ` · prefers ${e.contactMethod.toLowerCase()}` : ""}
                  {e.handledAt ? ` · contacted ${when(e.handledAt)}` : ""}
                </p>
                {e.message && <p className="whitespace-pre-line text-sm text-stone-700">{e.message}</p>}
              </div>
              <EnquiryActions id={e.id} name={e.name} handled={Boolean(e.handledAt)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
