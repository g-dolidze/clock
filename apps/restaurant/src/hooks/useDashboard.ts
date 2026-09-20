import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  restaurantRoom,
  SOCKET_EVENTS,
  useSocket,
  type OrderListResponse,
  type OrderStatus,
  type ReservationListResponse,
  type ReservationStatus,
  type TableListResponse,
  type TableStatus,
} from "@ontime/web-shared";
import { api } from "../lib/api";
import { useSessionStore } from "../store/sessionStore";

export function useRestaurantOrders() {
  const restaurantId = useSessionStore((s) => s.restaurantId);
  return useQuery({
    queryKey: ["dashboard", "orders", restaurantId],
    queryFn: () => api.get<OrderListResponse>(`/v1/restaurant/${restaurantId}/orders`),
    enabled: Boolean(restaurantId),
  });
}

export function useRestaurantReservations() {
  const restaurantId = useSessionStore((s) => s.restaurantId);
  return useQuery({
    queryKey: ["dashboard", "reservations", restaurantId],
    queryFn: () => api.get<ReservationListResponse>(`/v1/restaurant/${restaurantId}/reservations`),
    enabled: Boolean(restaurantId),
  });
}

export function useRestaurantTables() {
  const restaurantId = useSessionStore((s) => s.restaurantId);
  return useQuery({
    queryKey: ["dashboard", "tables", restaurantId],
    queryFn: () => api.get<TableListResponse>(`/v1/restaurant/${restaurantId}/tables`),
    enabled: Boolean(restaurantId),
  });
}

export function useSetOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      api.patch(`/v1/restaurant/orders/${orderId}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard", "orders"] }),
  });
}

export function useSetReservationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reservationId, status }: { reservationId: string; status: ReservationStatus }) =>
      api.patch(`/v1/restaurant/reservations/${reservationId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "reservations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "tables"] });
    },
  });
}

export function useSetTableStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tableId, status }: { tableId: string; status: TableStatus }) =>
      api.patch(`/v1/restaurant/tables/${tableId}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard", "tables"] }),
  });
}

/**
 * Joins this restaurant's room and keeps every dashboard query in sync with
 * pushes from customers placing orders/reservations, or other staff acting
 * on them elsewhere.
 */
export function useDashboardRealtime() {
  const restaurantId = useSessionStore((s) => s.restaurantId);
  const queryClient = useQueryClient();
  const { socket, connected } = useSocket({
    url: window.location.origin,
    rooms: restaurantId ? [restaurantRoom(restaurantId)] : [],
    enabled: Boolean(restaurantId),
  });

  useEffect(() => {
    const current = socket.current;
    if (!current) return;

    const invalidate = (key: string) => () =>
      queryClient.invalidateQueries({ queryKey: ["dashboard", key] });
    const onOrder = invalidate("orders");
    const onReservation = () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "reservations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "tables"] });
    };
    const onTable = invalidate("tables");

    current.on(SOCKET_EVENTS.ORDER_UPDATE, onOrder);
    current.on(SOCKET_EVENTS.RESERVATION_UPDATE, onReservation);
    current.on(SOCKET_EVENTS.TABLE_UPDATE, onTable);
    return () => {
      current.off(SOCKET_EVENTS.ORDER_UPDATE, onOrder);
      current.off(SOCKET_EVENTS.RESERVATION_UPDATE, onReservation);
      current.off(SOCKET_EVENTS.TABLE_UPDATE, onTable);
    };
  }, [socket, queryClient]);

  return { connected };
}
