/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  isAppError,
  isOperationalError,
  toErrorResponse,
  getErrorMessage,
} from "@/shared/lib/utils";
import { ErrorResponse, ERROR_CODES } from "@/shared/types";
import { logger } from "./logger";

// ==========================================
// ERROR HANDLER OPTIONS
// ==========================================

interface ErrorHandlerOptions {
  context?: string;
  logError?: boolean;
  includeStack?: boolean;
}

// ==========================================
// MAIN ERROR HANDLER
// ==========================================

/**
 * Universal error handler
 * Logs error and returns standardized error response
 */
export function handleError(error: unknown, options: ErrorHandlerOptions = {}): ErrorResponse {
  const { context = "unknown", logError: shouldLog = true, includeStack = false } = options;

  // Log the error if needed
  if (shouldLog) {
    logErrorWithContext(error, context);
  }

  // Convert to error response
  const errorResponse = toErrorResponse(error, context);

  // Add stack trace in development only
  if (includeStack && process.env.NODE_ENV !== "production" && error instanceof Error) {
    errorResponse.error.details = {
      ...(typeof errorResponse.error.details === "object" ? errorResponse.error.details : {}),
      stack: error.stack,
    };
  }

  return errorResponse;
}

// ==========================================
// SERVER ACTION HANDLER
// ==========================================

export interface ActionErrorResponse {
  success: false;
  message: string;
  code: string;
  details?: unknown;
}

export interface ActionSuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data?: T;
}

export type ActionResponse<T = unknown> = ActionSuccessResponse<T> | ActionErrorResponse;

/**
 * Handler for Server Actions (Next.js)
 * Returns simplified response format
 */
export function handleActionError(error: unknown, context: string): ActionErrorResponse {
  logErrorWithContext(error, context);

  if (isAppError(error)) {
    return {
      success: false,
      message: error.message,
      code: error.code,
      details: error.details,
    };
  }

  return {
    success: false,
    message: getErrorMessage(error),
    code: ERROR_CODES.INTERNAL_ERROR,
  };
}

// ==========================================
// API ROUTE HANDLER (Next.js App Router)
// ==========================================

/**
 * Handler for API Routes - Returns Response object
 */
export function handleApiError(error: unknown, context: string): Response {
  const errorResponse = handleError(error, { context });

  return Response.json(errorResponse, {
    status: errorResponse.error.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Alias for handleApiError (for Route Handlers)
 */
export function handleRouteError(error: unknown, context: string): Response {
  return handleApiError(error, context);
}

// ==========================================
// ASYNC ERROR WRAPPER
// ==========================================

/**
 * Wraps async functions to automatically handle errors
 *
 * @example
 * const safeGetUser = asyncErrorHandler(getUser, "getUser");
 * const result = await safeGetUser(userId);
 */
export function asyncErrorHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: string,
  options?: Omit<ErrorHandlerOptions, "context">
): (...args: Parameters<T>) => Promise<ReturnType<T> | ErrorResponse> {
  return async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      return handleError(error, { context, ...options });
    }
  };
}

/**
 * Wraps async Server Action with error handling
 *
 * @example
 * export const createUser = wrapAction(async (data) => {
 *   // your logic
 * }, "createUser");
 */
export function wrapAction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: string
): (
  ...args: Parameters<T>
) => Promise<ActionSuccessResponse<Awaited<ReturnType<T>>> | ActionErrorResponse> {
  return async (...args: Parameters<T>) => {
    try {
      const data = await fn(...args);
      return { success: true, data };
    } catch (error) {
      return handleActionError(error, context);
    }
  };
}

// ==========================================
// LOGGING HELPER
// ==========================================

function logErrorWithContext(error: unknown, context: string): void {
  if (isAppError(error)) {
    // Operational errors - log based on severity
    const logLevel = error.status >= 500 ? "error" : "warn";

    logger[logLevel]({
      code: error.code,
      message: error.message,
      status: error.status,
      context: error.context || context,
      details: error.details,
      timestamp: error.timestamp,
      operational: error.isOperational,
      stack: error.stack,
    });
  } else if (error instanceof Error) {
    // Unexpected errors - always log as error
    logger.error({
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
      operational: false,
    });
  } else {
    // Unknown error type
    logger.error({
      error,
      context,
      type: typeof error,
      operational: false,
    });
  }
}

// ==========================================
// CRASH HANDLER
// ==========================================

/**
 * Determines if error should crash the application
 * Used for unhandled errors in production
 */
export function shouldCrash(error: unknown): boolean {
  // Don't crash on operational errors
  if (isOperationalError(error)) {
    return false;
  }

  // Crash on critical database errors
  if (isAppError(error) && error.code === ERROR_CODES.DATABASE_CONNECTION_ERROR) {
    return true;
  }

  // In development, don't crash
  // In production, crash on programming errors
  return process.env.NODE_ENV === "production";
}

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

/**
 * Handle uncaught exceptions
 * Should be registered at app startup
 */
export function setupGlobalErrorHandlers() {
  // Uncaught exceptions
  process.on("uncaughtException", (error: Error) => {
    logger.error(
      {
        type: "uncaughtException",
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      "Uncaught Exception"
    );

    if (shouldCrash(error)) {
      process.exit(1);
    }
  });

  // Unhandled promise rejections
  process.on("unhandledRejection", (reason: unknown) => {
    logger.error(
      {
        type: "unhandledRejection",
        reason,
      },
      "Unhandled Promise Rejection"
    );

    if (shouldCrash(reason)) {
      process.exit(1);
    }
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    logger.info("SIGTERM received, shutting down gracefully");
    process.exit(0);
  });

  process.on("SIGINT", () => {
    logger.info("SIGINT received, shutting down gracefully");
    process.exit(0);
  });
}

// ==========================================
// RESPONSE HELPERS
// ==========================================

/**
 * Create success response
 */
export function successResponse<T>(data: T): ActionSuccessResponse<T> {
  return { success: true, data };
}

/**
 * Create error response
 */
export function errorResponse(
  message: string,
  code: string = ERROR_CODES.INTERNAL_ERROR,
  details?: unknown
): ActionErrorResponse {
  return {
    success: false,
    message,
    code,
    details,
  };
}
