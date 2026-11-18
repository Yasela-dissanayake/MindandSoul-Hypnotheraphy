import { NotFoundContent } from "@/components/not-found-content";

// Shown inside the client portal (keeps the portal menu), e.g. a course the client hasn't bought.
export default function PortalNotFound() {
  return <NotFoundContent area="portal" />;
}
