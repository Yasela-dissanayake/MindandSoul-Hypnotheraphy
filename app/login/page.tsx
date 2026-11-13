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

export const metadata: Metadata = { title: "Sign in · Heal With Rangika", robots: { index: false } };

const MESSAGES: Record<string, { text: string; tone: "error" | "info" }> = {
  invalid: { tone: "error", text: "That username or password isn't right. Please try again." },
  locked: {
    tone: "error",
    text: "Too many wrong attempts, so this account is locked for 15 minutes. Try again later, or ask Rangika to unlock it.",
  },
  closed: { tone: "error", text: "This account is closed. Please contact Rangika if you need access again." },
  AccountClosed: { tone: "error", text: "This account is closed. Please contact Rangika if you need access again." },
  RequestSent: {
    tone: "info",
    text: "Thank you. Your request has been sent to Rangika. You'll get an email as soon as she approves it.",
  },
  RequestPending: { tone: "info", text: "Your request is still waiting for Rangika's approval. You'll get an email when it's approved." },
  RequestDeclined: { tone: "error", text: "Your access request wasn't approved. Please contact Rangika if you think this is a mistake." },
  AccessDenied: { tone: "error", text: "We couldn't sign you in with that Google account." },
  OAuthAccountNotLinked: { tone: "error", text: "Please sign in with your username and password." },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const session = await auth();
  if (session?.user) redirect(session.user.role === "ADMIN" ? "/admin" : "/portal");

  const key = sp.code ?? sp.error;
  const message = key ? (MESSAGES[key] ?? { tone: "error" as const, text: "Something went wrong signing in. Please try again." }) : null;

  async function google() {
    "use server";
    await signIn("google", { redirectTo: "/portal" });
  }

  async function login(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        identifier: String(formData.get("identifier") ?? ""),
        password: String(formData.get("password") ?? ""),
        redirectTo: "/portal",
      });
    } catch (e) {
      if (e instanceof CredentialsSignin) redirect(`/login?code=${encodeURIComponent(e.code)}`);
      if (e instanceof AuthError) redirect("/login?error=Configuration");
      throw e; // the successful sign-in redirect
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-100 to-sage-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/logo.jpeg" alt="Heal With Rangika" width={72} height={72} priority className="rounded-full" />
          <h1 className="mt-4 font-serif text-2xl text-stone-800">Welcome back</h1>
          <p className="mt-1 text-sm text-stone-500">Sign in to your private space</p>
        </div>

        {message && (
          <p
            role="alert"
            className={`mb-4 rounded-lg p-3 text-sm ${message.tone === "info" ? "bg-sage-50 text-sage-800" : "bg-amber-50 text-amber-800"}`}
          >
            {message.text}
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
              <SubmitButton variant="outline" className="h-12 w-full gap-3 text-base" pendingText="Opening Google…">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                  <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
                </svg>
                Continue with Google
              </SubmitButton>
            </form>
            <p className="mt-2 text-center text-xs text-stone-500">New with Google? Rangika will need to approve your access first.</p>
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
