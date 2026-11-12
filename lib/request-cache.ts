import { cache } from "react";
import { db } from "@/lib/db";

// Per-request memo: while one page renders, the layout, the page and the sign-in check
// all share these results instead of each asking the database again.
// (Outside page rendering, e.g. in server actions, `cache` simply doesn't memoise.)

export const getUserRow = cache((id: string) => db.user.findUnique({ where: { id } }));
