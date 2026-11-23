import { permanentRedirect } from "next/navigation";

// Old address: one-to-one sessions are now under Clinical Hypnotherapy and Reiki Energy Healing.
export default function OldSessionsPage() {
  permanentRedirect("/hypnotherapy");
}
