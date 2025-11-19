/**
 * ═══════════════════════════════════════════════════════════════
 * SERVICE LAYER ERROR HANDLING
 * ═══════════════════════════════════════════════════════════════
 * Wraps service functions that can throw AppError or return Result<T>
 */

import { logger } from "@/shared/lib/logger";
import { fail } from "../core/result";
import { type Result } from "../core/types";
import { mapToErrorDetails } from "../mappers/error-mapper";

/**
 * Wraps service functions with automatic error handling
 * Services can throw AppError or return Result<T>
 *
 * @example
 * export const signupUserService = withService(
 *   async (data) => {
 *     // Can throw AppError
 *     if (existingUser) throw new AlreadyExistsError("Email exists")
 *
 *     // Or check Result and forward
 *     const result = await createUser(data)
 *     if (!result.success) return result
 *
 *     return ok(result.data)
 *   },
 *   "signupUserService"
 * )
 */
export function withService<TArgs extends unknown[], TData>(
  fn: (...args: TArgs) => Promise<Result<TData>>,
  context?: string
): (...args: TArgs) => Promise<Result<TData>> {
  return async (...args: TArgs): Promise<Result<TData>> => {
    try {
      return await fn(...args);
    } catch (error) {
      const errorDetails = mapToErrorDetails(error, context || "service");

      // Log service errors
      logger.error({
        message: `Service error: ${errorDetails.message}`,
        code: errorDetails.code,
        status: errorDetails.status,
        context: errorDetails.context,
      });

      return fail(errorDetails);
    }
  };
}
