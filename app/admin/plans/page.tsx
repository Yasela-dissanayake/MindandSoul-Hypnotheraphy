import { redirect } from "next/navigation";

// Packages now live at the bottom of the Sessions page.
export default function PackagesPage() {
  redirect("/admin/sessions#packages");
}
