import type { Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import {
  customerRoom,
  restaurantRoom,
  SOCKET_EVENTS,
  type Order,
  type Reservation,
  type Table,
} from "@ontime/web-shared/server";
import { env } from "./env";

let io: SocketIOServer | undefined;

export function createRealtimeServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: { origin: env.corsOrigin },
  });

  io.on("connection", (socket) => {
    socket.on("join", (room: unknown) => {
      if (typeof room === "string" && room.length < 200) {
        socket.join(room);
      }
    });
    socket.on("leave", (room: unknown) => {
      if (typeof room === "string") {
        socket.leave(room);
      }
    });
  });

  return io;
}

function requireIo(): SocketIOServer {
  if (!io) throw new Error("Realtime server not initialized yet");
  return io;
}

export function emitOrderUpdate(order: Order) {
  const payload = { type: SOCKET_EVENTS.ORDER_UPDATE, order } as const;
  requireIo().to(restaurantRoom(order.restaurantId)).emit(SOCKET_EVENTS.ORDER_UPDATE, payload);
  requireIo().to(customerRoom(order.customerId)).emit(SOCKET_EVENTS.ORDER_UPDATE, payload);
}

export function emitTableUpdate(table: Table) {
  const payload = { type: SOCKET_EVENTS.TABLE_UPDATE, table } as const;
  requireIo().to(restaurantRoom(table.restaurantId)).emit(SOCKET_EVENTS.TABLE_UPDATE, payload);
}

export function emitReservationUpdate(reservation: Reservation) {
  const payload = { type: SOCKET_EVENTS.RESERVATION_UPDATE, reservation } as const;
  requireIo()
    .to(restaurantRoom(reservation.restaurantId))
    .emit(SOCKET_EVENTS.RESERVATION_UPDATE, payload);
  requireIo().to(customerRoom(reservation.customerId)).emit(SOCKET_EVENTS.RESERVATION_UPDATE, payload);
}
