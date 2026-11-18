import { notFound } from "next/navigation";

// Unknown addresses under /portal show the 404 page inside the portal layout (menu kept).
export default function Missing() {
  notFound();
}
