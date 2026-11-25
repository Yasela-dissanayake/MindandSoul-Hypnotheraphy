"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { deleteObject } from "@/lib/storage";
import { isSiteImage } from "@/lib/covers";
import { slugify } from "@/lib/learning";
import { blank, fail, type ActionResult } from "./common";

// One-to-one services on the website (the Clinical Hypnotherapy and Reiki Energy Healing tabs, and booking):
// Rangika edits the page text, prices (AUD and AED) and packages here. Changes show on the website straight away.

function refresh() {
  revalidatePath("/hypnotherapy", "layout");
  revalidatePath("/reiki-healing", "layout");
  revalidatePath("/booking");
  revalidatePath("/admin/sessions", "layout");
}

const CATEGORY = z.enum(["HYPNOTHERAPY", "REIKI_HEALING", "ANIMAL_REIKI"]);

async function uniqueSlug(title: string, excludeId?: string) {
  const base = slugify(title);
  for (let i = 0; i < 50; i++) {
    const slug = i === 0 ? base : `${base}-${i + 1}`;
    const taken = await db.sessionService.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } });
    if (!taken) return slug;
  }
  return `${base}-${Date.now() % 100000}`;
}

const newOptionSchema = z.object({
  title: z.string().trim().min(1, "Give every price a name, e.g. \"Single session\".").max(80),
  sessions: z.number().int().min(1, "Every price needs at least 1 session.").max(50),
  price: z.number({ invalid_type_error: "Enter the AUD price for every package." }).min(0.5, "Enter the AUD price for every package.").max(100000),
  priceAed: z.number({ invalid_type_error: "Enter the AED price for every package." }).min(2, "Enter the AED price for every package (at least AED 2).").max(500000),
  mode: z.enum(["IN_PERSON", "DISTANCE"]).nullable(),
  note: z.string().max(200).optional().nullable(),
});

const newServiceSchema = z
  .object({
    title: z.string().trim().min(1, "Please enter a name.").max(150, "Please use a shorter name."),
    category: CATEGORY,
    planService: CATEGORY.optional(),
    tagline: z.string().max(200).optional().nullable(),
    summary: z.string().max(300).optional().nullable(),
    body: z.string().max(40000, "The page text is too long.").optional().nullable(),
    details: z.string().max(10000).optional().nullable(),
    highlights: z.string().max(5000).optional().nullable(),
    lengthLabel: z.string().max(60).optional().nullable(),
    minutes: z.number().int().min(15, "Sessions must be at least 15 minutes.").max(480).nullable().optional(),
    inPerson: z.boolean(),
    online: z.boolean(),
    enquiryOnly: z.boolean(),
    published: z.boolean().optional(),
    imageKey: z
      .string()
      .regex(/^covers\/[\w.\-\/]+$/, "The photo upload didn't work. Please choose it again.")
      .nullable()
      .optional(),
    options: z.array(newOptionSchema).max(20).default([]),
  })
  .refine((d) => d.enquiryOnly || d.inPerson || d.online, { message: "Choose in person, online, or both." })
  .refine((d) => d.enquiryOnly || d.options.length > 0, { message: "Add at least one price (e.g. Single session)." });

/**
 * A new session service, all in one go from the "New session" page: its details and page text, its
 * prices and packages (AUD and AED), its cover photo, and whether it's shown on the website.
 */
export async function createSessionService(input: z.input<typeof newServiceSchema>): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = newServiceSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the details.");
  const d = parsed.data;
  const count = await db.sessionService.count({ where: { category: d.category } });
  const s = await db.sessionService.create({
    data: {
      title: d.title,
      slug: await uniqueSlug(d.title),
      order: count + 1,
      published: Boolean(d.published),
      planService: d.planService ?? d.category,
      category: d.category,
      tagline: blank(d.tagline),
      summary: blank(d.summary),
      body: blank(d.body),
      details: blank(d.details),
      highlights: blank(d.highlights),
      lengthLabel: blank(d.lengthLabel),
      minutes: d.minutes ?? null,
      inPerson: d.inPerson,
      online: d.online,
      enquiryOnly: d.enquiryOnly,
      imageKey: d.imageKey ?? null,
      options: {
        create: (d.enquiryOnly ? [] : d.options).map((o, i) => ({
          title: o.title,
          sessions: o.sessions,
          price: Math.round(o.price * 100),
          priceAed: Math.round(o.priceAed * 100),
          mode: o.mode,
          note: blank(o.note),
          order: i,
        })),
      },
    },
  });
  refresh();
  return { ok: true, data: { id: s.id } };
}

const serviceSchema = z
  .object({
    title: z.string().trim().min(1, "Please enter a name.").max(150),
    category: CATEGORY,
    tagline: z.string().max(200).optional().nullable(),
    summary: z.string().max(300).optional().nullable(),
    body: z.string().max(40000, "The page text is too long.").optional().nullable(),
    details: z.string().max(10000).optional().nullable(),
    highlights: z.string().max(5000).optional().nullable(),
    planService: z.enum(["HYPNOTHERAPY", "REIKI_HEALING", "ANIMAL_REIKI"]),
    minutes: z.number().int().min(15, "Sessions must be at least 15 minutes.").max(480).nullable(),
    lengthLabel: z.string().max(60).optional().nullable(),
    inPerson: z.boolean(),
    online: z.boolean(),
    enquiryOnly: z.boolean(),
    published: z.boolean(),
  })
  .refine((d) => d.enquiryOnly || d.inPerson || d.online, { message: "Choose in person, online, or both." });

export async function updateSessionService(id: string, input: z.input<typeof serviceSchema>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the details.");
  const d = parsed.data;
  const s = await db.sessionService.findUnique({ where: { id }, select: { _count: { select: { options: true } } } });
  if (!s) return fail("Session not found.");
  if (d.published && !d.enquiryOnly && s._count.options === 0) return fail("Add at least one price before showing it on the website.");
  await db.sessionService.update({
    where: { id },
    data: {
      title: d.title,
      category: d.category,
      tagline: blank(d.tagline),
      summary: blank(d.summary),
      body: blank(d.body),
      details: blank(d.details),
      highlights: blank(d.highlights),
      planService: d.planService,
      minutes: d.minutes,
      lengthLabel: blank(d.lengthLabel),
      inPerson: d.inPerson,
      online: d.online,
      enquiryOnly: d.enquiryOnly,
      published: d.published,
    },
  });
  refresh();
  return { ok: true };
}

/**
 * Removes a service and its prices. Clients who already bought it keep their plans, bookings and payments
 * (those links are simply cleared), but they can no longer book its remaining sessions online.
 */
export async function deleteSessionService(id: string): Promise<ActionResult> {
  await requireAdmin();
  const s = await db.sessionService.findUnique({ where: { id }, select: { imageKey: true } });
  if (!s) return fail("Session not found.");
  await db.sessionService.delete({ where: { id } });
  if (s.imageKey && !isSiteImage(s.imageKey)) await deleteObject(s.imageKey);
  refresh();
  return { ok: true };
}

/** Move a service up or down within its website tab (e.g. among the Clinical Hypnotherapy areas). */
export async function moveSessionService(id: string, dir: -1 | 1): Promise<ActionResult> {
  await requireAdmin();
  const me = await db.sessionService.findUnique({ where: { id }, select: { category: true } });
  if (!me) return fail("Session not found.");
  const all = await db.sessionService.findMany({ where: { category: me.category }, orderBy: [{ order: "asc" }, { title: "asc" }], select: { id: true } });
  const i = all.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= all.length) return { ok: true };
  [all[i], all[j]] = [all[j], all[i]];
  await db.$transaction(all.map((x, n) => db.sessionService.update({ where: { id: x.id }, data: { order: n + 1 } })));
  refresh();
  return { ok: true };
}

export async function setSessionCover(id: string, key: string | null): Promise<ActionResult> {
  await requireAdmin();
  if (key !== null && !/^covers\/[\w.\-\/]+$/.test(key)) return fail("Upload failed. Please try again.");
  const s = await db.sessionService.findUnique({ where: { id }, select: { imageKey: true } });
  if (!s) return fail("Session not found.");
  await db.sessionService.update({ where: { id }, data: { imageKey: key } });
  if (s.imageKey && s.imageKey !== key && !isSiteImage(s.imageKey)) await deleteObject(s.imageKey);
  refresh();
  return { ok: true };
}

// --- Prices: single session and packages ---------------------------------------

const optionSchema = z.object({
  title: z.string().trim().min(1, "Please enter a name, e.g. \"Single session\".").max(80),
  sessions: z.number().int().min(1, "At least 1 session.").max(50),
  price: z.number().min(0.5, "Please enter the AUD price.").max(100000),
  priceAed: z.number().min(0).max(500000).nullable(),
  mode: z.enum(["IN_PERSON", "DISTANCE"]).nullable(),
  note: z.string().max(200).optional().nullable(),
  recorded: z.boolean().optional().default(false),
});

export async function saveSessionOption(serviceId: string, optionId: string | null, input: z.input<typeof optionSchema>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = optionSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the price.");
  const d = parsed.data;
  // Every price is set in both currencies: visitors in the UAE see and pay AED.
  if (!d.priceAed) return fail("Please enter the AED price too (visitors in the UAE see it).");
  const priceAed = Math.round(d.priceAed * 100);
  if (priceAed < 200) return fail("The AED price must be at least AED 2.");
  const data = { title: d.title, sessions: d.sessions, price: Math.round(d.price * 100), priceAed, mode: d.mode, note: blank(d.note), recorded: d.recorded };
  if (optionId) {
    const o = await db.sessionOption.findFirst({ where: { id: optionId, serviceId }, select: { id: true } });
    if (!o) return fail("Price not found.");
    await db.sessionOption.update({ where: { id: optionId }, data });
  } else {
    const count = await db.sessionOption.count({ where: { serviceId } });
    await db.sessionOption.create({ data: { ...data, serviceId, order: count + 1 } });
  }
  refresh();
  return { ok: true };
}

/** Bookings already made keep their price; the option just disappears from the website. */
export async function deleteSessionOption(optionId: string): Promise<ActionResult> {
  await requireAdmin();
  const o = await db.sessionOption.findUnique({ where: { id: optionId }, select: { serviceId: true, service: { select: { published: true, enquiryOnly: true, _count: { select: { options: true } } } } } });
  if (!o) return fail("Price not found.");
  if (o.service.published && !o.service.enquiryOnly && o.service._count.options <= 1) return fail("This is the only price. Hide the session from the website first, or add another price.");
  await db.sessionOption.delete({ where: { id: optionId } });
  refresh();
  return { ok: true };
}

export async function moveSessionOption(optionId: string, dir: -1 | 1): Promise<ActionResult> {
  await requireAdmin();
  const o = await db.sessionOption.findUnique({ where: { id: optionId }, select: { serviceId: true } });
  if (!o) return fail("Price not found.");
  const all = await db.sessionOption.findMany({ where: { serviceId: o.serviceId }, orderBy: [{ order: "asc" }, { sessions: "asc" }], select: { id: true } });
  const i = all.findIndex((x) => x.id === optionId);
  const j = i + dir;
  if (j < 0 || j >= all.length) return { ok: true };
  [all[i], all[j]] = [all[j], all[i]];
  await db.$transaction(all.map((x, n) => db.sessionOption.update({ where: { id: x.id }, data: { order: n + 1 } })));
  refresh();
  return { ok: true };
}
