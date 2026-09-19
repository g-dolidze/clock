import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateReservationRequest,
  ReservationListResponse,
  ReservationResponse,
} from "@ontime/web-shared";
import { api } from "../lib/api";

export function useMyReservations() {
  return useQuery({
    queryKey: ["reservations", "mine"],
    queryFn: () => api.get<ReservationListResponse>("/v1/reservations"),
  });
}

export function useReservation(id: string | undefined) {
  return useQuery({
    queryKey: ["reservation", id],
    queryFn: () => api.get<ReservationResponse>(`/v1/reservations/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateReservationRequest) => api.post<ReservationResponse>("/v1/reservations", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations", "mine"] });
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<ReservationResponse>(`/v1/reservations/${id}/status`, { status: "cancelled" }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["reservations", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["reservation", id] });
    },
  });
}
