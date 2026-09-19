import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import { Button, EmptyState, Spinner } from "@ontime/web-shared";
import type { Restaurant } from "@ontime/web-shared";
import { useAvailability } from "../hooks/useRestaurants";
import { useCreateReservation } from "../hooks/useReservations";
import { useAuthStore } from "../store/authStore";
import { todayInputValue, formatSlotTime } from "../lib/date";

export function ReservationBooker({ restaurant }: { restaurant: Restaurant }) {
  const navigate = useNavigate();
  const customer = useAuthStore((s) => s.customer);
  const [date, setDate] = useState(todayInputValue());
  const [partySize, setPartySize] = useState(2);
  const { data, isLoading } = useAvailability(restaurant.id, date, partySize);
  const createReservation = useCreateReservation();

  function bookSlot(time: string) {
    if (!customer) {
      navigate("/login", { state: { from: `/restaurants/${restaurant.id}` } });
      return;
    }
    createReservation.mutate(
      { restaurantId: restaurant.id, partySize, time },
      { onSuccess: (res) => navigate(`/reservations/${res.reservation.id}`) },
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="res-date" className="mb-1 block text-xs font-medium text-white/60">
            Date
          </label>
          <input
            id="res-date"
            type="date"
            min={todayInputValue()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#e3572c]"
          />
        </div>
        <div>
          <span className="mb-1 block text-xs font-medium text-white/60">Party size</span>
          <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5">
            <button
              type="button"
              aria-label="Decrease party size"
              onClick={() => setPartySize((n) => Math.max(1, n - 1))}
              className="rounded p-1 text-white/70 hover:bg-white/10"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-semibold text-white">{partySize}</span>
            <button
              type="button"
              aria-label="Increase party size"
              onClick={() => setPartySize((n) => Math.min(20, n + 1))}
              className="rounded p-1 text-white/70 hover:bg-white/10"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      {!isLoading && data && data.slots.every((s) => !s.available) && (
        <EmptyState title="No tables available" description="Try a different date or a smaller party." />
      )}

      {!isLoading && data && data.slots.some((s) => s.available) && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {data.slots
            .filter((slot) => slot.available)
            .map((slot) => (
              <Button
                key={slot.time}
                variant="secondary"
                disabled={createReservation.isPending}
                onClick={() => bookSlot(slot.time)}
                className="!rounded-lg font-mono-accent"
              >
                {formatSlotTime(slot.time, restaurant.timezone)}
              </Button>
            ))}
        </div>
      )}

      {createReservation.isError && (
        <p className="text-sm text-red-400">Couldn't book that slot — please try another.</p>
      )}
    </div>
  );
}
