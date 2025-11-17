// ==========================================
// RESPONSE TYPES
// ==========================================

export interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    status: number;
    context?: string;
    details?: unknown;
    timestamp: string;
  };
}

// ==========================================
// ERROR CODES
// ==========================================

export const ERROR_CODES = {
  // Authentication & Authorization (1xxx)
  AUTH_ERROR: "AUTH_ERROR",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",

  // Validation (2xxx)
  VALIDATION_ERROR: "VALIDATION_ERROR",
  MISSING_FIELD: "MISSING_FIELD",
  INVALID_FORMAT: "INVALID_FORMAT",
  INVALID_EMAIL: "INVALID_EMAIL",
  PASSWORD_TOO_WEAK: "PASSWORD_TOO_WEAK",

  // Database (3xxx)
  DATABASE_ERROR: "DATABASE_ERROR",
  DATABASE_CONNECTION_ERROR: "DATABASE_CONNECTION_ERROR",
  QUERY_FAILED: "QUERY_FAILED",
  TRANSACTION_FAILED: "TRANSACTION_FAILED",

  // Resources (4xxx)
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  ALREADY_EXISTS: "ALREADY_EXISTS",

  // Rate Limiting (5xxx)
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",

  // Business Logic (6xxx)
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  ORDER_CANCELLED: "ORDER_CANCELLED",
  INVALID_COUPON: "INVALID_COUPON",

  // External Services (7xxx)
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  PAYMENT_GATEWAY_ERROR: "PAYMENT_GATEWAY_ERROR",
  EMAIL_SERVICE_ERROR: "EMAIL_SERVICE_ERROR",

  // General (9xxx)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  NOT_IMPLEMENTED: "NOT_IMPLEMENTED",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// ==========================================
// ERROR MESSAGES
// ==========================================

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Auth
  [ERROR_CODES.AUTH_ERROR]: "Authentication failed",
  [ERROR_CODES.INVALID_CREDENTIALS]: "Invalid email or password",
  [ERROR_CODES.INVALID_TOKEN]: "Invalid or expired token",
  [ERROR_CODES.TOKEN_EXPIRED]: "Token has expired",
  [ERROR_CODES.EMAIL_NOT_VERIFIED]: "Email verification required",
  [ERROR_CODES.UNAUTHORIZED]: "Unauthorized access",
  [ERROR_CODES.FORBIDDEN]: "Access forbidden",

  // Validation
  [ERROR_CODES.VALIDATION_ERROR]: "Validation failed",
  [ERROR_CODES.MISSING_FIELD]: "Required field is missing",
  [ERROR_CODES.INVALID_FORMAT]: "Invalid format",
  [ERROR_CODES.INVALID_EMAIL]: "Invalid email address",
  [ERROR_CODES.PASSWORD_TOO_WEAK]: "Password does not meet requirements",

  // Database
  [ERROR_CODES.DATABASE_ERROR]: "Database operation failed",
  [ERROR_CODES.DATABASE_CONNECTION_ERROR]: "Database connection failed",
  [ERROR_CODES.QUERY_FAILED]: "Query execution failed",
  [ERROR_CODES.TRANSACTION_FAILED]: "Transaction failed",

  // Resources
  [ERROR_CODES.NOT_FOUND]: "Resource not found",
  [ERROR_CODES.CONFLICT]: "Resource conflict",
  [ERROR_CODES.ALREADY_EXISTS]: "Resource already exists",

  // Rate Limiting
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: "Rate limit exceeded",
  [ERROR_CODES.TOO_MANY_REQUESTS]: "Too many requests",

  // Business Logic
  [ERROR_CODES.INSUFFICIENT_STOCK]: "Insufficient stock",
  [ERROR_CODES.PAYMENT_FAILED]: "Payment failed",
  [ERROR_CODES.ORDER_CANCELLED]: "Order cancelled",
  [ERROR_CODES.INVALID_COUPON]: "Invalid or expired coupon",

  // External Services
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: "External service error",
  [ERROR_CODES.PAYMENT_GATEWAY_ERROR]: "Payment gateway error",
  [ERROR_CODES.EMAIL_SERVICE_ERROR]: "Email service error",

  // General
  [ERROR_CODES.INTERNAL_ERROR]: "Internal server error",
  [ERROR_CODES.UNKNOWN_ERROR]: "An unexpected error occurred",
  [ERROR_CODES.NOT_IMPLEMENTED]: "Feature not implemented",
};

// ==========================================
// USER-FRIENDLY MESSAGES (for frontend)
// ==========================================

export const USER_FRIENDLY_MESSAGES: Partial<Record<ErrorCode, string>> = {
  [ERROR_CODES.AUTH_ERROR]: "We couldn't sign you in. Please try again.",
  [ERROR_CODES.INVALID_CREDENTIALS]: "The email or password you entered is incorrect.",
  [ERROR_CODES.EMAIL_NOT_VERIFIED]: "Please verify your email address to continue.",
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: "You're doing that too often. Please wait a moment.",
  [ERROR_CODES.INSUFFICIENT_STOCK]: "Sorry, we don't have enough of this item in stock.",
  [ERROR_CODES.PAYMENT_FAILED]: "Your payment couldn't be processed. Please try again.",
  [ERROR_CODES.INTERNAL_ERROR]: "Something went wrong. We're working to fix it.",
};

// ==========================================
// STATUS CODE MAPPING
// ==========================================

export const ERROR_STATUS_CODES: Record<ErrorCode, number> = {
  // 400 Bad Request
  [ERROR_CODES.VALIDATION_ERROR]: 400,
  [ERROR_CODES.MISSING_FIELD]: 400,
  [ERROR_CODES.INVALID_FORMAT]: 400,
  [ERROR_CODES.INVALID_EMAIL]: 400,
  [ERROR_CODES.PASSWORD_TOO_WEAK]: 400,
  [ERROR_CODES.INVALID_COUPON]: 400,
  [ERROR_CODES.INSUFFICIENT_STOCK]: 400,

  // 401 Unauthorized
  [ERROR_CODES.AUTH_ERROR]: 401,
  [ERROR_CODES.INVALID_CREDENTIALS]: 401,
  [ERROR_CODES.INVALID_TOKEN]: 401,
  [ERROR_CODES.TOKEN_EXPIRED]: 401,
  [ERROR_CODES.UNAUTHORIZED]: 401,

  // 403 Forbidden
  [ERROR_CODES.EMAIL_NOT_VERIFIED]: 403,
  [ERROR_CODES.FORBIDDEN]: 403,

  // 404 Not Found
  [ERROR_CODES.NOT_FOUND]: 404,

  // 409 Conflict
  [ERROR_CODES.CONFLICT]: 409,
  [ERROR_CODES.ALREADY_EXISTS]: 409,

  // 422 Unprocessable Entity
  [ERROR_CODES.ORDER_CANCELLED]: 422,

  // 429 Too Many Requests
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 429,
  [ERROR_CODES.TOO_MANY_REQUESTS]: 429,

  // 500 Internal Server Error
  [ERROR_CODES.DATABASE_ERROR]: 500,
  [ERROR_CODES.DATABASE_CONNECTION_ERROR]: 500,
  [ERROR_CODES.QUERY_FAILED]: 500,
  [ERROR_CODES.TRANSACTION_FAILED]: 500,
  [ERROR_CODES.INTERNAL_ERROR]: 500,
  [ERROR_CODES.UNKNOWN_ERROR]: 500,
  [ERROR_CODES.NOT_IMPLEMENTED]: 501,

  // 502 Bad Gateway
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 502,
  [ERROR_CODES.PAYMENT_GATEWAY_ERROR]: 502,
  [ERROR_CODES.EMAIL_SERVICE_ERROR]: 502,

  // 503 Service Unavailable
  [ERROR_CODES.PAYMENT_FAILED]: 503,
};
