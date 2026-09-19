import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

export interface UseSocketOptions {
  url: string;
  rooms?: string[];
  enabled?: boolean;
}

/**
 * Opens (or reuses) a Socket.IO connection and joins the given rooms.
 * Rooms are how the API scopes real-time pushes to one restaurant or
 * one customer, so a page only receives events relevant to it.
 */
export function useSocket({ url, rooms = [], enabled = true }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const roomsKey = rooms.join(",");

  useEffect(() => {
    if (!enabled) return;

    const socket = io(url, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    const onConnect = () => {
      setConnected(true);
      rooms.forEach((room) => socket.emit("join", room));
    };
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, roomsKey, enabled]);

  return { socket: socketRef, connected };
}
