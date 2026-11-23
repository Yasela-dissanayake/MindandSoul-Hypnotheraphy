import { permanentRedirect } from "next/navigation";

// Old address: each class now lives at /reiki-training/<slug>.
export default async function OldClassPage({ params }: { params: Promise<{ slug: string }> }) {
  permanentRedirect(`/reiki-training/${encodeURIComponent((await params).slug)}`);
}
