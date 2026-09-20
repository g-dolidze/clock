# ontime.ge

Restaurant discovery, ordering and reservation platform. Implemented per
[`ontime.ge Customer App - Technical Design Document.md`](./ontime.ge%20Customer%20App%20-%20Technical%20Design%20Document.md).

npm workspaces monorepo:

```
apps/customer      diner storefront (discovery, ordering, reservations)
apps/restaurant    restaurant business dashboard (orders, reservations, tables)
apps/admin         platform admin (restaurants overview, orders, reservations)
apps/api           backend: REST (/v1), Socket.IO real-time, in-memory data
packages/web-shared  shared types, API contract, UI components, hooks
```

## Quick start

```bash
npm install
npm run dev:api          # http://127.0.0.1:3000
npm run dev:customer     # http://127.0.0.1:5173
npm run dev:restaurant   # http://127.0.0.1:5174
npm run dev:admin        # http://127.0.0.1:5175
```

The three frontend dev servers proxy `/v1`, `/health` and `/socket.io` to the
API (see each app's `vite.config.ts` / `.env.example`). The restaurant and
admin dashboards are gated by a shared admin key — `dev-admin-key` by
default (`apps/api/.env.example`).

Checkout works out of the box with a mock payment flow. To use real Stripe
test-mode payments instead, set `STRIPE_SECRET_KEY` for `apps/api` and
`VITE_STRIPE_PUBLISHABLE_KEY` for `apps/customer`.

## Commands

```bash
npm run build   # type-check + build every app
npm run test    # vitest across every workspace
npm run lint    # eslint across every workspace
```

## Data

`apps/api` seeds three sample restaurants (with menus and tables) into an
in-memory store on boot — there's no database yet, so data resets on
restart. See the TDD's "Open Questions & Risks" for what's still unbuilt
(persistence, real staff/admin auth, CI/CD).
