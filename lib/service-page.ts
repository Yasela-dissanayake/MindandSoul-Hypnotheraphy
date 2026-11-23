import { cache } from "react";
import type { Metadata } from "next";
import type { Service } from "@prisma/client";
import { db } from "@/lib/db";
import { serviceWithOptions } from "@/lib/session-catalog";

// The pages of one-to-one services, shared by /hypnotherapy/<slug> and /reiki-healing/<slug>.

/** A published service by its web address, once per request. */
export const loadService = cache((slug: string) => db.sessionService.findFirst({ where: { slug, published: true }, include: serviceWithOptions }));

/** The Reiki Energy Healing tab holds both Reiki and the animal services. */
export const TAB_CATEGORIES: Record<"hypnotherapy" | "reiki-healing", Service[]> = {
  hypnotherapy: ["HYPNOTHERAPY"],
  "reiki-healing": ["REIKI_HEALING", "ANIMAL_REIKI"],
};

export async function serviceMetadata(slug: string): Promise<Metadata> {
  const s = await loadService(slug);
  return s ? { title: `${s.title} · Mind & Soul Works`, description: s.summary ?? s.tagline ?? undefined } : { title: "Page not found" };
}
