"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navigateTo } from "@/components/navigation-progress";

/** Book sessions for someone who already has an account (e.g. a course student). */
export function ExistingClientSessions({ people }: { people: { id: string; name: string }[] }) {
  const router = useRouter();
  const [id, setId] = useState("");
  if (!people.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={id}
        onChange={(e) => setId(e.target.value)}
        className="h-10 min-w-0 flex-1 rounded-md border border-input bg-white px-3 text-sm sm:max-w-xs"
        aria-label="Existing client or student"
      >
        <option value="">Someone who already has an account…</option>
        {people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <Button variant="outline" className="h-10" disabled={!id} onClick={() => navigateTo(router, `/admin/clients/${id}?tab=sessions&add=1#add-plan`)}>
        Add sessions <ArrowRight className="ml-1.5 h-4 w-4" />
      </Button>
    </div>
  );
}
