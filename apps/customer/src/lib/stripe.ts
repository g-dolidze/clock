import { loadStripe, type Stripe } from "@stripe/stripe-js";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

export const stripeEnabled = Boolean(publishableKey);

let stripePromise: Promise<Stripe | null> | null = null;

// Loading Stripe.js is only attempted when a publishable key is actually
// configured — without one, checkout falls back to the mock payment flow
// (see apps/api's /v1/payments/intent) so the app works with zero Stripe
// setup.
export function getStripe(): Promise<Stripe | null> | null {
  if (!publishableKey) return null;
  if (!stripePromise) stripePromise = loadStripe(publishableKey);
  return stripePromise;
}
