/**
 * ═══════════════════════════════════════════════════════════════
 * UNIFIED ERROR MAPPER
 * ═══════════════════════════════════════════════════════════════
 * Converts any error type to ErrorDetails
 */

import { ZodError } from "zod";
import { AppError } from "../core/AppError";
import { ERROR_CODES } from "../core/error-codes";
import type { ErrorDetails } from "../core/types";

/**
 * Main mapper - converts any error to ErrorDetails
 */
export function mapToErrorDetails(error: unknown, context?: string): ErrorDetails {
  // 1. AppError (our custom errors)
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      status: error.status,
      context: error.context || context,
      details: error.details,
      timestamp: error.timestamp,
    };
  }

  // 2. ZodError (validation errors)
  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    error.issues.forEach((issue) => {
      const field = issue.path.join(".");
      fieldErrors[field] = issue.message;
    });

    return {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "Validation failed",
      status: 422,
      context,
      fieldErrors,
      details: { issues: error.issues },
      timestamp: new Date().toISOString(),
    };
  }

  // 3. Prisma Errors
  if (isPrismaError(error)) {
    return mapPrismaError(error, context);
  }

  // 4. Standard Error
  if (error instanceof Error) {
    return {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: error.message || "An unexpected error occurred",
      status: 500,
      context,
      details: { stack: error.stack },
      timestamp: new Date().toISOString(),
    };
  }

  // 5. Unknown error type
  return {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: String(error) || "An unexpected error occurred",
    status: 500,
    context,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Prisma error detection
 */
function isPrismaError(error: unknown): error is Error & { code?: string; meta?: unknown } {
  return (
    typeof error === "object" &&
    error !== null &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ("code" in error || (error as any)?.name?.includes("Prisma"))
  );
}

/**
 * Prisma error mapper
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPrismaError(error: any, context?: string): ErrorDetails {
  const code = error.code as string | undefined;
  const meta = error.meta;

  switch (code) {
    case "P2002": {
      // Unique constraint
      // Extract field name from meta if available
      const target = meta?.target as string[] | undefined;
      const field = target?.[0] || "field";
      return {
        code: ERROR_CODES.ALREADY_EXISTS,
        message: `A record with this ${field} already exists`,
        status: 409,
        context,
        details: { prismaCode: code, meta, field },
        timestamp: new Date().toISOString(),
      };
    }

    case "P2025": // Record not found
      return {
        code: ERROR_CODES.NOT_FOUND,
        message: "Record not found",
        status: 404,
        context,
        details: { prismaCode: code, meta },
        timestamp: new Date().toISOString(),
      };

    case "P2003": // Foreign key constraint
      return {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "Related record not found",
        status: 422,
        context,
        details: { prismaCode: code, meta },
        timestamp: new Date().toISOString(),
      };

    case "P2016": // Record to delete does not exist
      return {
        code: ERROR_CODES.NOT_FOUND,
        message: "Record to delete does not exist",
        status: 404,
        context,
        details: { prismaCode: code, meta },
        timestamp: new Date().toISOString(),
      };

    default:
      return {
        code: ERROR_CODES.DATABASE_ERROR,
        message: error.message || `Database error${code ? ` (${code})` : ""}`,
        status: 500,
        context,
        details: { prismaCode: code, meta },
        timestamp: new Date().toISOString(),
      };
  }
}
