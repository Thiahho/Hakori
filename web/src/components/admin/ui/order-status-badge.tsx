import { Badge } from "./badge";
import { ORDER_STATUS_LABELS as LABELS } from "@/lib/admin/orders";

const TONES: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  Created: "neutral",
  PendingPayment: "warning",
  Paid: "success",
  Cancelled: "danger",
  Expired: "danger",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return <Badge tone={TONES[status] ?? "neutral"}>{LABELS[status] ?? status}</Badge>;
}
