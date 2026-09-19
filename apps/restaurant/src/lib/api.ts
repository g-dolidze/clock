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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const adminKey = useSessionStore.getState().adminKey;
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (adminKey) headers.set("x-admin-key", adminKey);

  const res = await fetch(path, { ...options, headers });

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

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T,>(path: string) => request<T>(path),
  patch: <T,>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined }),
};
