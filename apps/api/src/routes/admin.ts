import { Router } from "express";
import { requireAdminKey } from "../lib/auth";
import { store } from "../data/store";

export const adminRouter = Router();

adminRouter.get("/admin/restaurants", requireAdminKey, (_req, res) => {
  const restaurants = [...store.restaurants.values()].map((restaurant) => {
    const orders = [...store.orders.values()].filter((o) => o.restaurantId === restaurant.id);
    const reservations = [...store.reservations.values()].filter((r) => r.restaurantId === restaurant.id);
    const tables = [...store.tables.values()].filter((t) => t.restaurantId === restaurant.id);
    return {
      restaurant,
      stats: {
        orderCount: orders.length,
        reservationCount: reservations.length,
        tableCount: tables.length,
        revenueCents: orders
          .filter((o) => o.status !== "cancelled")
          .reduce((sum, o) => sum + o.totalCents, 0),
      },
    };
  });
  res.json({ restaurants });
});

adminRouter.get("/admin/orders", requireAdminKey, (_req, res) => {
  const orders = [...store.orders.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ orders });
});

adminRouter.get("/admin/reservations", requireAdminKey, (_req, res) => {
  const reservations = [...store.reservations.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  res.json({ reservations });
});
