import { notFound } from "next/navigation";
import { isSessionArea } from "@/lib/session-areas";
import { SessionsView } from "../sessions-view";

export default async function SessionAreaPage({ params, searchParams }: { params: Promise<{ area: string }>; searchParams: Promise<{ session?: string }> }) {
  const { area } = await params;
  if (!isSessionArea(area)) notFound();
  return <SessionsView area={area} searchParams={searchParams} />;
}
