import { nanoid } from "nanoid";
import type { NextFunction, Request, Response } from "express";
import type { Customer } from "@ontime/web-shared/server";
import { store } from "../data/store";
import { env } from "../env";

export function issueToken(customerId: string): string {
  const token = `tok_${nanoid(24)}`;
  store.tokens.set(token, customerId);
  return token;
}

export function customerFromToken(token: string | undefined): Customer | undefined {
  if (!token) return undefined;
  const customerId = store.tokens.get(token);
  if (!customerId) return undefined;
  return store.customers.get(customerId);
}

function bearerToken(req: Request): string | undefined {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) return undefined;
  return header.slice("Bearer ".length);
}

export interface AuthedRequest extends Request {
  customer?: Customer;
}

/** Attaches req.customer when a valid bearer token is present; never rejects. */
export function attachCustomer(req: AuthedRequest, _res: Response, next: NextFunction) {
  req.customer = customerFromToken(bearerToken(req));
  next();
}

/** Rejects the request unless a valid bearer token resolved to a customer. */
export function requireCustomer(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.customer) {
    res.status(401).json({ error: "unauthorized", message: "Sign in first." });
    return;
  }
  next();
}

/** Simple shared-secret gate for the restaurant/admin dashboards. */
export function requireAdminKey(req: Request, res: Response, next: NextFunction) {
  const key = req.header("x-admin-key");
  if (key !== env.adminKey) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid x-admin-key." });
    return;
  }
  next();
}
