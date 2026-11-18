"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { deleteObject } from "@/lib/storage";
import { kindForFile } from "@/lib/catalog";
import { youtubeId } from "@/components/portal/youtube";
import { blank, fail, refreshAll, type ActionResult } from "./common";

const base = {
  title: z.string().trim().min(1, "Please enter a title.").max(200),
  description: z.string().max(2000).nullable().optional(),
  tag: z.string().max(100).nullable().optional(),
  personalForUserId: z.string().nullable().optional(),
};

const fileSchema = z.object({
  ...base,
  storageKey: z.string().startsWith("library/"),
  contentType: z.string().max(150),
  sizeBytes: z.number().int().positive(),
  filename: z.string().max(200),
});

const linkSchema = z.object({ ...base, url: z.string().trim().url("Please paste a full link starting with https://") });

const common = (d: { title: string; description?: string | null; tag?: string | null; personalForUserId?: string | null }) => ({
  title: d.title,
  description: blank(d.description),
  tag: blank(d.tag),
  personalForUserId: d.personalForUserId || null,
});

/** A file uploaded to storage: recording, video, PDF, Word document or image. Returns the new library item id. */
export async function createFileResource(input: z.input<typeof fileSchema>): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = fileSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the details.");
  const d = parsed.data;
  const kind = kindForFile(d.contentType, d.filename);
  if (!kind) return fail("This file type isn't supported.");
  const r = await db.resource.create({
    data: { ...common(d), kind, storageKey: d.storageKey, contentType: d.contentType, sizeBytes: d.sizeBytes },
  });
  refreshAll();
  return { ok: true, data: { id: r.id } };
}

/** A web link. YouTube links are shown as a video player, anything else as a link button. */
export async function createLinkResource(input: z.input<typeof linkSchema>): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = linkSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the details.");
  const d = parsed.data;
  const r = await db.resource.create({ data: { ...common(d), kind: youtubeId(d.url) ? "VIDEO" : "LINK", url: d.url } });
  refreshAll();
  return { ok: true, data: { id: r.id } };
}

const updateSchema = z.object({
  ...base,
  url: z.string().trim().url().nullable().optional(),
  // Replace the uploaded file
  replace: z
    .object({ storageKey: z.string().startsWith("library/"), contentType: z.string().max(150), sizeBytes: z.number().int().positive(), filename: z.string().max(200) })
    .nullable()
    .optional(),
});

export async function updateResource(id: string, input: z.input<typeof updateSchema>): Promise<ActionResult> {
  await requireAdmin();
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the details.");
  const existing = await db.resource.findUnique({ where: { id } });
  if (!existing) return fail("Not found.");
  const d = parsed.data;
  const isLink = existing.kind === "VIDEO" || existing.kind === "LINK";
  const replaceKind = d.replace ? kindForFile(d.replace.contentType, d.replace.filename) : null;
  if (d.replace && !replaceKind) return fail("This file type isn't supported.");
  await db.resource.update({
    where: { id },
    data: {
      ...common(d),
      ...(isLink && d.url ? { url: d.url, kind: youtubeId(d.url) ? "VIDEO" : "LINK" } : {}),
      ...(d.replace && replaceKind
        ? { storageKey: d.replace.storageKey, contentType: d.replace.contentType, sizeBytes: d.replace.sizeBytes, kind: replaceKind }
        : {}),
    },
  });
  if (d.replace && existing.storageKey) await deleteObject(existing.storageKey);
  refreshAll();
  return { ok: true };
}

export async function deleteResource(id: string): Promise<ActionResult> {
  await requireAdmin();
  const r = await db.resource.findUnique({ where: { id } });
  if (!r) return fail("Not found.");
  await db.resource.delete({ where: { id } });
  await deleteObject(r.storageKey);
  refreshAll();
  return { ok: true };
}
