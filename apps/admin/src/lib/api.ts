import type { ApiError } from "@ontime/web-shared";
import { useSessionStore } from "../store/sessionStore";

export class ApiRequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiRequestError";
  }
}

async function request<T>(path: string): Promise<T> {
  const adminKey = useSessionStore.getState().adminKey;
  const headers = new Headers({ "Content-Type": "application/json" });
  if (adminKey) headers.set("x-admin-key", adminKey);

  const res = await fetch(path, { headers });

  if (res.status === 401) {
    useSessionStore.getState().logout();
  }

  if (!res.ok) {
    let message = res.statusText || "Request failed";
    try {
      const body = (await res.json()) as ApiError;
      message = body.message ?? message;
    } catch {
      // not JSON — keep status text
    }
    throw new ApiRequestError(res.status, message);
  }

  return (await res.json()) as T;
}

export const api = { get: <T,>(path: string) => request<T>(path) };
