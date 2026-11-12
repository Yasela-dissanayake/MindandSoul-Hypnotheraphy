import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: "INVITED" | "ACTIVE" | "FINISHED" }) {
  if (status === "INVITED") return <Badge variant="outline" className="border-amber-300 text-amber-700">Not signed in yet</Badge>;
  if (status === "FINISHED") return <Badge variant="secondary">Finished</Badge>;
  return null;
}
