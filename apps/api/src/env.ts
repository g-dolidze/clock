import "dotenv/config";

export const env = {
  port: Number(process.env.PORT ?? 3000),
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  adminKey: process.env.ADMIN_KEY ?? "dev-admin-key",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
};
