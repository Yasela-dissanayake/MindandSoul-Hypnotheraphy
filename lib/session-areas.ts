import type { Prisma, Service } from "@prisma/client";

/**
 * The admin's one-to-one sessions are split like the website: Clinical Hypnotherapy, and Reiki Energy Healing
 * (which includes Animal Reiki & Communication). Each has its own page under /admin/sessions/<area>.
 * Safe to import in client components (types only from Prisma).
 */
export const SESSION_AREAS = {
  hypnotherapy: { label: "Clinical Hypnotherapy", categories: ["HYPNOTHERAPY"] as Service[] },
  "reiki-healing": { label: "Reiki Energy Healing", categories: ["REIKI_HEALING", "ANIMAL_REIKI"] as Service[] },
} as const;

export type SessionArea = keyof typeof SESSION_AREAS;

export const isSessionArea = (s: string): s is SessionArea => s in SESSION_AREAS;
export const areaOf = (service: Service): SessionArea => (service === "HYPNOTHERAPY" ? "hypnotherapy" : "reiki-healing");
export const areaHref = (area: SessionArea) => `/admin/sessions/${area}`;
export const serviceEditHref = (id: string, category: Service) => `/admin/sessions/${areaOf(category)}/services/${id}`;

/** Questions that belong to an area: by the plan they were asked in. Questions outside any plan go to Clinical Hypnotherapy. */
export const areaQuestionWhere = (area: SessionArea): Prisma.QuestionWhereInput =>
  area === "hypnotherapy"
    ? { OR: [{ planId: null }, { plan: { service: { in: SESSION_AREAS.hypnotherapy.categories } } }] }
    : { plan: { service: { in: SESSION_AREAS["reiki-healing"].categories } } };
