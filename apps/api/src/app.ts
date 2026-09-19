import express from "express";
import cors from "cors";
import { env } from "./env";
import { healthRouter } from "./routes/health";
import { authRouter } from "./routes/auth";
import { restaurantsRouter } from "./routes/restaurants";
import { reservationsRouter } from "./routes/reservations";
import { ordersRouter } from "./routes/orders";
import { paymentsRouter } from "./routes/payments";
import { restaurantDashboardRouter } from "./routes/restaurantDashboard";
import { adminRouter } from "./routes/admin";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  app.use(healthRouter);
  app.use(
    "/v1",
    authRouter,
    restaurantsRouter,
    reservationsRouter,
    ordersRouter,
    paymentsRouter,
    restaurantDashboardRouter,
    adminRouter,
  );

  app.use((_req, res) => {
    res.status(404).json({ error: "not_found", message: "No such route" });
  });

  // Express 5 forwards rejected async handlers here automatically.
  app.use(
    (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error(err);
      res.status(500).json({ error: "internal_error", message: "Something went wrong" });
    },
  );

  return app;
}
