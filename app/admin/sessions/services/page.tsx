import { redirect } from "next/navigation";

// The session services and prices are on the Sessions page itself now.
export default function SessionServicesPage() {
  redirect("/admin/sessions#services");
}
