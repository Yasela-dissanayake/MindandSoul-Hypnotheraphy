import { signOut } from "@/auth";
import { requireClientPage } from "@/lib/authz";
import { SubmitButton } from "@/components/submit-button";
import { ProfileForm } from "@/components/portal/profile-form";
import { ChangePasswordForm } from "@/components/auth/change-password-form";

export default async function ProfilePage() {
  const user = await requireClientPage();

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-stone-800">Profile & settings</h1>
        <p className="mt-1 text-sm text-stone-500">
          {user.email}
        </p>
      </div>
      <ProfileForm
        initial={{
          name: user.name ?? "",
          timezone: user.timezone,
          reminderHour: user.reminderHour,
          remindersOn: user.remindersOn,
          voiceOn: user.voiceOn,
        }}
      />
      <ChangePasswordForm
        hasPassword={Boolean(user.passwordHash)}
        note={user.username ? `Your username is ${user.username}.` : undefined}
      />
      <form action={logout}>
        <SubmitButton variant="outline" className="h-11 w-full" pendingText="Signing out…">
          Sign out
        </SubmitButton>
      </form>
    </div>
  );
}
