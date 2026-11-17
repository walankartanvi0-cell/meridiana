/**
 * Small helper for talking to the Express API.
 * The browser only ever sees NEXT_PUBLIC_API_URL – never database or JWT secrets.
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

const TOKEN_KEY = "meridiana_token";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
}

type ApiFetchOptions = RequestInit & { skipAuth?: boolean };

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;
  const isFormData =
    typeof FormData !== "undefined" && fetchOptions.body instanceof FormData;
  const token = getToken();

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...fetchOptions,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(!skipAuth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...fetchOptions.headers,
      },
    });
  } catch {
    throw new ApiError("Unable to reach the server. Please check your connection and try again.", 0);
  }

  const payload: unknown = await response.json().catch(() => ({}));
  const message =
    payload && typeof payload === "object" && "message" in payload
      ? String((payload as { message: unknown }).message)
      : "Something went wrong. Please try again.";

  if (!response.ok) throw new ApiError(message, response.status);

  // Every successful API response is wrapped as { success, message, data }.
  // Unwrap `data` so callers can read the resource directly.
  if (payload && typeof payload === "object" && "data" in payload) {
    const envelope = payload as { data?: T };
    if (envelope.data !== undefined) return envelope.data;
  }

  return payload as T;
}
