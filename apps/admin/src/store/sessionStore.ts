import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SessionState {
  adminKey: string | null;
  setAdminKey: (key: string) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      adminKey: null,
      setAdminKey: (adminKey) => set({ adminKey }),
      logout: () => set({ adminKey: null }),
    }),
    { name: "ontime-admin-session" },
  ),
);
