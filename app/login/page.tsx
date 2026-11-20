import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError, CredentialsSignin } from "next-auth";
import { auth, googleEnabled, signIn } from "@/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { SubmitButton } from "@/components/submit-button";
import { RememberMe } from "@/components/auth/remember-me";
import { makeSessionCookiesTemporary, saveRememberChoice } from "@/lib/remember-me";
import { AlertCircle, Info } from "lucide-react";

export const metadata: Metadata = { title: "Sign in · Heal With Rangika", robots: { index: false } };

const MESSAGES: Record<string, { text: string; tone: "error" | "info" }> = {
  invalid: { tone: "error", text: "That username or password isn't right. Please try again." },
  locked: {
    tone: "error",
    text: "Too many wrong attempts, so this account is locked for 15 minutes. Try again later, or ask Rangika to unlock it.",
  },
  closed: { tone: "error", text: "This account is closed. Please contact Rangika if you need access again." },
  AccountClosed: { tone: "error", text: "This account is closed. Please contact Rangika if you need access again." },
  AccessDenied: { tone: "error", text: "We couldn't sign you in with that Google account." },
  OAuthAccountNotLinked: { tone: "error", text: "Please sign in with your username and password." },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const session = await auth();
  if (session?.user) redirect(session.user.role === "ADMIN" ? "/admin" : "/portal");

  const key = sp.code ?? sp.error;
  // Unknown codes (e.g. "Configuration" when the server couldn't finish a Google sign-in) show the code,
  // so the matching line in the server log is easy to find.
  const message =
    key
      ? (MESSAGES[key] ?? { tone: "error" as const, text: `Something went wrong signing in. Please try again. (Error: ${key.slice(0, 40)})` })
      : null;

  async function google(formData: FormData) {
    "use server";
    // Remembered for when Google sends them back (see lib/remember-me.ts).
    await saveRememberChoice(formData.get("remember") === "1");
    await signIn("google", { redirectTo: "/portal" });
  }

  async function login(formData: FormData) {
    "use server";
    const remember = formData.get("remember") === "1";
    await saveRememberChoice(remember);
    try {
      await signIn("credentials", {
        identifier: String(formData.get("identifier") ?? ""),
        password: String(formData.get("password") ?? ""),
        redirectTo: "/portal",
      });
    } catch (e) {
      if (e instanceof CredentialsSignin) redirect(`/login?code=${encodeURIComponent(e.code)}`);
      if (e instanceof AuthError) redirect("/login?error=Configuration");
      // Signed in. Without "Remember me", the sign-in ends when the browser closes.
      if (!remember) await makeSessionCookiesTemporary();
      throw e; // the successful sign-in redirect
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-100 to-sage-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
        <div className="mb-6 flex flex-col items-center text-center">
          <Link href="/" aria-label="Back to the website" title="Back to the website" className="rounded-full transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-2">
            <Image src="/logo.jpeg" alt="Heal With Rangika" width={72} height={72} priority className="rounded-full" />
          </Link>
          <h1 className="mt-4 font-serif text-2xl text-stone-800">Welcome back</h1>
          <p className="mt-1 text-sm text-stone-500">Sign in to your private space</p>
        </div>

        {message && (
          <p
            role="alert"
            className={`mb-4 flex items-start gap-2 rounded-lg p-3 text-sm font-medium ring-1 ${
              message.tone === "info" ? "bg-sage-50 text-sage-900 ring-sage-200" : "bg-red-50 text-red-800 ring-red-200"
            }`}
          >
            {message.tone === "info" ? <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
            <span>{message.text}</span>
          </p>
        )}

        {sp.bought && !message && (
          // Arrived from the payment pop-up or the purchase email.
          <p className="mb-4 rounded-lg bg-sage-50 p-3 text-sm text-sage-900 ring-1 ring-sage-200">
            Thank you for your purchase! Sign in with the username and password we emailed you (check your spam folder if you can&apos;t see it).
          </p>
        )}

        <form action={login} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">Username or email</Label>
            <Input
              id="identifier"
              name="identifier"
              required
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" name="password" required autoComplete="current-password" className="h-12 text-base" />
          </div>
          <RememberMe mirrorId="google-remember" />
          <SubmitButton className="h-12 w-full bg-sage-600 text-base hover:bg-sage-700" pendingText="Signing in…">
            Sign in
          </SubmitButton>
        </form>

        {googleEnabled && (
          <>
            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-stone-400">
              <span className="h-px flex-1 bg-stone-200" />
              or
              <span className="h-px flex-1 bg-stone-200" />
            </div>
            <form action={google}>
              <input suppressHydrationWarning type="hidden" id="google-remember" name="remember" defaultValue="0" />
              <SubmitButton variant="outline" className="h-12 w-full gap-3 text-base" pendingText="Opening Google…">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                  <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
                </svg>
                Continue with Google
              </SubmitButton>
            </form>
            <p className="mt-2 text-center text-xs text-stone-500">
              Use Google with the same email you booked or paid with. New here?{" "}
              <Link href="/get-started" className="text-sage-700 underline">
                See what Rangika offers
              </Link>
            </p>
          </>
        )}

        <p className="mt-6 text-center text-xs text-stone-500">
          Forgot your password or don&apos;t have an account?{" "}
          <Link href="/contact" className="text-sage-700 underline">
            Contact Rangika
          </Link>
        </p>
      </div>
    </main>
  );
}
