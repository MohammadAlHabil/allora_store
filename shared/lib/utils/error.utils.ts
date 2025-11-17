import type { ErrorCode, ErrorResponse } from "@/shared/types";
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  ERROR_STATUS_CODES,
  USER_FRIENDLY_MESSAGES,
} from "@/shared/types";
import { AppError } from "../AppError";

// ==========================================
// TYPE GUARDS
// ==========================================

/**
 * Check if error is AppError instance
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Check if error is operational (expected/handled)
 */
export function isOperationalError(error: unknown): boolean {
  return isAppError(error) && error.isOperational;
}

/**
 * Check if error is programming error (unexpected)
 */
export function isProgrammingError(error: unknown): boolean {
  return isAppError(error) && !error.isOperational;
}

/**
 * Check if error is specific error code
 */
export function isErrorCode(error: unknown, code: ErrorCode): boolean {
  return isAppError(error) && error.code === code;
}

/**
 * Check if error is authentication related
 */
export function isAuthError(error: unknown): boolean {
  if (!isAppError(error)) return false;

  const authCodes: ErrorCode[] = [
    ERROR_CODES.AUTH_ERROR,
    ERROR_CODES.INVALID_CREDENTIALS,
    ERROR_CODES.INVALID_TOKEN,
    ERROR_CODES.TOKEN_EXPIRED,
    ERROR_CODES.EMAIL_NOT_VERIFIED,
    ERROR_CODES.UNAUTHORIZED,
    ERROR_CODES.FORBIDDEN,
  ];

  return authCodes.includes(error.code);
}

/**
 * Check if error is validation related
 */
export function isValidationError(error: unknown): boolean {
  if (!isAppError(error)) return false;

  const validationCodes: ErrorCode[] = [
    ERROR_CODES.VALIDATION_ERROR,
    ERROR_CODES.MISSING_FIELD,
    ERROR_CODES.INVALID_FORMAT,
    ERROR_CODES.INVALID_EMAIL,
    ERROR_CODES.PASSWORD_TOO_WEAK,
  ];

  return validationCodes.includes(error.code);
}

// ==========================================
// ASSERTION HELPERS
// ==========================================

/**
 * Assert condition and throw AppError if false
 */
export function assert(
  condition: unknown,
  code: ErrorCode,
  message?: string,
  details?: unknown
): asserts condition {
  if (!condition) {
    throw new AppError(code, message, undefined, undefined, details);
  }
}

/**
 * Assert truthy value and throw if falsy
 */
export function assertExists<T>(
  value: T | null | undefined,
  code: ErrorCode = ERROR_CODES.NOT_FOUND,
  message?: string
): asserts value is T {
  assert(value != null, code, message);
}

/**
 * Assert array is not empty
 */
export function assertNotEmpty<T>(
  array: T[],
  code: ErrorCode = ERROR_CODES.VALIDATION_ERROR,
  message = "Array cannot be empty"
): asserts array is [T, ...T[]] {
  assert(array.length > 0, code, message);
}

/**
 * Assert string is not empty
 */
export function assertNotEmptyString(value: string, fieldName: string): asserts value is string {
  assert(value.trim().length > 0, ERROR_CODES.MISSING_FIELD, `${fieldName} is required`);
}

/**
 * Assert valid email format
 */
export function assertValidEmail(email: string): asserts email is string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  assert(emailRegex.test(email), ERROR_CODES.INVALID_EMAIL, "Invalid email format");
}

/**
 * Assert number is positive
 */
export function assertPositive(value: number, fieldName: string): asserts value is number {
  assert(value > 0, ERROR_CODES.VALIDATION_ERROR, `${fieldName} must be positive`);
}

/**
 * Assert number is within range
 */
export function assertInRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): asserts value is number {
  assert(
    value >= min && value <= max,
    ERROR_CODES.VALIDATION_ERROR,
    `${fieldName} must be between ${min} and ${max}`
  );
}

// ==========================================
// CONVERSION HELPERS
// ==========================================

/**
 * Convert any error to ErrorResponse format
 */
export function toErrorResponse(error: unknown, context?: string): ErrorResponse {
  // AppError - use built-in toJSON
  if (isAppError(error)) {
    const errorJson = error.toJSON();
    return {
      success: false,
      error: context ? { ...errorJson, context } : errorJson,
    };
  }

  // Standard Error
  if (error instanceof Error) {
    return {
      success: false,
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: error.message,
        status: 500,
        context,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Unknown error type
  return {
    success: false,
    error: {
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: "An unexpected error occurred",
      status: 500,
      context,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Extract error message safely
 */
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred";
}

/**
 * Extract error code safely
 */
export function getErrorCode(error: unknown): ErrorCode {
  if (isAppError(error)) return error.code;
  return ERROR_CODES.UNKNOWN_ERROR;
}

/**
 * Extract error status safely
 */
export function getErrorStatus(error: unknown): number {
  if (isAppError(error)) return error.status;
  return 500;
}

// ==========================================
// ASYNC HELPERS
// ==========================================

/**
 * Try-catch wrapper that returns [error, null] or [null, data]
 */
export async function tryCatch<T>(promise: Promise<T>): Promise<[null, T] | [Error, null]> {
  try {
    const data = await promise;
    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
}

/**
 * Try-catch wrapper with custom error handler
 */
export async function tryCatchWithHandler<T>(
  promise: Promise<T>,
  errorHandler: (error: unknown) => Error
): Promise<[null, T] | [Error, null]> {
  try {
    const data = await promise;
    return [null, data];
  } catch (error) {
    return [errorHandler(error), null];
  }
}

/**
 * Wrap async function with automatic error handling
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function asyncErrorWrapper<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorHandler?: (error: unknown) => Error
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw errorHandler ? errorHandler(error) : error;
    }
  };
}

// ==========================================
// RETRY HELPERS
// ==========================================

interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: unknown) => void;
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxAttempts = 3, delayMs = 1000, backoff = true, onRetry } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry operational errors (they're expected)
      if (isOperationalError(error)) {
        throw error;
      }

      // Last attempt - throw error
      if (attempt === maxAttempts) {
        throw error;
      }

      // Call onRetry callback
      if (onRetry) {
        onRetry(attempt, error);
      }

      // Wait before retry (with exponential backoff)
      const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// ==========================================
// VALIDATION HELPERS
// ==========================================

/**
 * Validate required fields
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter((field) => {
    const value = data[field];
    return (
      value === undefined ||
      value == null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    );
  });

  if (missingFields.length > 0) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      `Missing required fields: ${missingFields.join(", ")}`,
      422,
      undefined,
      { missingFields }
    );
  }
}

/**
 * Combine multiple validation errors
 */
export function combineValidationErrors(errors: string[]): never {
  throw new AppError(ERROR_CODES.VALIDATION_ERROR, errors.join("; "), 422, undefined, { errors });
}

// =========================================
// USER MESSAGE HELPERS
// =========================================
/**
 * Get user-friendly message for error code
 */
export function getUserFriendlyMessage(code: ErrorCode): string {
  return USER_FRIENDLY_MESSAGES[code] || ERROR_MESSAGES[code] || "An error occurred";
}

/**
 * Get status code for error code
 */
export function getStatusCode(code: ErrorCode): number {
  return ERROR_STATUS_CODES[code] || 500;
}
