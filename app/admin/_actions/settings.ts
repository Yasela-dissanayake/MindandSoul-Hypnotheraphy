"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { isValidTimezone } from "@/lib/dates";
import { deleteObject } from "@/lib/storage";
import { DEFAULT_ENCOURAGEMENTS, forgetSettings } from "@/lib/settings";
import { blank, fail, refreshAll, type ActionResult } from "./common";

const schema = z.object({
  notifyMode: z.enum(["IMMEDIATE", "DAILY_DIGEST"]),
  activityEmails: z.boolean(),
  defaultReminderHour: z.number().int().min(0).max(23),
  adminTimezone: z.string().refine(isValidTimezone, "Unknown time zone"),
  welcomeNote: z.string().max(5000).nullable().optional(),
  inviteEmailText: z.string().max(5000).nullable().optional(),
  reminderEmailText: z.string().max(2000).nullable().optional(),
});

export async function updateSettings(input: z.input<typeof schema>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the settings.");
  const d = parsed.data;
  const data = {
    ...d,
    welcomeNote: blank(d.welcomeNote),
    inviteEmailText: blank(d.inviteEmailText),
    reminderEmailText: blank(d.reminderEmailText),
  };
  await db.settings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  forgetSettings();
  refreshAll();
  return { ok: true };
}

export async function setVoiceMode(voiceMode: "COMPUTER" | "RECORDED" | "BOTH"): Promise<ActionResult> {
  await requireAdmin();
  if (!["COMPUTER", "RECORDED", "BOTH"].includes(voiceMode)) return fail("Unknown option.");
  await db.settings.upsert({ where: { id: 1 }, update: { voiceMode }, create: { id: 1, voiceMode } });
  forgetSettings();
  refreshAll();
  return { ok: true };
}

export async function addEncouragement(text: string): Promise<ActionResult> {
  await requireAdmin();
  const t = text.trim();
  if (!t) return fail("Please write a message.");
  if (t.length > 200) return fail("Keep it short (under 200 characters).");
  // The first custom message replaces the built-in defaults, so copy them in first.
  if ((await db.encouragementMessage.count()) === 0) {
    await db.encouragementMessage.createMany({ data: DEFAULT_ENCOURAGEMENTS.map((text) => ({ text })) });
  }
  await db.encouragementMessage.create({ data: { text: t } });
  refreshAll();
  return { ok: true };
}

export async function deleteEncouragement(id: string): Promise<ActionResult> {
  await requireAdmin();
  if ((await db.encouragementMessage.count()) <= 1) return fail("Keep at least one message.");
  await db.encouragementMessage.delete({ where: { id } });
  refreshAll();
  return { ok: true };
}

export async function addVoiceClip(input: { label: string; storageKey: string; sizeBytes: number }): Promise<ActionResult> {
  await requireAdmin();
  if (!input.storageKey.startsWith("voice/")) return fail("Upload is not valid.");
  await db.voiceClip.create({
    data: { label: input.label.trim().slice(0, 100) || "Voice message", storageKey: input.storageKey, sizeBytes: input.sizeBytes },
  });
  refreshAll();
  return { ok: true };
}

export async function deleteVoiceClip(id: string): Promise<ActionResult> {
  await requireAdmin();
  const clip = await db.voiceClip.findUnique({ where: { id } });
  if (!clip) return fail("Not found.");
  await db.voiceClip.delete({ where: { id } });
  await deleteObject(clip.storageKey);
  refreshAll();
  return { ok: true };
}
