// Set (or create) a password for an account from the command line.
// Mainly for the admin's own account, e.g. the first time:
//
//   pnpm user:password healwithrangika@gmail.com
//   pnpm user:password healwithrangika@gmail.com "My-Own-Pass1"   (choose it yourself)
//
// If the email is listed in ADMIN_EMAILS and has no account yet, an admin account is created.
// A password is generated when you don't give one. The new password is printed once.

import { randomBytes, randomInt, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { PrismaClient } from "@prisma/client";

const scryptAsync = promisify(scrypt);
const [email, given] = process.argv.slice(2);
if (!email) {
  console.error('Usage: pnpm user:password <email> ["password"]');
  process.exit(1);
}

const WORDS = ["Amber", "Aspen", "Bloom", "Breeze", "Brook", "Cedar", "Clover", "Coral", "Dawn", "Fern", "Garden", "Grove", "Haven", "Hazel", "Iris", "Ivy", "Jade", "Lake", "Lily", "Lotus", "Maple", "Meadow", "Mint", "Moss", "Ocean", "Olive", "Pebble", "Pine", "River", "Rose", "Sage", "Shore", "Sky", "Stone", "Tide", "Valley", "Willow", "Wren"];
const password = given ?? `${WORDS[randomInt(WORDS.length)]}-${WORDS[randomInt(WORDS.length)]}-${randomInt(1000, 10000)}`;
if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
  console.error("Password needs 8+ characters with letters and a number.");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = await scryptAsync(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
const passwordHash = `scrypt$16384$8$1$${salt.toString("base64")}$${hash.toString("base64")}`;

const db = new PrismaClient();
const lower = email.trim().toLowerCase();
const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
let user = await db.user.findUnique({ where: { email: lower } });
if (!user) {
  if (!admins.includes(lower)) {
    console.error(`No account for ${lower}. Create clients in the dashboard instead.`);
    process.exit(1);
  }
  user = await db.user.create({ data: { email: lower, name: "Rangika", role: "ADMIN", status: "ACTIVE" } });
  console.log(`Created admin account for ${lower}`);
}
await db.user.update({
  where: { id: user.id },
  data: { passwordHash, passwordView: null, passwordChangedAt: new Date(), failedLogins: 0, lockedUntil: null, sessionVersion: { increment: 1 } },
});
await db.$disconnect();
console.log(`Password set for ${lower}${user.username ? ` (username: ${user.username})` : ""}:\n\n  ${password}\n`);
