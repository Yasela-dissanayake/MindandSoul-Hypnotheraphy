import { PageLoading } from "@/components/ui/spinner";

// Shown inside the portal (header and menu stay) while the next page loads.
export default function PortalLoading() {
  return <PageLoading />;
}
