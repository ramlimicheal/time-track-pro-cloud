import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={status === "rejected" ? "destructive" : "outline"}
    className={status === "approved" ? "bg-green-50 text-green-800" : status === "pending" ? "bg-amber-50 text-amber-900" : ""}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </Badge>;
}
