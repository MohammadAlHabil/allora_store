/**
 * ═══════════════════════════════════════════════════════════════
 * API ROUTE ERROR HANDLING
 * ═══════════════════════════════════════════════════════════════
 * Wraps API Route handlers with automatic error handling
 */

import { logger } from "@/shared/lib/logger";
import { fail } from "../core/result";
import { type Result, type ErrorDetails } from "../core/types";
import { mapToErrorDetails } from "../mappers/error-mapper";

/**
 * Wraps API Route handlers with automatic error handling
 *
 * @example
 * export const GET = withApiRoute(
 *   async (request) => {
 *     const users = await getAllUsers()
 *     if (!users.success) return users
 *
 *     return ok(users.data)
 *   },
 *   "GET /api/users"
 * )
 */
export function withApiRoute<TData>(
  fn: (request: Request, ctx?: Record<string, unknown>) => Promise<Result<TData> | Response>,
  context?: string
): (request: Request, ctx?: Record<string, unknown>) => Promise<Response> {
  return async (request: Request, ctx?: Record<string, unknown>): Promise<Response> => {
    try {
      const result = await fn(request, ctx);

      // If handler returned a Response (e.g. NextResponse with cookies), forward it
      if (
        typeof result === "object" &&
        "status" in result &&
        typeof (result as Response).json === "function"
      ) {
        return result as Response;
      }

      // Otherwise it's a Result<T>
      if ((result as Result<TData>).success) {
        return Response.json(result, { status: 200 });
      } else {
        const failure = result as { success: false; error: ErrorDetails };
        return Response.json(failure, { status: failure.error.status });
      }
    } catch (error) {
      const errorDetails = mapToErrorDetails(error as unknown, context || "api");

      // Log API errors
      logger.error({
        message: `API error: ${errorDetails.message}`,
        code: errorDetails.code,
        status: errorDetails.status,
        context: errorDetails.context,
      });

      return Response.json(fail(errorDetails), { status: errorDetails.status });
    }
  };
}

/**
 * Helper to convert Result to Response
 */
export function toResponse<T>(result: Result<T>, successStatus = 200): Response {
  if (result.success) {
    return Response.json(result, { status: successStatus });
  } else {
    return Response.json(result, { status: result.error.status });
  }
}
