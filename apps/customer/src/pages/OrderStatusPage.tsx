import { useParams } from "react-router-dom";
import { Wifi, WifiOff } from "lucide-react";
import { Button, Card, EmptyState, Spinner, formatCents, type OrderStatus } from "@ontime/web-shared";
import { useCancelOrder, useOrder } from "../hooks/useOrders";
import { OrderStatusBadge } from "../components/StatusBadge";
import { useRealtimeStore } from "../store/realtimeStore";

const STEPS: OrderStatus[] = ["placed", "confirmed", "preparing", "ready", "completed"];

export function OrderStatusPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useOrder(id);
  const cancelOrder = useCancelOrder();
  const connected = useRealtimeStore((s) => s.connected);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }
  if (isError || !data) {
    return <EmptyState title="Order not found" />;
  }

  const { order } = data;
  const stepIndex = STEPS.indexOf(order.status);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Order status</h1>
        <span className="flex items-center gap-1 text-xs text-white/40">
          {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {connected ? "Live" : "Reconnecting…"}
        </span>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <OrderStatusBadge status={order.status} />
          <span className="font-mono-accent text-xs text-white/50">#{order.id.slice(-8)}</span>
        </div>

        {order.status === "cancelled" ? (
          <p className="text-sm text-red-400">This order was cancelled.</p>
        ) : (
          <ol className="flex items-center gap-1">
            {STEPS.map((step, i) => (
              <li key={step} className="flex flex-1 items-center gap-1">
                <span
                  className={`h-2 flex-1 rounded-full ${i <= stepIndex ? "bg-[#e3572c]" : "bg-white/10"}`}
                  aria-hidden
                />
              </li>
            ))}
          </ol>
        )}
        <p className="mt-2 text-xs capitalize text-white/50">
          {order.fulfillmentType === "dine-in" ? "Dine-in" : "Pickup"} order
        </p>

        <ul className="mt-4 space-y-1 border-t border-white/10 pt-4 text-sm">
          {order.items.map((item) => (
            <li key={item.menuItemId} className="flex justify-between text-white/80">
              <span>
                {item.quantity}× {item.name}
              </span>
              <span className="font-mono-accent">{formatCents(item.priceCents * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-sm font-semibold text-white">
          <span>Total</span>
          <span className="font-mono-accent">{formatCents(order.totalCents)}</span>
        </div>
      </Card>

      {order.status === "placed" && (
        <Button
          variant="danger"
          loading={cancelOrder.isPending}
          onClick={() => order && cancelOrder.mutate(order.id)}
        >
          Cancel order
        </Button>
      )}
    </div>
  );
}
