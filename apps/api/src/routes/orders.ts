import { Router } from "express";
import { nanoid } from "nanoid";
import { z } from "zod";
import type { Order, OrderLineItem, OrderStatus } from "@ontime/web-shared/server";
import { attachCustomer, requireAdminKey, requireCustomer, type AuthedRequest } from "../lib/auth";
import { menuForRestaurant, ordersForCustomer, store } from "../data/store";
import { emitOrderUpdate } from "../realtime";

export const ordersRouter = Router();

const createSchema = z.object({
  restaurantId: z.string(),
  fulfillmentType: z.enum(["pickup", "dine-in"]),
  items: z
    .array(
      z.object({
        menuItemId: z.string(),
        quantity: z.coerce.number().int().min(1).max(50),
      }),
    )
    .min(1),
  note: z.string().max(500).optional(),
});

ordersRouter.post("/orders", attachCustomer, requireCustomer, (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", message: parsed.error.issues[0]?.message ?? "Invalid body" });
    return;
  }
  const { restaurantId, fulfillmentType, items, note } = parsed.data;
  const restaurant = store.restaurants.get(restaurantId);
  if (!restaurant) {
    res.status(404).json({ error: "not_found", message: "Restaurant not found" });
    return;
  }

  const menu = menuForRestaurant(restaurantId);
  const lineItems: OrderLineItem[] = [];
  for (const requested of items) {
    const menuItem = menu.find((m) => m.id === requested.menuItemId);
    if (!menuItem) {
      res.status(400).json({ error: "invalid_request", message: `Unknown menu item ${requested.menuItemId}` });
      return;
    }
    if (!menuItem.available) {
      res.status(400).json({ error: "invalid_request", message: `${menuItem.name} is currently unavailable` });
      return;
    }
    lineItems.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      priceCents: menuItem.priceCents,
      quantity: requested.quantity,
    });
  }

  const totalCents = lineItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const now = new Date().toISOString();
  const order: Order = {
    id: `ord_${nanoid(10)}`,
    customerId: req.customer!.id,
    restaurantId,
    items: lineItems,
    fulfillmentType,
    status: "placed",
    totalCents,
    note,
    createdAt: now,
    updatedAt: now,
  };
  store.orders.set(order.id, order);
  emitOrderUpdate(order);

  res.status(201).json({ order });
});

ordersRouter.get("/orders", attachCustomer, requireCustomer, (req: AuthedRequest, res) => {
  res.json({ orders: ordersForCustomer(req.customer!.id) });
});

ordersRouter.get("/orders/:id", attachCustomer, requireCustomer, (req: AuthedRequest, res) => {
  const order = store.orders.get((req.params.id as string));
  if (!order || order.customerId !== req.customer!.id) {
    res.status(404).json({ error: "not_found", message: "Order not found" });
    return;
  }
  res.json({ order });
});

function applyOrderStatus(order: Order, status: OrderStatus): Order {
  const updated: Order = { ...order, status, updatedAt: new Date().toISOString() };
  store.orders.set(updated.id, updated);
  emitOrderUpdate(updated);
  return updated;
}

const statusSchema = z.object({
  status: z.enum(["placed", "confirmed", "preparing", "ready", "completed", "cancelled"]),
});

// Customers may only cancel, and only before the kitchen has started.
ordersRouter.patch("/orders/:id/status", attachCustomer, requireCustomer, (req: AuthedRequest, res) => {
  const order = store.orders.get((req.params.id as string));
  if (!order || order.customerId !== req.customer!.id) {
    res.status(404).json({ error: "not_found", message: "Order not found" });
    return;
  }
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success || parsed.data.status !== "cancelled" || order.status !== "placed") {
    res.status(400).json({ error: "invalid_request", message: "Order can only be cancelled while still 'placed'." });
    return;
  }
  res.json({ order: applyOrderStatus(order, "cancelled") });
});

// The restaurant dashboard drives the full kitchen lifecycle.
ordersRouter.patch("/restaurant/orders/:id/status", requireAdminKey, (req, res) => {
  const order = store.orders.get((req.params.id as string));
  if (!order) {
    res.status(404).json({ error: "not_found", message: "Order not found" });
    return;
  }
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", message: parsed.error.issues[0]?.message ?? "Invalid body" });
    return;
  }
  res.json({ order: applyOrderStatus(order, parsed.data.status) });
});
