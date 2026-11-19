import type { BookingMode, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

// One-to-one session services (Clinical Hypnotherapy, Reiki ...) as Rangika set them up in admin.
// Prices come from here on the server: never from the browser.

export const serviceWithOptions = {
  options: { orderBy: [{ order: "asc" }, { sessions: "asc" }] },
} satisfies Prisma.SessionServiceInclude;

export type ServiceWithOptions = Prisma.SessionServiceGetPayload<{ include: typeof serviceWithOptions }>;

/** Services shown on the website, in Rangika's order. */
export function loadPublishedServices() {
  return db.sessionService.findMany({ where: { published: true }, orderBy: [{ order: "asc" }, { title: "asc" }], include: serviceWithOptions });
}

/** The ways a session can happen for this service/option: in person (Perth) and/or online. */
export function modesFor(service: { inPerson: boolean; online: boolean }, option?: { mode: BookingMode | null } | null): BookingMode[] {
  if (option?.mode) return [option.mode];
  return [service.inPerson && ("IN_PERSON" as const), service.online && ("DISTANCE" as const)].filter((m): m is BookingMode => Boolean(m));
}

/** The calendar's session type string for a mode ("in-person" / "distance"), as stored on bookings. */
export const sessionTypeOf = (mode: BookingMode) => (mode === "IN_PERSON" ? "in-person" : "distance");

export const MODE_TEXT: Record<BookingMode, string> = { IN_PERSON: "In person (Perth)", DISTANCE: "Online / distance" };

/** "Single session" / "5-session package" style label with the count. */
export function optionLabel(o: { title: string; sessions: number }) {
  return o.title || (o.sessions === 1 ? "Single session" : `${o.sessions}-session package`);
}

/** The lowest price among a service's options (for "From AUD 140"). */
export function cheapest<T extends { price: number; priceAed: number | null }>(options: T[]): T | null {
  return options.reduce<T | null>((min, o) => (!min || o.price < min.price ? o : min), null);
}
