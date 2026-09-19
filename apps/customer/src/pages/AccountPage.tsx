import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, EmptyState, Spinner, formatCents } from "@ontime/web-shared";
import { useMyOrders } from "../hooks/useOrders";
import { useMyReservations } from "../hooks/useReservations";
import { OrderStatusBadge, ReservationStatusBadge } from "../components/StatusBadge";
import { useAuthStore } from "../store/authStore";

type Tab = "orders" | "reservations";

export function AccountPage() {
  const [tab, setTab] = useState<Tab>("orders");
  const customer = useAuthStore((s) => s.customer);
  const logout = useAuthStore((s) => s.logout);
  const orders = useMyOrders();
  const reservations = useMyReservations();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Hi, {customer?.name}</h1>
          <p className="text-sm text-white/50">{customer?.email}</p>
        </div>
        <Button variant="ghost" onClick={logout}>
          Sign out
        </Button>
      </div>

      <div className="flex gap-2 border-b border-white/10">
        <button
          type="button"
          onClick={() => setTab("orders")}
          className={`px-4 py-2 text-sm font-semibold ${tab === "orders" ? "border-b-2 border-[#e3572c] text-white" : "text-white/50"}`}
        >
          Orders
        </button>
        <button
          type="button"
          onClick={() => setTab("reservations")}
          className={`px-4 py-2 text-sm font-semibold ${tab === "reservations" ? "border-b-2 border-[#e3572c] text-white" : "text-white/50"}`}
        >
          Reservations
        </button>
      </div>

      {tab === "orders" && (
        <div className="space-y-3">
          {orders.isLoading && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}
          {orders.data?.orders.length === 0 && (
            <EmptyState title="No orders yet" description="Order ahead from any restaurant page." />
          )}
          {orders.data?.orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`}>
              <Card className="flex items-center justify-between p-4 transition-colors hover:border-white/25">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {order.items.length} item(s) · {order.fulfillmentType}
                  </p>
                  <p className="text-xs text-white/50">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono-accent text-sm text-white/80">{formatCents(order.totalCents)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {tab === "reservations" && (
        <div className="space-y-3">
          {reservations.isLoading && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}
          {reservations.data?.reservations.length === 0 && (
            <EmptyState title="No reservations yet" description="Book a table from any restaurant page." />
          )}
          {reservations.data?.reservations.map((reservation) => (
            <Link key={reservation.id} to={`/reservations/${reservation.id}`}>
              <Card className="flex items-center justify-between p-4 transition-colors hover:border-white/25">
                <div>
                  <p className="text-sm font-semibold text-white">Party of {reservation.partySize}</p>
                  <p className="text-xs text-white/50">{new Date(reservation.time).toLocaleString()}</p>
                </div>
                <ReservationStatusBadge status={reservation.status} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
