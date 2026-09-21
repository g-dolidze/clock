import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreatePaymentIntentResponse } from "@ontime/web-shared/server";
import { api } from "../lib/api";

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (orderId: string) => api.post<CreatePaymentIntentResponse>("/v1/payments/intent", { orderId }),
  });
}

export function useConfirmMockPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) =>
      api.post<CreatePaymentIntentResponse>(`/v1/payments/${paymentId}/confirm-mock`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
