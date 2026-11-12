import { redirect } from "next/navigation";

// Old address: sessions and courses now have their own pages.
export default function OldProgrammePage() {
  redirect("/portal");
}
