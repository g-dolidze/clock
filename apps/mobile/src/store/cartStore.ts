import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { FulfillmentType } from "@ontime/web-shared/server";

export interface CartLine {
  menuItemId: string;
  name: string;
  priceCents: number;
  quantity: number;
}

interface CartState {
  restaurantId: string | null;
  fulfillmentType: FulfillmentType;
  lines: CartLine[];
  addItem: (restaurantId: string, item: Omit<CartLine, "quantity">) => void;
  removeItem: (menuItemId: string) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  setFulfillmentType: (type: FulfillmentType) => void;
  clear: () => void;
}

// Only one restaurant's cart at a time — adding an item from a different
// restaurant replaces whatever was there (same rule as apps/customer).
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      fulfillmentType: "pickup",
      lines: [],

      addItem: (restaurantId, item) => {
        const state = get();
        if (state.restaurantId && state.restaurantId !== restaurantId) {
          set({ restaurantId, lines: [{ ...item, quantity: 1 }] });
          return;
        }
        const existing = state.lines.find((l) => l.menuItemId === item.menuItemId);
        set({
          restaurantId,
          lines: existing
            ? state.lines.map((l) =>
                l.menuItemId === item.menuItemId ? { ...l, quantity: l.quantity + 1 } : l,
              )
            : [...state.lines, { ...item, quantity: 1 }],
        });
      },

      removeItem: (menuItemId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.menuItemId !== menuItemId) })),

      setQuantity: (menuItemId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.menuItemId !== menuItemId)
              : state.lines.map((l) => (l.menuItemId === menuItemId ? { ...l, quantity } : l)),
        })),

      setFulfillmentType: (fulfillmentType) => set({ fulfillmentType }),

      clear: () => set({ restaurantId: null, lines: [] }),
    }),
    {
      name: "ontime-cart",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function cartTotalCents(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
}
