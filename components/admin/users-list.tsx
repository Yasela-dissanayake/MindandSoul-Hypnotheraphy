"use client";

import { useDeferredValue, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "./status-badge";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  status: "INVITED" | "ACTIVE" | "FINISHED";
  what: string;
  started: string;
  lastActive: string;
  today: string | null;
  newUploads: number;
  newJournal: number;
};

const selectCls = "h-10 rounded-md border border-input bg-white px-3 text-sm";

/**
 * The All users table with its search and filters.
 * Typing filters instantly in the browser (name, email or username) — no waiting for the server.
 * The two dropdowns reload the list from the server.
 */
export function UsersList({ rows, q: initialQ, area, status }: { rows: UserRow[]; q: string; area: string; status: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [text, setText] = useState(initialQ);
  const query = useDeferredValue(text);
  const [pending, start] = useTransition();

  const url = (v: { q: string; area: string; status: string }) => {
    const p = new URLSearchParams();
    if (v.q.trim()) p.set("q", v.q.trim());
    if (v.area) p.set("area", v.area);
    if (v.status !== "active") p.set("status", v.status);
    const s = p.toString();
    return s ? `${pathname}?${s}` : pathname;
  };

  const type = (value: string) => {
    setText(value);
    // Keep the address up to date (so Back and refresh keep the search) without reloading anything.
    try {
      window.history.replaceState(window.history.state, "", url({ q: value, area, status }));
    } catch {}
  };
  const reload = (next: { area?: string; status?: string }) => start(() => router.replace(url({ q: text, area, status, ...next }), { scroll: false }));

  const shown = useMemo(() => {
    const words = query.trim().toLowerCase().replace(/^@/, "").split(/\s+/).filter(Boolean);
    if (!words.length) return rows;
    return rows.filter((r) => {
      const hay = `${r.name} ${r.email} ${r.username ?? ""} @${r.username ?? ""}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [rows, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            value={text}
            onChange={(e) => type(e.target.value)}
            placeholder="Search name, email or username"
            className="h-10 pl-9 pr-9"
            aria-label="Search users"
            autoComplete="off"
            spellCheck={false}
            autoFocus={Boolean(initialQ)}
          />
          {text && (
            <button
              type="button"
              onClick={() => type("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select value={area} onChange={(e) => reload({ area: e.target.value })} className={selectCls} aria-label="Show">
          <option value="">Everyone</option>
          <option value="sessions">Session clients</option>
          <option value="courses">Course students</option>
        </select>
        <select value={status} onChange={(e) => reload({ status: e.target.value })} className={selectCls} aria-label="Status">
          <option value="active">Active</option>
          <option value="finished">Finished</option>
          <option value="all">All</option>
        </select>
        {pending ? <Spinner className="text-stone-400" label="Updating…" /> : <span className="text-sm text-stone-500">{shown.length} shown</span>}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-stone-500 ring-1 ring-stone-200">
          {query.trim() ? `No one matches "${query.trim()}". Try part of their name, email or username.` : "No one here yet. Add your first client or student."}
        </p>
      ) : (
        <div className={`overflow-x-auto rounded-xl bg-white ring-1 ring-stone-200 transition-opacity ${pending ? "opacity-60" : ""}`}>
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Sessions / courses</th>
                <th className="px-4 py-3 font-medium">Started</th>
                <th className="px-4 py-3 font-medium">Last active</th>
                <th className="px-4 py-3 font-medium">Today</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((c) => (
                <tr key={c.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/clients/${c.id}`} className="block">
                      <span className="font-medium text-stone-800">{c.name}</span>
                      {c.newUploads > 0 && (
                        <Badge className="ml-2 bg-amber-500 hover:bg-amber-500">
                          {c.newUploads} upload{c.newUploads === 1 ? "" : "s"}
                        </Badge>
                      )}
                      {c.newJournal > 0 && <Badge className="ml-2 bg-sage-600 hover:bg-sage-600">{c.newJournal} new</Badge>}
                      <span className="block text-xs text-stone-500">
                        {c.username ? `@${c.username} · ` : ""}
                        {c.email}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block text-stone-700">{c.what}</span>
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-stone-600">{c.started}</td>
                  <td className="px-4 py-3 text-stone-600">{c.lastActive}</td>
                  <td className="px-4 py-3 text-stone-600">{c.today ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
