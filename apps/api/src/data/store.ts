import type {
  Customer,
  MenuItem,
  Order,
  Payment,
  Reservation,
  Restaurant,
  Table,
} from "@ontime/web-shared/server";

// A single in-memory store, shared by every route module. This stands in
// for a real database — the platform has no persistence layer yet, so a
// process restart resets to the seed data. Swapping this for Postgres/Prisma
// later only touches this file and the seed script.
export const store = {
  customers: new Map<string, Customer>(),
  tokens: new Map<string, string>(), // token -> customerId
  restaurants: new Map<string, Restaurant>(),
  menuItems: new Map<string, MenuItem>(),
  tables: new Map<string, Table>(),
  orders: new Map<string, Order>(),
  reservations: new Map<string, Reservation>(),
  payments: new Map<string, Payment>(),
};

export function menuForRestaurant(restaurantId: string): MenuItem[] {
  return [...store.menuItems.values()].filter((m) => m.restaurantId === restaurantId);
}

export function tablesForRestaurant(restaurantId: string): Table[] {
  return [...store.tables.values()].filter((t) => t.restaurantId === restaurantId);
}

export function ordersForCustomer(customerId: string): Order[] {
  return [...store.orders.values()]
    .filter((o) => o.customerId === customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function reservationsForCustomer(customerId: string): Reservation[] {
  return [...store.reservations.values()]
    .filter((r) => r.customerId === customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function ordersForRestaurant(restaurantId: string): Order[] {
  return [...store.orders.values()]
    .filter((o) => o.restaurantId === restaurantId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function reservationsForRestaurant(restaurantId: string): Reservation[] {
  return [...store.reservations.values()]
    .filter((r) => r.restaurantId === restaurantId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
