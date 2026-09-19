import { Router } from "express";
import { nanoid } from "nanoid";
import { z } from "zod";
import type { Payment } from "@ontime/web-shared/server";
import { attachCustomer, requireCustomer, type AuthedRequest } from "../lib/auth";
import { store } from "../data/store";
import { emitOrderUpdate } from "../realtime";
import { paymentsUseRealStripe, stripe } from "../lib/stripe";

export const paymentsRouter = Router();

const intentSchema = z.object({ orderId: z.string() });

// Creates a Payment for an order. When STRIPE_SECRET_KEY is configured this
// opens a real Stripe PaymentIntent (test mode) that the customer app
// confirms client-side with Stripe Elements. Without a key, we fall back to
// a "mock" payment the customer app confirms with a plain button, so
// checkout works end-to-end in local/dev environments with no Stripe
// account at all.
paymentsRouter.post("/payments/intent", attachCustomer, requireCustomer, async (req: AuthedRequest, res) => {
  const parsed = intentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", message: "orderId is required" });
    return;
  }
  const order = store.orders.get(parsed.data.orderId);
  if (!order || order.customerId !== req.customer!.id) {
    res.status(404).json({ error: "not_found", message: "Order not found" });
    return;
  }

  const existing = [...store.payments.values()].find(
    (p) => p.orderId === order.id && p.status === "requires_payment",
  );
  if (existing) {
    res.status(201).json({ payment: existing });
    return;
  }

  let payment: Payment;
  if (paymentsUseRealStripe && stripe) {
    const intent = await stripe.paymentIntents.create({
      amount: order.totalCents,
      currency: "usd",
      metadata: { orderId: order.id, customerId: order.customerId },
      automatic_payment_methods: { enabled: true },
    });
    payment = {
      id: `pay_${nanoid(10)}`,
      orderId: order.id,
      provider: "stripe",
      amountCents: order.totalCents,
      status: "requires_payment",
      stripePaymentIntentId: intent.id,
      clientSecret: intent.client_secret ?? undefined,
      createdAt: new Date().toISOString(),
    };
  } else {
    payment = {
      id: `pay_${nanoid(10)}`,
      orderId: order.id,
      provider: "mock",
      amountCents: order.totalCents,
      status: "requires_payment",
      clientSecret: `mock_secret_${nanoid(16)}`,
      createdAt: new Date().toISOString(),
    };
  }

  store.payments.set(payment.id, payment);
  store.orders.set(order.id, { ...order, paymentId: payment.id });
  res.status(201).json({ payment });
});

// Confirms a mock payment (no real Stripe account configured). Real Stripe
// payments are confirmed client-side by Stripe.js; the webhook route below
// is where a real integration would learn the outcome server-side.
paymentsRouter.post("/payments/:id/confirm-mock", attachCustomer, requireCustomer, (req: AuthedRequest, res) => {
  const payment = store.payments.get((req.params.id as string));
  if (!payment || payment.provider !== "mock") {
    res.status(404).json({ error: "not_found", message: "Mock payment not found" });
    return;
  }
  const order = store.orders.get(payment.orderId);
  if (!order || order.customerId !== req.customer!.id) {
    res.status(404).json({ error: "not_found", message: "Order not found" });
    return;
  }

  const updatedPayment: Payment = { ...payment, status: "succeeded" };
  store.payments.set(updatedPayment.id, updatedPayment);

  const updatedOrder = { ...order, status: "confirmed" as const, updatedAt: new Date().toISOString() };
  store.orders.set(updatedOrder.id, updatedOrder);
  emitOrderUpdate(updatedOrder);

  res.json({ payment: updatedPayment });
});

// Stripe calls this when a real PaymentIntent settles. Left unauthenticated
// per Stripe's own model (signature verification would replace this check
// once STRIPE_WEBHOOK_SECRET is configured for a deployed instance).
paymentsRouter.post("/payments/webhook", (req, res) => {
  const event = req.body as { type?: string; data?: { object?: { id?: string; metadata?: Record<string, string> } } };
  if (event?.type === "payment_intent.succeeded") {
    const intentId = event.data?.object?.id;
    const payment = [...store.payments.values()].find((p) => p.stripePaymentIntentId === intentId);
    if (payment) {
      store.payments.set(payment.id, { ...payment, status: "succeeded" });
      const order = store.orders.get(payment.orderId);
      if (order) {
        const updatedOrder = { ...order, status: "confirmed" as const, updatedAt: new Date().toISOString() };
        store.orders.set(updatedOrder.id, updatedOrder);
        emitOrderUpdate(updatedOrder);
      }
    }
  }
  res.json({ received: true });
});
