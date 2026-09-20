// Request/response DTOs for the /v1 REST API. Shared so the customer,
// restaurant and admin apps all call the API with the same shapes.
import type {
  Customer,
  FulfillmentType,
  MenuItem,
  Order,
  Payment,
  Reservation,
  Restaurant,
  Table,
} from "./index";

export interface ApiError {
  error: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  name?: string;
}

export interface LoginResponse {
  token: string;
  customer: Customer;
}

export interface MeResponse {
  customer: Customer;
}

export interface RestaurantListQuery {
  q?: string;
  cuisine?: string;
  openNow?: boolean;
}

export interface RestaurantListResponse {
  restaurants: Restaurant[];
}

export interface RestaurantDetailResponse {
  restaurant: Restaurant;
  menu: MenuItem[];
  tables: Table[];
}

export interface AvailabilitySlot {
  time: string; // ISO
  available: boolean;
}

export interface AvailabilityResponse {
  date: string; // yyyy-MM-dd
  partySize: number;
  slots: AvailabilitySlot[];
}

export interface CreateReservationRequest {
  restaurantId: string;
  partySize: number;
  time: string; // ISO
  note?: string;
}

export interface ReservationResponse {
  reservation: Reservation;
}

export interface ReservationListResponse {
  reservations: Reservation[];
}

export interface CreateOrderItemInput {
  menuItemId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  restaurantId: string;
  items: CreateOrderItemInput[];
  fulfillmentType: FulfillmentType;
  note?: string;
}

export interface OrderResponse {
  order: Order;
}

export interface OrderListResponse {
  orders: Order[];
}

export interface CreatePaymentIntentRequest {
  orderId: string;
}

export interface CreatePaymentIntentResponse {
  payment: Payment;
}

export interface ConfirmMockPaymentRequest {
  paymentId: string;
}

export interface UpdateTableStatusRequest {
  status: Table["status"];
}

export interface TableListResponse {
  tables: Table[];
}
