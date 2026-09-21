import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateOrderRequest, OrderListResponse, OrderResponse } from "@ontime/web-shared/server";
import { api } from "../lib/api";

export function useMyOrders() {
  return useQuery({
    queryKey: ["orders", "mine"],
    queryFn: () => api.get<OrderListResponse>("/v1/orders"),
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => api.get<OrderResponse>(`/v1/orders/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOrderRequest) => api.post<OrderResponse>("/v1/orders", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", "mine"] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<OrderResponse>(`/v1/orders/${id}/status`, { status: "cancelled" }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["orders", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["order", id] });
    },
  });
}
