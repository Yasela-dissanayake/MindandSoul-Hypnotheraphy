import { revalidatePath } from "next/cache";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

export const fail = (error: string): { ok: false; error: string } => ({ ok: false, error });

export function refreshAll() {
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
}

/** Turns empty strings into null for optional text fields. */
export const blank = (v: string | null | undefined) => {
  const t = v?.trim();
  return t ? t : null;
};
