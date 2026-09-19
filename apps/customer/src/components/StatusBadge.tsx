import { Badge, type BadgeTone } from "@ontime/web-shared";
import type { OrderStatus, ReservationStatus } from "@ontime/web-shared";

const ORDER_TONE: Record<OrderStatus, BadgeTone> = {
  placed: "info",
  confirmed: "info",
  preparing: "warning",
  ready: "success",
  completed: "neutral",
  cancelled: "danger",
};

const RESERVATION_TONE: Record<ReservationStatus, BadgeTone> = {
  pending: "warning",
  confirmed: "info",
  seated: "success",
  completed: "neutral",
  cancelled: "danger",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={ORDER_TONE[status]}>{status}</Badge>;
}

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  return <Badge tone={RESERVATION_TONE[status]}>{status}</Badge>;
}
