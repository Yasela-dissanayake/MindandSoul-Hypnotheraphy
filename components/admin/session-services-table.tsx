import Link from "next/link";
import { Globe, MapPin } from "lucide-react";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/currency";
import { MoveServiceButtons } from "@/components/admin/session-service-editor";

const GROUPS = [
  { category: "HYPNOTHERAPY", label: "Clinical Hypnotherapy" },
  { category: "REIKI_HEALING", label: "Reiki Energy Healing" },
  { category: "ANIMAL_REIKI", label: "Reiki Energy Healing · Animal Reiki & Communication" },
] as const;

/** The one-to-one services sold on the website with their prices, grouped by website tab. */
export async function SessionServicesTable() {
  const services = await db.sessionService.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }, { title: "asc" }],
    include: { options: { orderBy: [{ order: "asc" }, { sessions: "asc" }] }, _count: { select: { plans: true } } },
  });
  if (services.length === 0) return <p className="rounded-xl bg-white p-5 text-sm text-stone-500 ring-1 ring-stone-200">No sessions yet. Add your first one.</p>;

  return (
    <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-stone-200">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
          <tr>
            <th className="w-20 px-2 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Session</th>
            <th className="px-4 py-3 font-medium">Prices</th>
            <th className="px-4 py-3 font-medium">Where</th>
            <th className="px-4 py-3 font-medium">Clients</th>
          </tr>
        </thead>
        {GROUPS.map((g) => {
          const list = services.filter((s) => s.category === g.category);
          if (!list.length) return null;
          return (
        <tbody key={g.category}>
          <tr className="bg-sage-50">
            <th colSpan={5} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-sage-800">
              {g.label} <span className="font-normal text-stone-500">· {list.length}</span>
            </th>
          </tr>
          {list.map((s, i) => (
            // The whole row opens the editor (the name link stretches over it); the arrows sit above it.
            <tr key={s.id} className="relative border-b border-stone-100 align-top last:border-0 hover:bg-stone-50">
              <td className="relative z-10 px-2 py-3">
                <MoveServiceButtons id={s.id} first={i === 0} last={i === list.length - 1} />
              </td>
              <td className="px-4 py-3">
                <Link href={`/admin/sessions/services/${s.id}`} className="font-medium text-stone-800 after:absolute after:inset-0 hover:underline">
                  {s.title}
                </Link>
                <span className="mt-1 flex flex-wrap gap-1.5">
                  {!s.published && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-900">Hidden</span>}
                  {s.enquiryOnly && <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[11px] font-medium text-stone-600">Enquiry only</span>}
                  {s.options.some((o) => o.recorded) && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-900">Recorded course</span>
                  )}
                  {s.lengthLabel && <span className="text-xs text-stone-500">{s.lengthLabel}</span>}
                </span>
              </td>
              <td className="px-4 py-3 text-stone-700">
                {s.options.length === 0 ? (
                  <span className="text-stone-400">—</span>
                ) : (
                  <ul className="space-y-0.5">
                    {s.options.map((o) => (
                      <li key={o.id}>
                        <span className="text-stone-500">{o.title}:</span> {formatPrice(o.price, "aud")}
                        {o.priceAed ? ` / ${formatPrice(o.priceAed, "aed")}` : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </td>
              <td className="px-4 py-3 text-stone-600">
                <span className="flex flex-col gap-0.5">
                  {s.inPerson && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> In person
                    </span>
                  )}
                  {s.online && (
                    <span className="inline-flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" /> Online
                    </span>
                  )}
                </span>
              </td>
              <td className="px-4 py-3 text-stone-600">{s._count.plans}</td>
            </tr>
          ))}
        </tbody>
          );
        })}
      </table>
    </div>
  );
}
