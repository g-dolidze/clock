import { useQuery } from "@tanstack/react-query";
import type { Order, Reservation, Restaurant } from "@ontime/web-shared";
import { api } from "../lib/api";
import { useSessionStore } from "../store/sessionStore";

export interface RestaurantStats {
  orderCount: number;
  reservationCount: number;
  tableCount: number;
  revenueCents: number;
}

export interface AdminRestaurantsResponse {
  restaurants: Array<{ restaurant: Restaurant; stats: RestaurantStats }>;
}

export function useAdminRestaurants() {
  const enabled = Boolean(useSessionStore((s) => s.adminKey));
  return useQuery({
    queryKey: ["admin", "restaurants"],
    queryFn: () => api.get<AdminRestaurantsResponse>("/v1/admin/restaurants"),
    enabled,
    refetchInterval: 8_000,
  });
}

export function useAdminOrders() {
  const enabled = Boolean(useSessionStore((s) => s.adminKey));
  return useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => api.get<{ orders: Order[] }>("/v1/admin/orders"),
    enabled,
    refetchInterval: 8_000,
  });
}

export function useAdminReservations() {
  const enabled = Boolean(useSessionStore((s) => s.adminKey));
  return useQuery({
    queryKey: ["admin", "reservations"],
    queryFn: () => api.get<{ reservations: Reservation[] }>("/v1/admin/reservations"),
    enabled,
    refetchInterval: 8_000,
  });
}
