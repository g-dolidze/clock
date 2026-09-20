import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Customer } from "@ontime/web-shared";

interface AuthState {
  token: string | null;
  customer: Customer | null;
  setSession: (token: string, customer: Customer) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      customer: null,
      setSession: (token, customer) => set({ token, customer }),
      logout: () => set({ token: null, customer: null }),
    }),
    { name: "ontime-auth" },
  ),
);
