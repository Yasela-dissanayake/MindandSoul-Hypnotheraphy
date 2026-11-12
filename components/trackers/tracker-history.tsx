import { formatTimeOfDay, type TrackerField } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";

type Entry = { date: string; values: Record<string, unknown> };

function show(v: unknown, f: TrackerField) {
  if (v === null || v === undefined || v === "") return "—";
  if (f.type === "yesno") return v ? "Yes" : "No";
  if (f.type === "time") return formatTimeOfDay(String(v));
  if (f.type === "number" && f.unit) return `${v} ${f.unit}`;
  return String(v);
}

/** A small line chart for a number or 0-10 field (oldest on the left). */
function Sparkline({ points, max }: { points: { date: string; v: number }[]; max?: number }) {
  if (points.length < 2) return null;
  const w = 320;
  const h = 80;
  const pad = 6;
  const vals = points.map((p) => p.v);
  const lo = max !== undefined ? 0 : Math.min(...vals);
  const hi = max !== undefined ? max : Math.max(...vals);
  const span = hi - lo || 1;
  const x = (i: number) => pad + (i * (w - pad * 2)) / (points.length - 1);
  const y = (v: number) => h - pad - ((v - lo) / span) * (h - pad * 2);
  const d = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-20 w-full max-w-sm" role="img" aria-label="Trend">
      <path d={d} fill="none" stroke="#5c735c" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={p.date} cx={x(i)} cy={y(p.v)} r="2.5" fill="#485a48">
          <title>
            {formatDate(p.date)}: {p.v}
          </title>
        </circle>
      ))}
    </svg>
  );
}

/** Charts for number/scale fields and a table of recent answers. Used by clients and the admin. */
export function TrackerHistory({ fields, entries }: { fields: TrackerField[]; entries: Entry[] }) {
  const chronological = [...entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
  const charts = fields.filter((f) => f.type === "number" || f.type === "scale");
  const recent = [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);

  return (
    <div className="space-y-4">
      {charts.map((f) => {
        const pts = chronological.filter((e) => typeof e.values[f.id] === "number").map((e) => ({ date: e.date, v: e.values[f.id] as number }));
        if (pts.length < 2) return null;
        const first = pts[0].v;
        const last = pts[pts.length - 1].v;
        const diff = Math.round((last - first) * 10) / 10;
        return (
          <div key={f.id} className="rounded-2xl bg-white p-4 ring-1 ring-stone-200">
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-medium text-stone-800">{f.label}</p>
              <p className="text-sm text-stone-500">
                {first}
                {f.unit ? ` ${f.unit}` : ""} → <strong className="text-stone-800">{last}{f.unit ? ` ${f.unit}` : ""}</strong>
                {diff !== 0 && <span className="ml-1">({diff > 0 ? "+" : ""}{diff})</span>}
              </p>
            </div>
            <Sparkline points={pts} max={f.type === "scale" ? 10 : undefined} />
          </div>
        );
      })}
      <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-stone-200">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-3 py-2 font-medium">Date</th>
              {fields.map((f) => (
                <th key={f.id} className="px-3 py-2 font-medium">
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map((e) => (
              <tr key={e.date} className="border-b border-stone-100 last:border-0 align-top">
                <td className="whitespace-nowrap px-3 py-2 text-stone-600">{formatDate(e.date, { weekday: "short", day: "numeric", month: "short" })}</td>
                {fields.map((f) => (
                  <td key={f.id} className="px-3 py-2 text-stone-800">
                    {show(e.values[f.id], f)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
