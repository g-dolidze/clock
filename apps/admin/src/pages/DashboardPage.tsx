import { useState } from "react";
import { Button, Card, EmptyState, Spinner, formatCents } from "@ontime/web-shared";
import { useAdminOrders, useAdminReservations, useAdminRestaurants } from "../hooks/useAdmin";
import { OrderStatusBadge, ReservationStatusBadge } from "../components/StatusBadge";
import { useSessionStore } from "../store/sessionStore";

type Tab = "restaurants" | "orders" | "reservations";

export function DashboardPage() {
  const [tab, setTab] = useState<Tab>("restaurants");
  const logout = useSessionStore((s) => s.logout);
  const restaurants = useAdminRestaurants();
  const orders = useAdminOrders();
  const reservations = useAdminReservations();

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Platform overview</h1>
        <Button variant="ghost" onClick={logout}>
          Sign out
        </Button>
      </div>

      <div className="flex gap-2 border-b border-white/10">
        {(["restaurants", "orders", "reservations"] as const).map((t) => (
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

      {tab === "restaurants" && (
        <div className="space-y-3">
          {restaurants.isLoading && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}
          {restaurants.data?.restaurants.length === 0 && <EmptyState title="No restaurants" />}
          {restaurants.data?.restaurants.map(({ restaurant, stats }) => (
            <Card key={restaurant.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <p className="font-semibold text-white">{restaurant.name}</p>
                <p className="text-xs text-white/50">{restaurant.address}</p>
              </div>
              <div className="flex gap-6 text-sm text-white/70">
                <div className="text-center">
                  <p className="font-mono-accent text-white">{stats.orderCount}</p>
                  <p className="text-xs text-white/40">orders</p>
                </div>
                <div className="text-center">
                  <p className="font-mono-accent text-white">{stats.reservationCount}</p>
                  <p className="text-xs text-white/40">reservations</p>
                </div>
                <div className="text-center">
                  <p className="font-mono-accent text-white">{stats.tableCount}</p>
                  <p className="text-xs text-white/40">tables</p>
                </div>
                <div className="text-center">
                  <p className="font-mono-accent text-white">{formatCents(stats.revenueCents)}</p>
                  <p className="text-xs text-white/40">revenue</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-3">
          {orders.isLoading && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}
          {orders.data?.orders.length === 0 && <EmptyState title="No orders yet" />}
          {orders.data?.orders.map((order) => (
            <Card key={order.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-mono-accent text-xs text-white/50">#{order.id.slice(-8)}</p>
                <p className="text-sm text-white/80">
                  {order.items.length} item(s) · {order.fulfillmentType}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono-accent text-sm text-white">{formatCents(order.totalCents)}</span>
                <OrderStatusBadge status={order.status} />
              </div>
            </Card>
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
          {reservations.data?.reservations.length === 0 && <EmptyState title="No reservations yet" />}
          {reservations.data?.reservations.map((reservation) => (
            <Card key={reservation.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-mono-accent text-xs text-white/50">#{reservation.id.slice(-8)}</p>
                <p className="text-sm text-white/80">
                  Party of {reservation.partySize} · {new Date(reservation.time).toLocaleString()}
                </p>
              </div>
              <ReservationStatusBadge status={reservation.status} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
