import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const DEFAULT_ENCOURAGEMENTS = [
  "Well done. You're doing beautifully.",
  "Lovely work. Every small step matters.",
  "That's another step forward. Be proud of yourself.",
  "Wonderful. Take a moment to notice how you feel.",
  "Beautifully done. Keep being kind to yourself.",
];

/** The single settings row, created with defaults the first time it's needed.
 *  Safe when several pages ask at once (e.g. admin pages loading together on a new database). */
type SettingsRow = Prisma.SettingsGetPayload<object>;

// Settings change rarely but are read on almost every page, so keep a copy for a minute.
// Saving settings clears it straight away (see forgetSettings).
const TTL_MS = 60_000;
let memo: { row: SettingsRow; at: number } | null = null;

export function forgetSettings() {
  memo = null;
}

export async function getSettings(): Promise<SettingsRow> {
  if (memo && Date.now() - memo.at < TTL_MS) return memo.row;
  const row = await loadSettings();
  memo = { row, at: Date.now() };
  return row;
}

async function loadSettings() {
  const existing = await db.settings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  try {
    return await db.settings.create({ data: { id: 1 } });
  } catch (e) {
    // Another request created it at the same moment ("unique constraint" P2002): just read it.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return db.settings.findUniqueOrThrow({ where: { id: 1 } });
    }
    throw e;
  }
}

export async function getEncouragements() {
  const [settings, messages, clips] = await Promise.all([
    getSettings(),
    db.encouragementMessage.findMany({ select: { text: true } }),
    db.voiceClip.findMany({ select: { id: true } }),
  ]);
  return {
    mode: settings.voiceMode,
    messages: messages.length ? messages.map((m) => m.text) : DEFAULT_ENCOURAGEMENTS,
    clipIds: clips.map((c) => c.id),
  };
}
