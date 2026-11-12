import { createCipheriv, createDecipheriv, createHash, randomBytes, randomInt, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

// Passwords are checked against a one-way scrypt hash.
// Separately, a password the ADMIN created or reset is kept encrypted (AES-256-GCM) so she can
// view and share it. That copy is deleted as soon as the client sets their own password.

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, keylen: number, opts: object) => Promise<Buffer>;
const PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEYLEN = 64;

export const PASSWORD_MIN = 8;

export function passwordProblem(pw: string): string | null {
  if (pw.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters.`;
  if (pw.length > 200) return "That password is too long.";
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return "Use letters and at least one number.";
  return null;
}

export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(pw, salt, KEYLEN, PARAMS);
  return `scrypt$${PARAMS.N}$${PARAMS.r}$${PARAMS.p}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifyPassword(pw: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored) {
    // Spend the same time as a real check so attackers can't tell which accounts exist.
    await scryptAsync(pw, randomBytes(16), KEYLEN, PARAMS);
    return false;
  }
  const [scheme, N, r, p, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt") return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scryptAsync(pw, Buffer.from(saltB64, "base64"), expected.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
    maxmem: PARAMS.maxmem,
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Easy to read aloud or type on a phone, e.g. "Willow-Meadow-4821".
const WORDS = [
  "Amber", "Aspen", "Autumn", "Bamboo", "Birch", "Bloom", "Breeze", "Brook", "Calm", "Cedar",
  "Cloud", "Clover", "Coral", "Cove", "Dawn", "Dew", "Dove", "Ember", "Fern", "Field",
  "Forest", "Garden", "Glade", "Glow", "Grove", "Harbor", "Haven", "Hazel", "Heather", "Honey",
  "Iris", "Ivy", "Jade", "Lagoon", "Lake", "Lantern", "Lavender", "Leaf", "Lily", "Lotus",
  "Maple", "Meadow", "Mint", "Moon", "Moss", "Ocean", "Olive", "Orchid", "Pebble", "Pine",
  "Pond", "Rain", "Reed", "River", "Rose", "Sage", "Shore", "Sky", "Spring", "Star",
  "Stone", "Summer", "Sun", "Tide", "Valley", "Velvet", "Willow", "Wind", "Winter", "Wren",
];

export function generatePassword(): string {
  const w1 = WORDS[randomInt(WORDS.length)];
  let w2 = WORDS[randomInt(WORDS.length)];
  while (w2 === w1) w2 = WORDS[randomInt(WORDS.length)];
  return `${w1}-${w2}-${randomInt(1000, 10000)}`;
}

function viewKey() {
  return createHash("sha256").update(`password-view:${process.env.AUTH_SECRET ?? "dev"}`).digest();
}

/** Encrypt a password so the admin can view it later. */
export function sealForAdmin(pw: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", viewKey(), iv);
  const data = Buffer.concat([cipher.update(pw, "utf8"), cipher.final()]);
  return `v1.${iv.toString("base64")}.${cipher.getAuthTag().toString("base64")}.${data.toString("base64")}`;
}

/** Decrypt the admin's viewable copy. Returns null if it can't be read (e.g. AUTH_SECRET changed). */
export function openForAdmin(sealed: string | null | undefined): string | null {
  if (!sealed) return null;
  try {
    const [v, iv, tag, data] = sealed.split(".");
    if (v !== "v1") return null;
    const decipher = createDecipheriv("aes-256-gcm", viewKey(), Buffer.from(iv, "base64"));
    decipher.setAuthTag(Buffer.from(tag, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

/** Usernames: lowercase letters, numbers, dots, dashes and underscores. */
export function normaliseUsername(u: string) {
  return u.trim().toLowerCase();
}

export function usernameProblem(u: string): string | null {
  if (u.length < 3) return "Usernames need at least 3 characters.";
  if (u.length > 40) return "That username is too long.";
  if (!/^[a-z0-9._-]+$/.test(u)) return "Use only letters, numbers, dots, dashes or underscores.";
  if (u.includes("@")) return "A username can't contain @.";
  return null;
}

export function usernameFromName(name: string) {
  const base = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 30);
  return base.length >= 3 ? base : `${base || "client"}.${randomInt(100, 1000)}`;
}
