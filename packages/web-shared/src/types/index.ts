// Domain types shared across apps/customer, apps/restaurant, apps/admin and apps/api.
// Keeping these in one place means the REST contract and the socket.io payloads
// can never drift between the frontends and the backend.

export type FulfillmentType = "pickup" | "dine-in";

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "seated"
  | "completed"
  | "cancelled";

export type TableStatus = "free" | "reserved" | "occupied";

export type PaymentStatus = "requires_payment" | "succeeded" | "failed";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface OpenHours {
  /** 0 = Sunday ... 6 = Saturday */
  day: number;
  open: string; // "11:00"
  close: string; // "22:00"
}

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  description: string;
  cuisine: string[];
  priceRange: 1 | 2 | 3 | 4;
  rating: number;
  address: string;
  location: GeoPoint;
  heroImageUrl: string;
  /** Gallery photos, cover image first. Capped at 10; may be empty. */
  imageUrls: string[];
  hours: OpenHours[];
  timezone: string;
}

export interface Table {
  id: string;
  restaurantId: string;
  label: string;
  capacity: number;
  status: TableStatus;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  category: string;
  priceCents: number;
  imageUrl?: string;
  available: boolean;
}

export interface OrderLineItem {
  menuItemId: string;
  name: string;
  priceCents: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  items: OrderLineItem[];
  fulfillmentType: FulfillmentType;
  status: OrderStatus;
  totalCents: number;
  paymentId?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  customerId: string;
  restaurantId: string;
  tableId?: string;
  partySize: number;
  time: string; // ISO 8601, restaurant-local instant
  status: ReservationStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  provider: "stripe" | "mock";
  amountCents: number;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  clientSecret?: string;
  createdAt: string;
}

// ---- Socket.IO real-time payloads ----

export interface OrderUpdateEvent {
  type: "order:update";
  order: Order;
}

export interface TableUpdateEvent {
  type: "table:update";
  table: Table;
}

export interface ReservationUpdateEvent {
  type: "reservation:update";
  reservation: Reservation;
}

export const SOCKET_EVENTS = {
  ORDER_UPDATE: "order:update",
  TABLE_UPDATE: "table:update",
  RESERVATION_UPDATE: "reservation:update",
} as const;

export function restaurantRoom(restaurantId: string): string {
  return `restaurant:${restaurantId}`;
}

export function customerRoom(customerId: string): string {
  return `customer:${customerId}`;
}
