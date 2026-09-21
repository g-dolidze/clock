import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  customerRoom,
  SOCKET_EVENTS,
  type Order,
  type OrderResponse,
  type Reservation,
  type ReservationResponse,
} from "@ontime/web-shared/server";
import { useSocket } from "./useSocket";
import { API_BASE_URL } from "../lib/config";
import { useAuthStore } from "../store/authStore";
import { useRealtimeStore } from "../store/realtimeStore";

/**
 * Joins the signed-in customer's private room and keeps TanStack Query's
 * order/reservation caches in sync with server push — the "walk straight
 * to a seat/order that's ready" real-time layer from the TDD, same as
 * apps/customer but pointed at an absolute API host instead of same-origin.
 */
export function useCustomerRealtime() {
  const customerId = useAuthStore((s) => s.customer?.id);
  const queryClient = useQueryClient();
  const { socket, connected } = useSocket({
    url: API_BASE_URL,
    rooms: customerId ? [customerRoom(customerId)] : [],
    enabled: Boolean(customerId),
  });

  useEffect(() => {
    const current = socket.current;
    if (!current) return;

    const onOrderUpdate = (payload: { order: Order }) => {
      queryClient.setQueryData<OrderResponse>(["order", payload.order.id], { order: payload.order });
      queryClient.invalidateQueries({ queryKey: ["orders", "mine"] });
    };
    const onReservationUpdate = (payload: { reservation: Reservation }) => {
      queryClient.setQueryData<ReservationResponse>(["reservation", payload.reservation.id], {
        reservation: payload.reservation,
      });
      queryClient.invalidateQueries({ queryKey: ["reservations", "mine"] });
    };

    current.on(SOCKET_EVENTS.ORDER_UPDATE, onOrderUpdate);
    current.on(SOCKET_EVENTS.RESERVATION_UPDATE, onReservationUpdate);
    return () => {
      current.off(SOCKET_EVENTS.ORDER_UPDATE, onOrderUpdate);
      current.off(SOCKET_EVENTS.RESERVATION_UPDATE, onReservationUpdate);
    };
  }, [socket, queryClient]);

  const setConnected = useRealtimeStore((s) => s.setConnected);
  useEffect(() => {
    setConnected(connected);
  }, [connected, setConnected]);

  return { connected };
}
