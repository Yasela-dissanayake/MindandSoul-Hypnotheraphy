"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { notify } from "@/lib/notifications";
import { deleteObject } from "@/lib/storage";
import { journalReplyEmail, sendMail } from "@/lib/mail";
import { fail, refreshAll, type ActionResult } from "./common";

// Rangika replies to a client's journal entry with a typed message, a voice message, or both.
// The client sees it under the entry (with a "new reply" dot on the menu) and is emailed the first time.

const replySchema = z.object({
  text: z.string().trim().max(5000, "Please keep the reply shorter.").optional(),
  /** A new voice message (replaces any earlier one). */
  audio: z
    .object({
      key: z.string().regex(/^journal-replies\//, "Voice message upload is not valid.").max(300),
      type: z.string().max(100),
      seconds: z.number().int().min(0).max(60 * 30),
    })
    .optional(),
  /** Take the earlier voice message away (without a new one). */
  removeAudio: z.boolean().optional(),
});

export async function saveJournalReply(entryId: string, input: z.infer<typeof replySchema>): Promise<ActionResult<{ emailed: boolean }>> {
  await requireAdmin();
  const parsed = replySchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the reply.");
  const { text, audio, removeAudio } = parsed.data;

  const entry = await db.journalEntry.findUnique({ where: { id: entryId }, include: { user: { select: { name: true, email: true, status: true } } } });
  if (!entry) return fail("Journal entry not found.");

  const dropOld = Boolean(entry.replyAudioKey && (audio || removeAudio));
  const keepsAudio = Boolean(audio || (entry.replyAudioKey && !removeAudio));
  if (!text && !keepsAudio) return fail("Write a reply or record a voice message first.");

  const firstReply = !entry.repliedAt;
  await db.journalEntry.update({
    where: { id: entryId },
    data: {
      replyText: text || null,
      ...(audio
        ? { replyAudioKey: audio.key, replyAudioType: audio.type, replyAudioSeconds: audio.seconds }
        : removeAudio
          ? { replyAudioKey: null, replyAudioType: null, replyAudioSeconds: null }
          : {}),
      repliedAt: new Date(),
      replySeenAt: null, // a new or changed reply shows as new to the client again
      readAt: entry.readAt ?? new Date(),
    },
  });
  if (dropOld) await deleteObject(entry.replyAudioKey).catch(() => {});

  await notify(entry.userId, {
    kind: "JOURNAL_REPLY",
    title: firstReply ? "Rangika replied to your journal" : "Rangika updated her reply",
    body: keepsAudio && !text ? "A voice message" : text ? (text.length > 90 ? `${text.slice(0, 87)}…` : text) : null,
    href: "/portal/journal#past-entries",
  });
  let emailed = false;
  if (firstReply && entry.user.status !== "FINISHED") {
    const res = await sendMail({ to: entry.user.email, ...journalReplyEmail({ name: entry.user.name, reply: text, voice: keepsAudio }) });
    emailed = res.ok;
    if (!res.ok) console.error("Journal reply email failed for entry", entryId);
  }
  refreshAll();
  return { ok: true, data: { emailed } };
}

export async function deleteJournalReply(entryId: string): Promise<ActionResult> {
  await requireAdmin();
  const entry = await db.journalEntry.findUnique({ where: { id: entryId }, select: { replyAudioKey: true } });
  if (!entry) return fail("Journal entry not found.");
  await db.journalEntry.update({
    where: { id: entryId },
    data: { replyText: null, replyAudioKey: null, replyAudioType: null, replyAudioSeconds: null, repliedAt: null, replySeenAt: null },
  });
  if (entry.replyAudioKey) await deleteObject(entry.replyAudioKey).catch(() => {});
  refreshAll();
  return { ok: true };
}

/** Rangika ticks a journal entry as read (or puts it back to unread). The client sees "Read by Rangika". */
export async function setJournalEntryRead(entryId: string, read: boolean): Promise<ActionResult> {
  await requireAdmin();
  const res = await db.journalEntry.updateMany({ where: { id: entryId }, data: { readAt: read ? new Date() : null } });
  if (!res.count) return fail("Journal entry not found.");
  refreshAll();
  return { ok: true };
}

/** Tick all of one person's unread journal entries as read. */
export async function markAllJournalRead(userId: string): Promise<ActionResult> {
  await requireAdmin();
  await db.journalEntry.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
  refreshAll();
  return { ok: true };
}
