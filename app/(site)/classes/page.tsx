import { permanentRedirect } from "next/navigation";

// Old address: classes are now under Reiki Training.
export default function OldClassesPage() {
  permanentRedirect("/reiki-training");
}
