"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { deleteObject } from "@/lib/storage";
import { isSiteImage } from "@/lib/covers";
import { DAY_MS, MAX_DAYS, runningWhere } from "@/lib/promotions";
import { fail, type ActionResult } from "./common";

// Admin → Promotion. Only one promotion runs at a time; it starts when it's created (or run again)
// and stops after its number of days, or when Rangika ends it early.

function refresh() {
  revalidatePath("/", "layout"); // home page, listings and the pages of the linked item
  revalidatePath("/admin/promotions", "layout");
}

const schema = z.object({
  title: z.string().trim().min(1, "Please enter a title.").max(120, "Please use a shorter title (120 characters at most)."),
  content: z.string().trim().min(1, "Please write what the promotion is about.").max(4000, "Please shorten the text (4,000 characters at most)."),
  days: z.coerce.number().int("Please enter a whole number of days.").min(1, "Show it for at least 1 day.").max(MAX_DAYS, `${MAX_DAYS} days at most.`),
  // "session:<id>" | "class:<id>" | "course:<id>" | "" (not linked)
  link: z.string().max(80).default(""),
  free: z.boolean().default(false),
  // Only when creating: a photo already uploaded from the form (a storage key "covers/...").
  imageKey: z
    .string()
    .regex(/^covers\/[\w.\-\/]+$/, "The photo upload failed. Please choose it again.")
    .nullish(),
});
export type PromotionInput = z.input<typeof schema>;

/** Turns the "link" choice into the right column, checking the item exists. */
async function linkData(link: string) {
  const empty = { sessionServiceId: null, courseId: null, packageId: null };
  if (!link) return { ok: true as const, data: empty };
  const [kind, id] = link.split(":");
  if (!id) return { ok: false as const, error: "Please choose what to link to again." };
  const found =
    kind === "session"
      ? await db.sessionService.findUnique({ where: { id }, select: { id: true } })
      : kind === "class"
        ? await db.course.findUnique({ where: { id }, select: { id: true } })
        : kind === "course"
          ? await db.learningPackage.findUnique({ where: { id }, select: { id: true } })
          : null;
  if (!found) return { ok: false as const, error: "That session, class or course no longer exists." };
  return {
    ok: true as const,
    data: { ...empty, ...(kind === "session" ? { sessionServiceId: id } : kind === "class" ? { courseId: id } : { packageId: id }) },
  };
}

function parse(input: PromotionInput) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Please check the details." };
  if (parsed.data.free && !parsed.data.link) return { ok: false as const, error: "To make something free, choose which session, class or course it is." };
  return { ok: true as const, data: parsed.data };
}

const runningOther = (excludeId?: string) =>
  db.promotion.findFirst({ where: { ...runningWhere(), ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { title: true } });

export async function createPromotion(input: PromotionInput): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const p = parse(input);
  if (!p.ok) return fail(p.error);
  const running = await runningOther();
  if (running) return fail(`"${running.title}" is running now. Only one promotion can run at a time: end it first.`);
  const link = await linkData(p.data.link);
  if (!link.ok) return fail(link.error);
  const now = new Date();
  const promo = await db.promotion.create({
    data: {
      title: p.data.title,
      content: p.data.content,
      days: p.data.days,
      free: p.data.free,
      startsAt: now,
      endsAt: new Date(now.getTime() + p.data.days * DAY_MS),
      imageKey: p.data.imageKey ?? null,
      ...link.data,
    },
  });
  refresh();
  return { ok: true, data: { id: promo.id } };
}

/** Changing the days moves the end date (counted from when it started). */
export async function updatePromotion(id: string, input: PromotionInput): Promise<ActionResult> {
  await requireAdmin();
  const p = parse(input);
  if (!p.ok) return fail(p.error);
  const promo = await db.promotion.findUnique({ where: { id } });
  if (!promo) return fail("Promotion not found.");
  const link = await linkData(p.data.link);
  if (!link.ok) return fail(link.error);
  const running = promo.startsAt <= new Date() && promo.endsAt > new Date();
  await db.promotion.update({
    where: { id },
    data: {
      title: p.data.title,
      content: p.data.content,
      days: p.data.days,
      free: p.data.free,
      // A promotion that already ended keeps its dates until it's run again.
      ...(running ? { endsAt: new Date(promo.startsAt.getTime() + p.data.days * DAY_MS) } : {}),
      ...link.data,
    },
  });
  refresh();
  return { ok: true };
}

/** Stop showing it now. */
export async function endPromotion(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.promotion.updateMany({ where: { id, endsAt: { gt: new Date() } }, data: { endsAt: new Date() } });
  refresh();
  return { ok: true };
}

/** Show a past promotion again, from today for its number of days. */
export async function restartPromotion(id: string): Promise<ActionResult> {
  await requireAdmin();
  const promo = await db.promotion.findUnique({ where: { id } });
  if (!promo) return fail("Promotion not found.");
  const running = await runningOther(id);
  if (running) return fail(`"${running.title}" is running now. Only one promotion can run at a time: end it first.`);
  const now = new Date();
  await db.promotion.update({ where: { id }, data: { startsAt: now, endsAt: new Date(now.getTime() + promo.days * DAY_MS) } });
  refresh();
  return { ok: true };
}

export async function deletePromotion(id: string): Promise<ActionResult> {
  await requireAdmin();
  const promo = await db.promotion.findUnique({ where: { id }, select: { imageKey: true } });
  if (!promo) return fail("Promotion not found.");
  await db.promotion.delete({ where: { id } });
  if (promo.imageKey && !isSiteImage(promo.imageKey)) await deleteObject(promo.imageKey).catch(() => {});
  refresh();
  return { ok: true };
}

/** Sets (or removes, with null) the promotion's photo. */
export async function setPromotionImage(id: string, key: string | null): Promise<ActionResult> {
  await requireAdmin();
  if (key !== null && !/^covers\/[\w.\-\/]+$/.test(key)) return fail("Upload failed. Please try again.");
  const promo = await db.promotion.findUnique({ where: { id }, select: { imageKey: true } });
  if (!promo) return fail("Promotion not found.");
  await db.promotion.update({ where: { id }, data: { imageKey: key } });
  if (promo.imageKey && promo.imageKey !== key && !isSiteImage(promo.imageKey)) await deleteObject(promo.imageKey).catch(() => {});
  refresh();
  return { ok: true };
}
