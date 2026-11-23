import { cache } from "react";
import { db } from "@/lib/db";
import { coverUrl } from "@/lib/covers";
import { classHref, serviceHref } from "@/lib/site-routes";

// Promotions (admin → Promotion). Only one runs at a time: from startsAt until endsAt (startsAt + days).
// While it runs it shows on the home page (pop-up + section), the item it points to is listed first
// with an "offer" badge, and when it's marked free that item can be booked / joined without paying.

export const DAY_MS = 86_400_000;
export const MAX_DAYS = 365;

const linkSelect = {
  sessionService: { select: { id: true, slug: true, title: true, published: true, enquiryOnly: true, category: true } },
  course: { select: { id: true, slug: true, title: true, published: true, archived: true } },
  package: { select: { id: true, slug: true, title: true, published: true, archived: true } },
} as const;

export const runningWhere = () => {
  const now = new Date();
  return { startsAt: { lte: now }, endsAt: { gt: now } };
};

/** The promotion running now (or null). Shared by everything on one page render. */
export const getActivePromotion = cache(async () => {
  try {
    return await db.promotion.findFirst({ where: runningWhere(), orderBy: { startsAt: "desc" }, include: linkSelect });
  } catch (e) {
    // The website should never fail because of a promotion (e.g. the database is busy for a moment).
    console.error("Could not load the promotion:", e);
    return null;
  }
});

export type ActivePromotion = NonNullable<Awaited<ReturnType<typeof getActivePromotion>>>;
export type PromoKind = "session" | "class" | "course";

/** What the promotion points to, if that item is on the website. */
export function promotionLink(p: ActivePromotion): { kind: PromoKind; id: string; title: string; href: string } | null {
  const s = p.sessionService;
  if (s && s.published) return { kind: "session", id: s.id, title: s.title, href: serviceHref(s) };
  const c = p.course;
  if (c && c.slug && c.published && !c.archived) return { kind: "class", id: c.id, title: c.title, href: classHref(c) };
  const k = p.package;
  if (k && k.slug && k.published && !k.archived) return { kind: "course", id: k.id, title: k.title, href: `/courses/${k.slug}` };
  return null;
}

/** "Free" only counts when it points to something on the website. */
export function isFreePromotion(p: ActivePromotion | null) {
  return Boolean(p?.free && promotionLink(p));
}

/** For the website's lists: is this item promoted right now, and is it free? */
export async function promoFor(kind: PromoKind, id: string): Promise<{ promoted: boolean; free: boolean }> {
  const p = await getActivePromotion();
  const link = p ? promotionLink(p) : null;
  const promoted = Boolean(link && link.kind === kind && link.id === id);
  return { promoted, free: promoted && Boolean(p?.free) };
}

/** Puts the promoted item first, keeping the rest in their usual order. */
export function promotedFirst<T extends { id: string }>(items: T[], promotedId: string | null | undefined) {
  if (!promotedId) return items;
  return [...items.filter((i) => i.id === promotedId), ...items.filter((i) => i.id !== promotedId)];
}

/**
 * For a free session service: which of its options is free. The single session (1 session);
 * if there's none, the first option. Packages stay paid.
 */
export function freeOptionOf<O extends { id: string; sessions: number; order?: number }>(options: O[]): O | null {
  return options.find((o) => o.sessions === 1) ?? options[0] ?? null;
}

/** Everything the home page needs (plain data, safe to pass to the browser). */
export async function homePromotion() {
  const p = await getActivePromotion();
  if (!p) return null;
  const link = promotionLink(p);
  return {
    id: p.id,
    title: p.title,
    content: p.content,
    imageUrl: coverUrl("promotion", p),
    endsAt: p.endsAt.toISOString(),
    free: Boolean(p.free && link),
    link: link ? { href: link.href, title: link.title, kind: link.kind } : null,
  };
}
export type HomePromotion = NonNullable<Awaited<ReturnType<typeof homePromotion>>>;
