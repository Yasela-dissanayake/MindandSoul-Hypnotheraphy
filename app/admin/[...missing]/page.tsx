import { notFound } from "next/navigation";

// Unknown addresses under /admin show the 404 page inside the admin layout (menu kept).
export default function Missing() {
  notFound();
}
