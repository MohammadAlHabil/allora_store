import type { ErrorCode, ErrorResponse } from "@/shared/types";
import { ERROR_CODES, ERROR_MESSAGES } from "@/shared/types";
import { getStatusCode } from "./utils/error.utils";

// ==========================================
// BASE ERROR CLASS
// ==========================================

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;
  public readonly context?: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(
    code: ErrorCode,
    message?: string,
    status?: number,
    context?: string,
    details?: unknown,
    isOperational = true
  ) {
    // Use default message if not provided
    super(message || ERROR_MESSAGES[code]);

    this.name = this.constructor.name;
    this.code = code;
    this.status = status || getStatusCode(code);
    this.context = context;
    this.details = details;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): ErrorResponse["error"] {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      context: this.context,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

// ==========================================
// VALIDATION ERRORS (2xxx)
// ==========================================

export class ValidationError extends AppError {
  constructor(message?: string, details?: unknown) {
    super(ERROR_CODES.VALIDATION_ERROR, message, undefined, undefined, details);
  }
}

export class MissingFieldError extends AppError {
  constructor(field: string) {
    super(ERROR_CODES.MISSING_FIELD, `${field} is required`, undefined, undefined, { field });
  }
}

export class InvalidFormatError extends AppError {
  constructor(field: string, expectedFormat?: string) {
    super(
      ERROR_CODES.INVALID_FORMAT,
      `Invalid format for ${field}${expectedFormat ? `: ${expectedFormat}` : ""}`,
      undefined,
      undefined,
      { field, expectedFormat }
    );
  }
}

export class InvalidEmailError extends AppError {
  constructor() {
    super(ERROR_CODES.INVALID_EMAIL);
  }
}

export class WeakPasswordError extends AppError {
  constructor(requirements?: string[]) {
    super(ERROR_CODES.PASSWORD_TOO_WEAK, undefined, undefined, undefined, { requirements });
  }
}

// ==========================================
// AUTH ERRORS (1xxx)
// ==========================================

export class AuthError extends AppError {
  constructor(message?: string, details?: unknown) {
    super(ERROR_CODES.AUTH_ERROR, message, undefined, "authentication", details);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super(ERROR_CODES.INVALID_CREDENTIALS, undefined, undefined, "authentication");
  }
}

export class InvalidTokenError extends AppError {
  constructor(message?: string) {
    super(ERROR_CODES.INVALID_TOKEN, message, undefined, "authentication");
  }
}

export class TokenExpiredError extends AppError {
  constructor() {
    super(ERROR_CODES.TOKEN_EXPIRED, undefined, undefined, "authentication");
  }
}

export class EmailNotVerifiedError extends AppError {
  constructor() {
    super(ERROR_CODES.EMAIL_NOT_VERIFIED, undefined, undefined, "authentication");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message?: string) {
    super(ERROR_CODES.UNAUTHORIZED, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message?: string) {
    super(ERROR_CODES.FORBIDDEN, message);
  }
}

// ==========================================
// RESOURCE ERRORS (4xxx)
// ==========================================

export class NotFoundError extends AppError {
  constructor(resource?: string) {
    super(
      ERROR_CODES.NOT_FOUND,
      resource ? `${resource} not found` : undefined,
      undefined,
      undefined,
      resource ? { resource } : undefined
    );
  }
}

export class ConflictError extends AppError {
  constructor(message?: string, details?: unknown) {
    super(ERROR_CODES.CONFLICT, message, undefined, undefined, details);
  }
}

export class AlreadyExistsError extends AppError {
  constructor(resource: string, identifier?: string) {
    super(
      ERROR_CODES.ALREADY_EXISTS,
      `${resource} already exists${identifier ? `: ${identifier}` : ""}`,
      undefined,
      undefined,
      { resource, identifier }
    );
  }
}

// ==========================================
// DATABASE ERRORS (3xxx)
// ==========================================

export class DatabaseError extends AppError {
  constructor(message?: string, details?: unknown) {
    super(ERROR_CODES.DATABASE_ERROR, message, undefined, "database", details);
  }
}

export class DatabaseConnectionError extends AppError {
  constructor() {
    super(ERROR_CODES.DATABASE_CONNECTION_ERROR, undefined, undefined, "database");
  }
}

export class QueryFailedError extends AppError {
  constructor(query?: string, details?: object) {
    super(
      ERROR_CODES.QUERY_FAILED,
      undefined,
      undefined,
      "database",
      query ? { query, ...details } : details
    );
  }
}

export class TransactionFailedError extends AppError {
  constructor(details?: unknown) {
    super(ERROR_CODES.TRANSACTION_FAILED, undefined, undefined, "database", details);
  }
}

// ==========================================
// RATE LIMIT ERRORS (5xxx)
// ==========================================

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super(
      ERROR_CODES.RATE_LIMIT_EXCEEDED,
      undefined,
      undefined,
      undefined,
      retryAfter ? { retryAfter } : undefined
    );
  }
}

export class TooManyRequestsError extends AppError {
  constructor(retryAfter?: number) {
    super(
      ERROR_CODES.TOO_MANY_REQUESTS,
      undefined,
      undefined,
      undefined,
      retryAfter ? { retryAfter } : undefined
    );
  }
}

// ==========================================
// BUSINESS LOGIC ERRORS (6xxx)
// ==========================================

export class InsufficientStockError extends AppError {
  constructor(productName?: string, available?: number, requested?: number) {
    super(
      ERROR_CODES.INSUFFICIENT_STOCK,
      productName ? `Insufficient stock for ${productName}` : undefined,
      undefined,
      "inventory",
      { productName, available, requested }
    );
  }
}

export class PaymentFailedError extends AppError {
  constructor(reason?: string, details?: unknown) {
    super(
      ERROR_CODES.PAYMENT_FAILED,
      reason ? `Payment failed: ${reason}` : undefined,
      undefined,
      "payment",
      details
    );
  }
}

export class OrderCancelledError extends AppError {
  constructor(orderId: string, reason?: string) {
    super(
      ERROR_CODES.ORDER_CANCELLED,
      reason ? `Order cancelled: ${reason}` : undefined,
      undefined,
      "order",
      { orderId, reason }
    );
  }
}

export class InvalidCouponError extends AppError {
  constructor(couponCode?: string, reason?: string) {
    super(ERROR_CODES.INVALID_COUPON, reason || undefined, undefined, "coupon", {
      couponCode,
      reason,
    });
  }
}

// ==========================================
// EXTERNAL SERVICE ERRORS (7xxx)
// ==========================================

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string, details?: object) {
    super(
      ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      message || `${service} service error`,
      undefined,
      "external",
      { service, ...details }
    );
  }
}

export class PaymentGatewayError extends AppError {
  constructor(gateway: string, message?: string, details?: object) {
    super(
      ERROR_CODES.PAYMENT_GATEWAY_ERROR,
      message || `${gateway} gateway error`,
      undefined,
      "payment",
      { gateway, ...details }
    );
  }
}

export class EmailServiceError extends AppError {
  constructor(message?: string, details?: unknown) {
    super(ERROR_CODES.EMAIL_SERVICE_ERROR, message, undefined, "email", details);
  }
}

// ==========================================
// GENERAL ERRORS (9xxx)
// ==========================================

export class InternalError extends AppError {
  constructor(message?: string, details?: unknown) {
    super(
      ERROR_CODES.INTERNAL_ERROR,
      message,
      undefined,
      undefined,
      details,
      false // Not operational
    );
  }
}

export class NotImplementedError extends AppError {
  constructor(feature?: string) {
    super(ERROR_CODES.NOT_IMPLEMENTED, feature ? `${feature} is not implemented` : undefined);
  }
}
