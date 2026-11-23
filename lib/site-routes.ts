import type { Service, TrainingTrack } from "@prisma/client";

// Where each kind of service lives on the website (the four menu tabs), in one place,
// so pages, emails and promotions all link to the same addresses.
//
//   Clinical Hypnotherapy   /hypnotherapy            each area: /hypnotherapy/<slug>
//   Reiki Energy Healing    /reiki-healing           Reiki and the animal services: /reiki-healing/<slug>
//   Reiki Training ▾        /reiki-training          Usui Reiki levels;  /reiki-training/animal for Animal Reiki
//                                                    each class: /reiki-training/<slug>
//   Courses                 /courses
//
// The old addresses (/sessions, /classes) redirect here.

export const CATEGORY: Record<Service, { label: string; href: string }> = {
  HYPNOTHERAPY: { label: "Clinical Hypnotherapy", href: "/hypnotherapy" },
  REIKI_HEALING: { label: "Reiki Energy Healing", href: "/reiki-healing" },
  ANIMAL_REIKI: { label: "Animal Reiki & Communication", href: "/reiki-healing" },
};

export const TRACK: Record<TrainingTrack, { label: string; href: string }> = {
  REIKI: { label: "Usui Reiki Training", href: "/reiki-training" },
  ANIMAL: { label: "Animal Reiki & Communication Training", href: "/reiki-training/animal" },
};

/** A one-to-one service's own page. */
export const serviceHref = (s: { slug: string; category: Service }) => `${CATEGORY[s.category].href}/${s.slug}`;

/** A Reiki Training class's own page. */
export const classHref = (c: { slug: string | null }) => `/reiki-training/${c.slug ?? ""}`;

/** The enquiry form on the Contact page, with the service already chosen. */
export const enquiryHref = (about?: string | null) => (about ? `/contact?about=${encodeURIComponent(about)}#enquiry` : "/contact#enquiry");

/** The booking page with a service and package already chosen. */
export function bookingHref(slug: string, opts: { sessions?: number; mode?: "IN_PERSON" | "DISTANCE" | null } = {}) {
  const q = new URLSearchParams({ service: slug });
  if (opts.sessions) q.set("sessions", String(opts.sessions));
  if (opts.mode) q.set("mode", opts.mode === "IN_PERSON" ? "in-person" : "online");
  return `/booking?${q}`;
}
