/**
 * Standard API response shape used across the app.
 */
export type ApiError = {
  message: string;
  code?: string;
  details?: unknown;
};

export type ApiResponse<T> = { success: true; data: T } | { success: false; error: ApiError };

export function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function fail(message: string, code?: string, details?: unknown): ApiResponse<null> {
  return { success: false, error: { message, code, details } };
}

const api = { ok, fail };

export default api;
