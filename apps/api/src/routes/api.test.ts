import { createServer } from "node:http";
import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { createRealtimeServer } from "../realtime";
import { seed } from "../data/seed";
import { store } from "../data/store";

const app = createApp();
// emitOrderUpdate/emitReservationUpdate/emitTableUpdate reach into the
// Socket.IO server created here; it never needs to actually listen on a
// port for that to work, but it does need to exist or those calls throw.
createRealtimeServer(createServer(app));

async function login(email = "diner@example.com") {
  const res = await request(app).post("/v1/auth/login").send({ email, name: "Diner" });
  return res.body as { token: string; customer: { id: string } };
}

beforeEach(() => {
  seed();
});

describe("health", () => {
  it("reports ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("restaurants", () => {
  it("lists seeded restaurants", async () => {
    const res = await request(app).get("/v1/restaurants");
    expect(res.status).toBe(200);
    expect(res.body.restaurants.length).toBeGreaterThan(0);
  });

  it("filters by search query", async () => {
    const res = await request(app).get("/v1/restaurants?q=Tbilisi");
    expect(res.status).toBe(200);
    expect(res.body.restaurants.every((r: { name: string }) => r.name.includes("Tbilisi"))).toBe(true);
  });

  it("returns menu and tables for a restaurant", async () => {
    const [restaurant] = [...store.restaurants.values()];
    const res = await request(app).get(`/v1/restaurants/${restaurant.id}`);
    expect(res.status).toBe(200);
    expect(res.body.menu.length).toBeGreaterThan(0);
    expect(res.body.tables.length).toBeGreaterThan(0);
  });

  it("returns availability slots", async () => {
    const [restaurant] = [...store.restaurants.values()];
    const date = new Date().toISOString().slice(0, 10);
    const res = await request(app).get(`/v1/restaurants/${restaurant.id}/availability?date=${date}&partySize=2`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.slots)).toBe(true);
  });
});

describe("auth", () => {
  it("creates a customer on first login and reuses it on the second", async () => {
    const first = await login("same@example.com");
    const second = await login("same@example.com");
    expect(first.customer.id).toBe(second.customer.id);
    expect(first.token).not.toBe(second.token);
  });

  it("rejects an invalid email", async () => {
    const res = await request(app).post("/v1/auth/login").send({ email: "nope" });
    expect(res.status).toBe(400);
  });
});

describe("orders", () => {
  it("requires auth", async () => {
    const res = await request(app).get("/v1/orders");
    expect(res.status).toBe(401);
  });

  it("places an order and progresses it through payment", async () => {
    const { token } = await login();
    const [restaurant] = [...store.restaurants.values()];
    const [menuItem] = [...store.menuItems.values()].filter((m) => m.restaurantId === restaurant.id);

    const createRes = await request(app)
      .post("/v1/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        restaurantId: restaurant.id,
        fulfillmentType: "pickup",
        items: [{ menuItemId: menuItem.id, quantity: 2 }],
      });
    expect(createRes.status).toBe(201);
    expect(createRes.body.order.totalCents).toBe(menuItem.priceCents * 2);
    expect(createRes.body.order.status).toBe("placed");

    const orderId = createRes.body.order.id as string;
    const intentRes = await request(app)
      .post("/v1/payments/intent")
      .set("Authorization", `Bearer ${token}`)
      .send({ orderId });
    expect(intentRes.status).toBe(201);
    expect(intentRes.body.payment.provider).toBe("mock");

    const confirmRes = await request(app)
      .post(`/v1/payments/${intentRes.body.payment.id}/confirm-mock`)
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.payment.status).toBe("succeeded");

    const getRes = await request(app)
      .get(`/v1/orders/${orderId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(getRes.body.order.status).toBe("confirmed");
  });

  it("lets the restaurant dashboard progress order status", async () => {
    const { token } = await login();
    const [restaurant] = [...store.restaurants.values()];
    const [menuItem] = [...store.menuItems.values()].filter((m) => m.restaurantId === restaurant.id);
    const createRes = await request(app)
      .post("/v1/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ restaurantId: restaurant.id, fulfillmentType: "dine-in", items: [{ menuItemId: menuItem.id, quantity: 1 }] });

    const orderId = createRes.body.order.id as string;
    const res = await request(app)
      .patch(`/v1/restaurant/orders/${orderId}/status`)
      .set("x-admin-key", "dev-admin-key")
      .send({ status: "preparing" });
    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe("preparing");
  });

  it("rejects the restaurant dashboard route without the admin key", async () => {
    const res = await request(app).patch("/v1/restaurant/orders/anything/status").send({ status: "preparing" });
    expect(res.status).toBe(401);
  });
});

describe("reservations", () => {
  it("books a table when one is free", async () => {
    const { token } = await login();
    const [restaurant] = [...store.restaurants.values()];
    const time = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post("/v1/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({ restaurantId: restaurant.id, partySize: 2, time });
    expect(res.status).toBe(201);
    expect(["confirmed", "pending"]).toContain(res.body.reservation.status);
  });

  it("lets a customer cancel their own reservation", async () => {
    const { token } = await login();
    const [restaurant] = [...store.restaurants.values()];
    const time = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();
    const createRes = await request(app)
      .post("/v1/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({ restaurantId: restaurant.id, partySize: 2, time });

    const id = createRes.body.reservation.id as string;
    const cancelRes = await request(app)
      .patch(`/v1/reservations/${id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "cancelled" });
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.reservation.status).toBe("cancelled");
  });
});
