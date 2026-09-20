import { useQuery } from "@tanstack/react-query";
import type { AvailabilityResponse, RestaurantDetailResponse, RestaurantListResponse } from "@ontime/web-shared";
import { api } from "../lib/api";

export function useRestaurants(params: { q?: string; cuisine?: string } = {}) {
  return useQuery({
    queryKey: ["restaurants", params],
    queryFn: () => api.get<RestaurantListResponse>("/v1/restaurants", params),
  });
}

export function useRestaurant(id: string | undefined) {
  return useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => api.get<RestaurantDetailResponse>(`/v1/restaurants/${id}`),
    enabled: Boolean(id),
  });
}

export function useAvailability(restaurantId: string | undefined, date: string, partySize: number) {
  return useQuery({
    queryKey: ["availability", restaurantId, date, partySize],
    queryFn: () =>
      api.get<AvailabilityResponse>(`/v1/restaurants/${restaurantId}/availability`, { date, partySize }),
    enabled: Boolean(restaurantId) && Boolean(date) && partySize > 0,
  });
}
