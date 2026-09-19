import { Router } from "express";
import { z } from "zod";
import { menuForRestaurant, reservationsForRestaurant, store, tablesForRestaurant } from "../data/store";
import { buildAvailability } from "../lib/availability";

export const restaurantsRouter = Router();

restaurantsRouter.get("/restaurants", (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.toLowerCase() : undefined;
  const cuisine = typeof req.query.cuisine === "string" ? req.query.cuisine.toLowerCase() : undefined;

  let restaurants = [...store.restaurants.values()];
  if (q) {
    restaurants = restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.cuisine.some((c) => c.toLowerCase().includes(q)),
    );
  }
  if (cuisine) {
    restaurants = restaurants.filter((r) => r.cuisine.some((c) => c.toLowerCase() === cuisine));
  }

  res.json({ restaurants });
});

restaurantsRouter.get("/restaurants/:id", (req, res) => {
  const restaurant = store.restaurants.get((req.params.id as string));
  if (!restaurant) {
    res.status(404).json({ error: "not_found", message: "Restaurant not found" });
    return;
  }
  res.json({
    restaurant,
    menu: menuForRestaurant(restaurant.id),
    tables: tablesForRestaurant(restaurant.id),
  });
});

const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  partySize: z.coerce.number().int().min(1).max(20),
});

restaurantsRouter.get("/restaurants/:id/availability", (req, res) => {
  const restaurant = store.restaurants.get((req.params.id as string));
  if (!restaurant) {
    res.status(404).json({ error: "not_found", message: "Restaurant not found" });
    return;
  }

  const parsed = availabilityQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", message: parsed.error.issues[0]?.message ?? "Invalid query" });
    return;
  }
  const { date, partySize } = parsed.data;

  const slots = buildAvailability(
    restaurant,
    tablesForRestaurant(restaurant.id),
    reservationsForRestaurant(restaurant.id),
    date,
    partySize,
  );

  res.json({ date, partySize, slots });
});
