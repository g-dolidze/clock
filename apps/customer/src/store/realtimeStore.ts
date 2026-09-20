import { create } from "zustand";

interface RealtimeState {
  connected: boolean;
  setConnected: (connected: boolean) => void;
}

// Only the app-level useCustomerRealtime() call (mounted once, in the
// Layout) owns the actual socket. Pages read this store instead of opening
// a second connection just to show a "Live" indicator.
export const useRealtimeStore = create<RealtimeState>((set) => ({
  connected: false,
  setConnected: (connected) => set({ connected }),
}));
