import { Router } from "express";
import { z } from "zod";
import { requireAdminKey } from "../lib/auth";
import { ordersForRestaurant, reservationsForRestaurant, store, tablesForRestaurant } from "../data/store";
import { emitTableUpdate } from "../realtime";

// Everything here is what apps/restaurant (the business dashboard) calls.
// It's gated by a shared x-admin-key header rather than customer auth —
// see the TDD's open question on auth; this is the simplest thing that
// keeps the dashboard endpoints out of the public customer surface until a
// real restaurant-staff login exists.
export const restaurantDashboardRouter = Router();

restaurantDashboardRouter.get("/restaurant/:restaurantId/orders", requireAdminKey, (req, res) => {
  const restaurant = store.restaurants.get((req.params.restaurantId as string));
  if (!restaurant) {
    res.status(404).json({ error: "not_found", message: "Restaurant not found" });
    return;
  }
  res.json({ orders: ordersForRestaurant(restaurant.id) });
});

restaurantDashboardRouter.get("/restaurant/:restaurantId/reservations", requireAdminKey, (req, res) => {
  const restaurant = store.restaurants.get((req.params.restaurantId as string));
  if (!restaurant) {
    res.status(404).json({ error: "not_found", message: "Restaurant not found" });
    return;
  }
  res.json({ reservations: reservationsForRestaurant(restaurant.id) });
});

restaurantDashboardRouter.get("/restaurant/:restaurantId/tables", requireAdminKey, (req, res) => {
  const restaurant = store.restaurants.get((req.params.restaurantId as string));
  if (!restaurant) {
    res.status(404).json({ error: "not_found", message: "Restaurant not found" });
    return;
  }
  res.json({ tables: tablesForRestaurant(restaurant.id) });
});

const tableStatusSchema = z.object({ status: z.enum(["free", "reserved", "occupied"]) });

restaurantDashboardRouter.patch("/restaurant/tables/:id/status", requireAdminKey, (req, res) => {
  const table = store.tables.get((req.params.id as string));
  if (!table) {
    res.status(404).json({ error: "not_found", message: "Table not found" });
    return;
  }
  const parsed = tableStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", message: "status is required" });
    return;
  }
  const updated = { ...table, status: parsed.data.status };
  store.tables.set(updated.id, updated);
  emitTableUpdate(updated);
  res.json({ table: updated });
});
