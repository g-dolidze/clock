import { useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  Spinner,
  formatCents,
  type OrderStatus,
  type ReservationStatus,
  type TableStatus,
} from "@ontime/web-shared";
import { OrderStatusBadge, ReservationStatusBadge, TableStatusBadge } from "../components/StatusBadge";
import {
  useDashboardRealtime,
  useRestaurantOrders,
  useRestaurantReservations,
  useRestaurantTables,
  useSetOrderStatus,
  useSetReservationStatus,
  useSetTableStatus,
} from "../hooks/useDashboard";
import { useSessionStore } from "../store/sessionStore";

const ORDER_FLOW: Record<OrderStatus, OrderStatus | null> = {
  placed: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "completed",
  completed: null,
  cancelled: null,
};

const RESERVATION_FLOW: Record<ReservationStatus, ReservationStatus | null> = {
  pending: "confirmed",
  confirmed: "seated",
  seated: "completed",
  completed: null,
  cancelled: null,
};

const TABLE_STATUSES: TableStatus[] = ["free", "reserved", "occupied"];

type Tab = "orders" | "reservations" | "tables";

export function DashboardPage() {
  const [tab, setTab] = useState<Tab>("orders");
  const { restaurantName, logout } = useSessionStore();
  const { connected } = useDashboardRealtime();

  const orders = useRestaurantOrders();
  const reservations = useRestaurantReservations();
  const tables = useRestaurantTables();
  const setOrderStatus = useSetOrderStatus();
  const setReservationStatus = useSetReservationStatus();
  const setTableStatus = useSetTableStatus();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">{restaurantName}</h1>
          <span className="flex items-center gap-1 text-xs text-white/40">
            {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {connected ? "Live" : "Reconnecting…"}
          </span>
        </div>
        <Button variant="ghost" onClick={logout}>
          Switch restaurant
        </Button>
      </div>

      <div className="flex gap-2 border-b border-white/10">
        {(["orders", "reservations", "tables"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold capitalize ${tab === t ? "border-b-2 border-[#e3572c] text-white" : "text-white/50"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div className="space-y-3">
          {orders.isLoading && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}
          {orders.data?.orders.length === 0 && <EmptyState title="No orders yet" />}
          {orders.data?.orders.map((order) => {
            const next = ORDER_FLOW[order.status];
            return (
              <Card key={order.id} className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono-accent text-xs text-white/50">#{order.id.slice(-8)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-sm text-white/80">
                  {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs capitalize text-white/50">{order.fulfillmentType}</span>
                  <span className="font-mono-accent text-sm text-white">{formatCents(order.totalCents)}</span>
                </div>
                {next && (
                  <Button
                    variant="secondary"
                    className="w-full !py-1.5 text-xs capitalize"
                    loading={setOrderStatus.isPending}
                    onClick={() => setOrderStatus.mutate({ orderId: order.id, status: next })}
                  >
                    Mark {next}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {tab === "reservations" && (
        <div className="space-y-3">
          {reservations.isLoading && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}
          {reservations.data?.reservations.length === 0 && <EmptyState title="No reservations yet" />}
          {reservations.data?.reservations.map((reservation) => {
            const next = RESERVATION_FLOW[reservation.status];
            return (
              <Card key={reservation.id} className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono-accent text-xs text-white/50">#{reservation.id.slice(-8)}</span>
                  <ReservationStatusBadge status={reservation.status} />
                </div>
                <p className="text-sm text-white/80">
                  Party of {reservation.partySize} · {new Date(reservation.time).toLocaleString()}
                </p>
                {next && (
                  <Button
                    variant="secondary"
                    className="w-full !py-1.5 text-xs capitalize"
                    loading={setReservationStatus.isPending}
                    onClick={() => setReservationStatus.mutate({ reservationId: reservation.id, status: next })}
                  >
                    Mark {next}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {tab === "tables" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {tables.isLoading && (
            <div className="col-span-full flex justify-center py-10">
              <Spinner />
            </div>
          )}
          {tables.data?.tables.map((table) => (
            <Card key={table.id} className="space-y-2 p-4 text-center">
              <p className="text-lg font-bold text-white">{table.label}</p>
              <p className="text-xs text-white/50">Seats {table.capacity}</p>
              <TableStatusBadge status={table.status} />
              <div className="flex justify-center gap-1 pt-1">
                {TABLE_STATUSES.filter((s) => s !== table.status).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setTableStatus.mutate({ tableId: table.id, status })}
                    className="rounded-full border border-white/15 px-2 py-1 text-[10px] capitalize text-white/60 hover:border-white/40 hover:text-white"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
