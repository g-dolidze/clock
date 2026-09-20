import { Router } from "express";
import { nanoid } from "nanoid";
import { z } from "zod";
import type { Customer } from "@ontime/web-shared/server";
import { store } from "../data/store";
import { issueToken } from "../lib/auth";
import { attachCustomer, requireCustomer, type AuthedRequest } from "../lib/auth";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120).optional(),
});

// There's no password/OTP flow yet — the storefront just needs a stable
// identity to attach orders and reservations to. POST /v1/auth/login finds
// or creates a customer by email and hands back a bearer token.
authRouter.post("/auth/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", message: parsed.error.issues[0]?.message ?? "Invalid body" });
    return;
  }
  const { email, name } = parsed.data;

  let customer = [...store.customers.values()].find((c) => c.email === email);
  if (!customer) {
    customer = {
      id: `cus_${nanoid(10)}`,
      name: name ?? email.split("@")[0],
      email,
      createdAt: new Date().toISOString(),
    } satisfies Customer;
    store.customers.set(customer.id, customer);
  }

  const token = issueToken(customer.id);
  res.json({ token, customer });
});

authRouter.get("/auth/me", attachCustomer, requireCustomer, (req: AuthedRequest, res) => {
  res.json({ customer: req.customer });
});
