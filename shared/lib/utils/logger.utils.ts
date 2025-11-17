import { isDev } from "@/shared/constants/constant";
import { logger } from "../logger";

interface LogContext {
  context?: string;
  userId?: string;
  requestId?: string;
  [key: string]: unknown;
}

interface ErrorLogContext extends LogContext {
  code?: string;
  status?: number;
  operational?: boolean;
  details?: unknown;
}

// ==========================================
// GENERIC LOGGING FUNCTIONS
// ==========================================
/**
 * Log error with full context
 */
export function logError(error: unknown, context?: string | ErrorLogContext) {
  const ctx = typeof context === "string" ? { context } : context;

  if (error instanceof Error) {
    logger.error({
      ...ctx,
      name: error.name,
      message: error.message,
      stack: error.stack,
      // Include any custom properties
      ...("code" in error ? { code: error.code } : {}),
      ...("status" in error ? { status: error.status } : {}),
    });
  } else {
    logger.error({
      ...ctx,
      error,
      type: typeof error,
    });
  }
}

/**
 * Log info with context
 */
export function logInfo(message: string, context?: LogContext) {
  logger.info({ ...context }, message);
}

/**
 * Log warning with context
 */
export function logWarn(message: string, context?: LogContext) {
  logger.warn({ ...context }, message);
}

/**
 * Log debug info (only in development)
 */
export function logDebug(message: string, data?: unknown, context?: LogContext) {
  if (isDev) {
    logger.debug({ ...context, data }, message);
  }
}

// ==========================================
// REQUEST LOGGING
// ==========================================

interface RequestLogData {
  method: string;
  url: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
  status?: number;
}

/**
 * Log incoming request
 */
export function logRequest(data: RequestLogData) {
  logger.info(
    {
      type: "request",
      ...data,
    },
    `${data.method} ${data.url}`
  );
}

/**
 * Log request completion
 */
export function logRequestComplete(data: RequestLogData) {
  const level = data.status && data.status >= 400 ? "warn" : "info";

  logger[level](
    {
      type: "request_complete",
      ...data,
    },
    `${data.method} ${data.url} - ${data.status} (${data.duration}ms)`
  );
}

// ==========================================
// DATABASE LOGGING
// ==========================================

interface QueryLogData {
  query: string;
  duration?: number;
  context?: string;
  params?: unknown;
}

/**
 * Log slow database queries
 */
export function logSlowQuery(data: QueryLogData) {
  logger.warn(
    {
      type: "slow_query",
      ...data,
    },
    `Slow query detected: ${data.query}`
  );
}

/**
 * Log database errors
 */
export function logDatabaseError(error: unknown, query?: string) {
  logError(error, {
    context: "database",
    query,
    type: "database_error",
  });
}

// ==========================================
// BUSINESS LOGIC LOGGING
// ==========================================

/**
 * Log important business events
 */
export function logEvent(event: string, data?: Record<string, unknown>, context?: string) {
  logger.info(
    {
      type: "event",
      event,
      context,
      ...data,
    },
    `Event: ${event}`
  );
}

/**
 * Log authentication events
 */
export function logAuth(
  action: "login" | "logout" | "register" | "password_reset",
  data: { userId?: string; email?: string; success: boolean; reason?: string }
) {
  logger.info(
    {
      type: "auth",
      action,
      ...data,
    },
    `Auth: ${action} - ${data.success ? "success" : "failed"}`
  );
}

/**
 * Log payment events
 */
export function logPayment(
  action: "initiated" | "completed" | "failed" | "refunded",
  data: { orderId: string; amount: number; currency: string; userId?: string }
) {
  logger.info(
    {
      type: "payment",
      action,
      ...data,
    },
    `Payment ${action}: ${data.amount} ${data.currency}`
  );
}

// ==========================================
// SECURITY LOGGING
// ==========================================

/**
 * Log security events
 */
export function logSecurity(
  event: string,
  data: {
    userId?: string;
    ip?: string;
    severity: "low" | "medium" | "high" | "critical";
    [key: string]: unknown;
  }
) {
  const level = data.severity === "critical" || data.severity === "high" ? "error" : "warn";

  logger[level](
    {
      type: "security",
      event,
      ...data,
    },
    `Security: ${event}`
  );
}

/**
 * Log rate limit hits
 */
export function logRateLimit(data: {
  identifier: string;
  route: string;
  limit: number;
  window: string;
}) {
  logger.warn(
    {
      type: "rate_limit",
      ...data,
    },
    `Rate limit exceeded: ${data.identifier} on ${data.route}`
  );
}

// ==========================================
// PERFORMANCE LOGGING
// ==========================================

/**
 * Create performance timer
 */
export function createTimer(label: string, context?: string) {
  const start = Date.now();

  return {
    end: (data?: Record<string, unknown>) => {
      const duration = Date.now() - start;

      logDebug(label, {
        duration,
        context,
        ...data,
      });

      // Warn on slow operations (> 1s)
      if (duration > 1000) {
        logger.warn(
          {
            type: "slow_operation",
            label,
            duration,
            context,
            ...data,
          },
          `Slow operation: ${label} took ${duration}ms`
        );
      }

      return duration;
    },
  };
}
