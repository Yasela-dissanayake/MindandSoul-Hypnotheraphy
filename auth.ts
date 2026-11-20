import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Role, UserStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { getUserRow } from "@/lib/request-cache";
import { verifyPassword } from "@/lib/passwords";
import { sendMail, welcomeEmail } from "@/lib/mail";
import { REMEMBER_HOURS, rememberChoice, SHORT_SESSION_HOURS } from "@/lib/remember-me";

// Sign-in rules
// 1. Username (or email) + password: accounts the admin created. 5 wrong tries locks the account for 15 minutes.
// 2. Google: only for people who already have an account (the admin, people Rangika added, and anyone who
//    booked or bought with that email). No account is ever made just by signing in: someone new is sent to
//    the public "Get started" page, which shows what Rangika offers. Booking or buying makes their account.
// Sessions are signed cookies (JWT). Every request re-checks the account in the database, so
// finishing an account or resetting its password signs that person out straight away.
// "Remember me" (login page): ticked = 30 days; not ticked = until the browser closes, 12 hours at most.

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const isAdminEmail = (email: string) => adminEmails.includes(email.toLowerCase());
export const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

// What we keep in the signed session cookie.
type Token = {
  uid?: string;
  sv?: number; // session version: must match the user's, or the session is ended
  role?: Role;
  status?: UserStatus;
  hasConsented?: boolean;
  timezone?: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  rem?: boolean; // ticked "Remember me" (missing on older sign-ins = remembered)
  since?: number; // when they signed in (ms)
};

class LoginError extends CredentialsSignin {
  constructor(code: "invalid" | "locked" | "closed") {
    super();
    this.code = code;
  }
}

const providers = [];
if (googleEnabled) {
  // Google verifies email addresses, so a Google sign-in can be linked to the account
  // Rangika created or approved for that email.
  providers.push(Google({ allowDangerousEmailAccountLinking: true }));
}
providers.push(
  Credentials({
    id: "credentials",
    credentials: { identifier: { label: "Username or email" }, password: { label: "Password", type: "password" } },
    async authorize(raw) {
      const identifier = String(raw?.identifier ?? "").trim().toLowerCase();
      const password = String(raw?.password ?? "");
      if (!identifier || !password) throw new LoginError("invalid");

      const user = await db.user.findFirst({ where: { OR: [{ username: identifier }, { email: identifier }] } });
      if (user?.lockedUntil && user.lockedUntil > new Date()) throw new LoginError("locked");

      const ok = await verifyPassword(password, user?.passwordHash);
      if (!user || !ok) {
        if (user) {
          const failed = user.failedLogins + 1;
          await db.user.update({
            where: { id: user.id },
            data:
              failed >= MAX_FAILED
                ? { failedLogins: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60_000) }
                : { failedLogins: failed },
          });
          if (failed >= MAX_FAILED) throw new LoginError("locked");
        }
        throw new LoginError("invalid");
      }
      if (user.status === "FINISHED") throw new LoginError("closed");

      await db.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null } });
      return { id: user.id, email: user.email, name: user.name, image: user.image };
    },
  }),
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers,
  trustHost: true,
  session: { strategy: "jwt", maxAge: REMEMBER_HOURS * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  logger: {
    // Normal situations, not server errors, so don't fill the terminal with stack traces:
    // - CredentialsSignin: someone typed a wrong password.
    // - JWTSessionError: the browser sent an old or unreadable sign-in cookie (e.g. from before
    //   the sign-in system changed, or after AUTH_SECRET changed). They're simply treated as signed out.
    error(error) {
      const type = (error as { type?: string }).type ?? error.name;
      if (type === "CredentialsSignin" || type === "JWTSessionError") return;
      // One clear line to search for in the terminal / Netlify function logs, then the details.
      const cause = (error as { cause?: { err?: unknown } }).cause?.err ?? (error as { cause?: unknown }).cause;
      console.error(`[sign-in error] ${type}: ${error.message}${cause instanceof Error ? ` | cause: ${cause.message}` : ""}`);
      console.error(error);
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials") return true; // checked in authorize()

      // Google
      const email = (profile?.email ?? user.email)?.toLowerCase();
      if (!email || profile?.email_verified === false) return "/login?error=AccessDenied";

      if (isAdminEmail(email)) {
        await db.user.upsert({
          where: { email },
          update: { role: "ADMIN", status: "ACTIVE" },
          create: { email, name: user.name ?? "Rangika", image: user.image, role: "ADMIN", status: "ACTIVE" },
        });
        return true;
      }

      const existing = await db.user.findUnique({ where: { email } });
      if (existing) return existing.status === "FINISHED" ? "/login?error=AccountClosed" : true;

      // New here: no account is made (anyone could otherwise create one). Show them what's on offer instead.
      return "/get-started?from=google";
    },

    async jwt({ token: rawToken, user }) {
      const token = rawToken as typeof rawToken & Token;
      if (user?.id) {
        token.uid = user.id;
        token.rem = await rememberChoice();
        token.since = Date.now();
      }
      if (!token.uid) return null;
      // Without "Remember me" the session ends after a few hours, even if the browser stays open.
      // With it, after 30 days (counted from signing in, not from the last visit).
      const limitHours = token.rem === false ? SHORT_SESSION_HOURS : REMEMBER_HOURS;
      if (token.since && Date.now() - token.since > limitHours * 3_600_000) return null;
      if (token.rem === false && !token.since) return null;
      // Fresh copy when signing in; otherwise shared with the page being rendered.
      const u = user?.id ? await db.user.findUnique({ where: { id: token.uid } }) : await getUserRow(token.uid);
      if (!u || u.status === "FINISHED") return null;
      if (user?.id) token.sv = u.sessionVersion; // just signed in
      else if (token.sv !== u.sessionVersion) return null; // password reset or signed out everywhere
      token.role = u.role;
      token.status = u.status;
      token.hasConsented = Boolean(u.consentAt);
      token.timezone = u.timezone;
      token.name = u.name;
      token.email = u.email;
      token.picture = u.image;
      return token;
    },

    async session({ session, token: rawToken }) {
      const token = rawToken as typeof rawToken & Token;
      session.user.id = token.uid!;
      session.user.role = token.role!;
      session.user.status = token.status!;
      session.user.hasConsented = Boolean(token.hasConsented);
      session.user.timezone = token.timezone!;
      session.user.name = token.name ?? null;
      session.user.email = token.email ?? "";
      session.user.image = token.picture ?? null;
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (!user.id) return;
      const u = await db.user.findUnique({ where: { id: user.id } });
      if (!u) return;
      const firstTime = u.status === "INVITED";
      await db.user.update({
        where: { id: u.id },
        data: { status: firstTime ? "ACTIVE" : u.status, lastActiveAt: new Date() },
      });
      if (firstTime && u.role === "CLIENT") {
        await sendMail({ to: u.email, ...welcomeEmail({ name: u.name }) });
      }
    },
  },
});
