import { redirect } from "next/navigation";

// Old address: material is now on the sessions and courses pages.
export default function OldLibraryPage() {
  redirect("/portal");
}
