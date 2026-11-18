import { redirect } from "next/navigation";
import { requireClientPage } from "@/lib/authz";
import { getSettings } from "@/lib/settings";
import { WelcomeForm } from "./welcome-form";

export default async function WelcomePage() {
  const user = await requireClientPage({ allowWithoutConsent: true });
  if (user.consentAt) redirect("/portal");
  const settings = await getSettings();
  const note =
    settings.welcomeNote?.trim() ||
    `I'm so glad you're here. This is your private space. You'll find your sessions work or class material here, along with a journal to share how you're feeling. Go gently, there's no rush. With warmth, Rangika`;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-stone-800">Welcome{user.name ? `, ${user.name.split(" ")[0]}` : ""} 🌿</h1>
      </div>
      <div className="whitespace-pre-line rounded-2xl bg-sage-50 p-5 font-serif leading-relaxed text-stone-700">{note}</div>
      <WelcomeForm currentTimezone={user.timezone} />
    </div>
  );
}
