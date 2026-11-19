"use client";

import { useState } from "react";

/**
 * "Remember me" checkbox for the password form. It also copies the choice into the Google form
 * (a hidden field with id `mirrorId`), so one tick applies to both ways of signing in.
 */
export function RememberMe({ mirrorId }: { mirrorId?: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-stone-600">
      <input
        type="checkbox"
        name="remember"
        value="1"
        checked={checked}
        onChange={(e) => {
          setChecked(e.target.checked);
          const mirror = mirrorId ? (document.getElementById(mirrorId) as HTMLInputElement | null) : null;
          if (mirror) mirror.value = e.target.checked ? "1" : "0";
        }}
        className="h-4 w-4 rounded border-stone-300 accent-sage-600"
      />
      Remember me
      <span className="text-xs text-stone-400">(stay signed in for 30 days)</span>
    </label>
  );
}
