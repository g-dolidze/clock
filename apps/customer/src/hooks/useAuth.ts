import { useMutation } from "@tanstack/react-query";
import type { LoginRequest, LoginResponse } from "@ontime/web-shared";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (body: LoginRequest) => api.post<LoginResponse>("/v1/auth/login", body),
    onSuccess: (data) => {
      setSession(data.token, data.customer);
    },
  });
}
