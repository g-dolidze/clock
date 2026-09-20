import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SessionState {
  adminKey: string | null;
  restaurantId: string | null;
  restaurantName: string | null;
  setSession: (adminKey: string, restaurantId: string, restaurantName: string) => void;
  logout: () => void;
}

// There's no real staff-login system yet (see the TDD's open question on
// auth) — this dashboard is gated by the same shared x-admin-key the API
// expects, paired with a restaurant chosen from the public restaurant list.
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      adminKey: null,
      restaurantId: null,
      restaurantName: null,
      setSession: (adminKey, restaurantId, restaurantName) =>
        set({ adminKey, restaurantId, restaurantName }),
      logout: () => set({ adminKey: null, restaurantId: null, restaurantName: null }),
    }),
    { name: "ontime-restaurant-session" },
  ),
);
