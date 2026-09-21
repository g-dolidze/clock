# @ontime/mobile

The ontime.ge diner storefront as a native iOS/Android app — Expo (React
Native) + Expo Router, TypeScript. Same feature set as `apps/customer`
(discovery, restaurant detail, order-ahead cart, reservations, order/
reservation live status, account) against the same `apps/api` backend.

## Running it

```bash
npm install                 # from the repo root
npm run dev:mobile          # or: cd apps/mobile && npx expo start
```

Then press `i` for the iOS Simulator, `a` for an Android emulator, or scan
the QR code with Expo Go on a physical device.

### Pointing at the API

The app needs `apps/api` running (`npm run dev:api` from the repo root, see
the root README) and needs to know where to reach it — unlike the web
apps, there's no dev-server proxy, so the API host must be reachable
directly from wherever the app is running:

| Target | Default `API_BASE_URL` |
| --- | --- |
| iOS Simulator | `http://127.0.0.1:3000` (works out of the box) |
| Android Emulator | `http://10.0.2.2:3000` (used automatically) |
| Physical device / Expo Go | your machine's LAN IP, e.g. `http://192.168.1.20:3000`, or a tunnel (ngrok, etc.) |

Override the default with an env var before starting Expo:

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.20:3000 npx expo start
```

(or set it in `app.json`'s `expo.extra.apiBaseUrl`, which `src/lib/config.ts`
falls back to).

## What's different from the web app

- **Checkout is mock-payment only.** `@stripe/stripe-react-native` needs
  native module linking (a custom Expo dev client, not plain Expo Go), so
  wiring it up is future work — see `src/components/PaymentPanel.tsx`. The
  order/payment/confirmation flow itself is otherwise identical to the web
  app's fallback mock flow.
- **No map view.** `apps/customer` shows restaurants on a Leaflet map;
  this app is list-only for now (a native map would need
  `react-native-maps` or `expo-maps`, both requiring a config plugin and a
  dev client build).
- **Reservation date picker is a 7-day chip row**, not a native date
  picker, to avoid another native-module dependency
  (`@react-native-community/datetimepicker`).
- Custom brand fonts (Archivo / Plus Jakarta Sans / IBM Plex Mono) aren't
  loaded — the app uses the system font. Add them with
  `@expo-google-fonts/*` + `expo-font` if wanted.

## Structure

```
app/                 Expo Router routes (file-based)
  (tabs)/            Discover + Account bottom tabs
  restaurant/[id]    Restaurant detail (menu/order-ahead + reserve)
  checkout, login, orders/[id], reservations/[id]
src/
  lib/               API client, config, date/hours/menu helpers
  store/             Zustand stores (auth, cart, realtime), AsyncStorage-backed
  hooks/             TanStack Query hooks + Socket.IO realtime hook
  components/        RN UI components (Button, Card, StatusBadge, ...)
  theme/             Shared color/spacing tokens
```

Shares its data model and API contract with the rest of the platform via
`@ontime/web-shared/server` (types + formatting helpers only — the
React-DOM component/hook entry point at `@ontime/web-shared` isn't usable
in React Native, so this app never imports it).
