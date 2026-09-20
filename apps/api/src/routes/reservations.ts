import { Router } from "express";
import { nanoid } from "nanoid";
import { z } from "zod";
import type { Reservation, ReservationStatus } from "@ontime/web-shared/server";
import { attachCustomer, requireAdminKey, requireCustomer, type AuthedRequest } from "../lib/auth";
import { pickTableForReservation } from "../lib/availability";
import { reservationsForCustomer, reservationsForRestaurant, store, tablesForRestaurant } from "../data/store";
import { emitReservationUpdate, emitTableUpdate } from "../realtime";

export const reservationsRouter = Router();

const createSchema = z.object({
  restaurantId: z.string(),
  partySize: z.coerce.number().int().min(1).max(20),
  time: z.string().refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "time must be a valid ISO 8601 date string",
  }),
  note: z.string().max(500).optional(),
});

reservationsRouter.post("/reservations", attachCustomer, requireCustomer, (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", message: parsed.error.issues[0]?.message ?? "Invalid body" });
    return;
  }
  const { restaurantId, partySize, time, note } = parsed.data;
  const restaurant = store.restaurants.get(restaurantId);
  if (!restaurant) {
    res.status(404).json({ error: "not_found", message: "Restaurant not found" });
    return;
  }

  const tables = tablesForRestaurant(restaurantId);
  const existing = reservationsForRestaurant(restaurantId);
  const table = pickTableForReservation(tables, existing, partySize, time);

  const now = new Date().toISOString();
  const reservation: Reservation = {
    id: `rsv_${nanoid(10)}`,
    customerId: req.customer!.id,
    restaurantId,
    tableId: table?.id,
    partySize,
    time,
    status: table ? "confirmed" : "pending",
    note,
    createdAt: now,
    updatedAt: now,
  };
  store.reservations.set(reservation.id, reservation);

  if (table) {
    const updatedTable = { ...table, status: "reserved" as const };
    store.tables.set(table.id, updatedTable);
    emitTableUpdate(updatedTable);
  }

  emitReservationUpdate(reservation);
  res.status(201).json({ reservation });
});

reservationsRouter.get("/reservations", attachCustomer, requireCustomer, (req: AuthedRequest, res) => {
  res.json({ reservations: reservationsForCustomer(req.customer!.id) });
});

reservationsRouter.get("/reservations/:id", attachCustomer, requireCustomer, (req: AuthedRequest, res) => {
  const reservation = store.reservations.get((req.params.id as string));
  if (!reservation || reservation.customerId !== req.customer!.id) {
    res.status(404).json({ error: "not_found", message: "Reservation not found" });
    return;
  }
  res.json({ reservation });
});

const CUSTOMER_ALLOWED_TRANSITIONS = new Set<ReservationStatus>(["cancelled"]);

const statusSchema = z.object({
  status: z.enum(["pending", "confirmed", "seated", "completed", "cancelled"]),
});

function applyReservationStatus(reservation: Reservation, status: ReservationStatus): Reservation {
  const updated: Reservation = { ...reservation, status, updatedAt: new Date().toISOString() };
  store.reservations.set(updated.id, updated);
  emitReservationUpdate(updated);

  if (updated.tableId && (status === "cancelled" || status === "completed")) {
    const table = store.tables.get(updated.tableId);
    if (table && table.status !== "free") {
      const freedTable = { ...table, status: "free" as const };
      store.tables.set(table.id, freedTable);
      emitTableUpdate(freedTable);
    }
  }
  if (updated.tableId && status === "seated") {
    const table = store.tables.get(updated.tableId);
    if (table) {
      const occupiedTable = { ...table, status: "occupied" as const };
      store.tables.set(table.id, occupiedTable);
      emitTableUpdate(occupiedTable);
    }
  }
  return updated;
}

// Customers can cancel their own reservation.
reservationsRouter.patch(
  "/reservations/:id/status",
  attachCustomer,
  requireCustomer,
  (req: AuthedRequest, res) => {
    const reservation = store.reservations.get((req.params.id as string));
    if (!reservation || reservation.customerId !== req.customer!.id) {
      res.status(404).json({ error: "not_found", message: "Reservation not found" });
      return;
    }
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success || !CUSTOMER_ALLOWED_TRANSITIONS.has(parsed.data.status)) {
      res.status(400).json({ error: "invalid_request", message: "Customers may only cancel a reservation." });
      return;
    }
    res.json({ reservation: applyReservationStatus(reservation, parsed.data.status) });
  },
);

// The restaurant dashboard drives the full status lifecycle.
reservationsRouter.patch("/restaurant/reservations/:id/status", requireAdminKey, (req, res) => {
  const reservation = store.reservations.get((req.params.id as string));
  if (!reservation) {
    res.status(404).json({ error: "not_found", message: "Reservation not found" });
    return;
  }
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", message: parsed.error.issues[0]?.message ?? "Invalid body" });
    return;
  }
  res.json({ reservation: applyReservationStatus(reservation, parsed.data.status) });
});
