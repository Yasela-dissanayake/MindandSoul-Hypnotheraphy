import { requireAdminPage } from "@/lib/authz";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { db } from "@/lib/db";
import { getSettings, DEFAULT_ENCOURAGEMENTS } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";
import { EncouragementManager } from "@/components/admin/encouragement-manager";

export default async function SettingsPage() {
  const admin = await requireAdminPage();
  const me = await db.user.findUnique({ where: { id: admin.id }, select: { passwordHash: true, email: true } });
  const [settings, messages, clips] = await Promise.all([
    getSettings(),
    db.encouragementMessage.findMany({ orderBy: { id: "asc" } }),
    db.voiceClip.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-stone-800">Settings</h1>
        <p className="text-stone-500">Encouraging voice, emails and welcome message.</p>
      </div>
      <EncouragementManager
        voiceMode={settings.voiceMode}
        messages={messages.length ? messages.map((m) => ({ id: m.id, text: m.text })) : DEFAULT_ENCOURAGEMENTS.map((text) => ({ id: null, text }))}
        clips={clips.map((c) => ({ id: c.id, label: c.label }))}
      />
      <ChangePasswordForm
        hasPassword={Boolean(me?.passwordHash)}
        note={`Your admin account: ${me?.email ?? ""}. You can sign in with this email and password, or with Google.`}
      />
      <SettingsForm
        initial={{
          notifyMode: settings.notifyMode,
          activityEmails: settings.activityEmails,
          defaultReminderHour: settings.defaultReminderHour,
          adminTimezone: settings.adminTimezone,
          welcomeNote: settings.welcomeNote ?? "",
          inviteEmailText: settings.inviteEmailText ?? "",
          reminderEmailText: settings.reminderEmailText ?? "",
        }}
      />
    </div>
  );
}
