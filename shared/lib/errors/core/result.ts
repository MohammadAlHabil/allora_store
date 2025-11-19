import { ERROR_CODES } from "./error-codes";
import type { Result, ErrorDetails } from "./types";

// ═══════════════════════════════════════════════════════════════
// TYPE GUARDS
// ═══════════════════════════════════════════════════════════════

export function isOk<T>(result: Result<T>): result is { success: true; data: T; message?: string } {
  return result.success === true;
}

export function isErr<T>(result: Result<T>): result is { success: false; error: ErrorDetails } {
  return result.success === false;
}

// ═══════════════════════════════════════════════════════════════
// BUILDERS
// ═══════════════════════════════════════════════════════════════

// Create success result
export function ok<T>(data: T, message?: string): Result<T> {
  return { success: true, data, message };
}

// Create failure result
export function fail(error: ErrorDetails): Result<never> {
  return { success: false, error };
}

// Create validation failure with field errors
export function failValidation(
  fieldErrors: Record<string, string>,
  message = "Validation failed"
): Result<never> {
  return fail({
    code: ERROR_CODES.VALIDATION_ERROR,
    message,
    status: 422,
    fieldErrors,
    timestamp: new Date().toISOString(),
  });
}

// ═══════════════════════════════════════════════════════════════
// EXTRACTORS
// ═══════════════════════════════════════════════════════════════

// Extract data or throw error
export function unwrap<T>(result: Result<T>): T {
  if (isErr(result)) {
    throw new Error(result.error.message);
  }
  return result.data!;
}

// Extract data or return default value
export function unwrapOr<T>(result: Result<T>, defaultValue: T): T {
  return isOk(result) ? result.data : defaultValue;
}

// Map data if success
export function map<T, U>(result: Result<T>, fn: (data: T) => U): Result<U> {
  if (isOk(result)) {
    return ok(fn(result.data), result.message);
  }
  return result as unknown as Result<U>;
}

// Flat map data if success
export function flatMap<T, U>(result: Result<T>, fn: (data: T) => Result<U>): Result<U> {
  if (isOk(result)) {
    return fn(result.data);
  }
  return result as unknown as Result<U>;
}
