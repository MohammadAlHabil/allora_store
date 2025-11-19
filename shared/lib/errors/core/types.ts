import type { ErrorCode } from "./error-codes";

// Result Type - Used across all layers (Repository, Service, Action, API)
export type Result<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: ErrorDetails };

// Error Details Structure - Unified error format
export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  status: number;
  context?: string;
  fieldErrors?: Record<string, string>;
  details?: unknown;
  timestamp: string;
  requestId?: string;
}
