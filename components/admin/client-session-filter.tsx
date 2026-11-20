"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * A "Session / Class / Course: All (5) / Reiki Level 1 (2) / …" filter above a table of people.
 * The choice is kept in the address (?<param>=…) so it survives a refresh and can be bookmarked.
 */
export function ClientSessionFilter({
  options,
  current,
  label = "Session",
  param = "session",
  anchor = "clients",
}: {
  options: { value: string; label: string; count: number }[];
  current: string;
  label?: string;
  param?: string;
  anchor?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  return (
    <label className={cn("flex items-center gap-2 text-sm text-stone-600", pending && "opacity-60")}>
      {label}
      <select suppressHydrationWarning
        value={current}
        onChange={(e) => {
          const v = e.target.value;
          start(() => router.replace(v ? `${pathname}?${param}=${encodeURIComponent(v)}#${anchor}` : `${pathname}#${anchor}`, { scroll: false }));
        }}
        className="h-10 rounded-md border border-input bg-white px-3 text-sm text-stone-800"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label} ({o.count})
          </option>
        ))}
      </select>
    </label>
  );
}
