import { useParams } from "react-router-dom";
import { Wifi, WifiOff } from "lucide-react";
import { Button, Card, EmptyState, Spinner } from "@ontime/web-shared";
import { useCancelReservation, useReservation } from "../hooks/useReservations";
import { useRestaurant } from "../hooks/useRestaurants";
import { ReservationStatusBadge } from "../components/StatusBadge";
import { useRealtimeStore } from "../store/realtimeStore";
import { formatSlotTime } from "../lib/date";

export function ReservationStatusPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useReservation(id);
  const cancelReservation = useCancelReservation();
  const connected = useRealtimeStore((s) => s.connected);
  const { data: restaurantData } = useRestaurant(data?.reservation.restaurantId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }
  if (isError || !data) {
    return <EmptyState title="Reservation not found" />;
  }

  const { reservation } = data;
  const restaurant = restaurantData?.restaurant;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Reservation</h1>
        <span className="flex items-center gap-1 text-xs text-white/40">
          {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {connected ? "Live" : "Reconnecting…"}
        </span>
      </div>

      <Card className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <ReservationStatusBadge status={reservation.status} />
          <span className="font-mono-accent text-xs text-white/50">#{reservation.id.slice(-8)}</span>
        </div>
        {restaurant && <p className="text-lg font-bold text-white">{restaurant.name}</p>}
        <p className="text-white/70">
          Party of {reservation.partySize} ·{" "}
          {restaurant ? formatSlotTime(reservation.time, restaurant.timezone) : reservation.time}
        </p>
        {reservation.status === "pending" && (
          <p className="text-sm text-amber-400">
            No table is free right now for that time — the restaurant will confirm as soon as one opens up.
          </p>
        )}
        {reservation.status === "seated" && (
          <p className="text-sm text-emerald-400">You're seated — enjoy your meal!</p>
        )}
        {reservation.note && <p className="text-sm text-white/50">Note: {reservation.note}</p>}
      </Card>

      {(reservation.status === "pending" || reservation.status === "confirmed") && (
        <Button
          variant="danger"
          loading={cancelReservation.isPending}
          onClick={() => cancelReservation.mutate(reservation.id)}
        >
          Cancel reservation
        </Button>
      )}
    </div>
  );
}
