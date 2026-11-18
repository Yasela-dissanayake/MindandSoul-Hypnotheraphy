import { NotFoundContent } from "@/components/not-found-content";

// Shown inside the admin panel (keeps the admin menu), e.g. a deleted client or class.
export default function AdminNotFound() {
  return <NotFoundContent area="admin" />;
}
