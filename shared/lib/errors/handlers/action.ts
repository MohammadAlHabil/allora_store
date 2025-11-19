/**
 * ═══════════════════════════════════════════════════════════════
 * SERVER ACTION ERROR HANDLING
 * ═══════════════════════════════════════════════════════════════
 * Wraps Server Actions with automatic error handling
 */

import { logger } from "@/shared/lib/logger";
import { fail } from "../core/result";
import { type Result } from "../core/types";

import { mapToErrorDetails } from "../mappers/error-mapper";

/**
 * Wraps Server Actions with automatic error handling
 *
 * @example
 * export const signUpAction = withAction(
 *   async (formData: FormData) => {
 *     const parsed = parseFormData(formData, schema)
 *     if (!parsed.success) return parsed
 *
 *     const result = await signupUserService(parsed.data)
 *     return ok(null, "Check your email!")
 *   },
 *   "signUpAction"
 * )
 */
export function withAction<TArgs extends unknown[], TData>(
  fn: (...args: TArgs) => Promise<Result<TData>>,
  context?: string
): (...args: TArgs) => Promise<Result<TData>> {
  return async (...args: TArgs): Promise<Result<TData>> => {
    try {
      // Execute the function and return its result directly
      return await fn(...args);
    } catch (error) {
      const errorDetails = mapToErrorDetails(error, context || "action");

      // Log action errors
      logger.error({
        message: `Action error: ${errorDetails.message}`,
        code: errorDetails.code,
        status: errorDetails.status,
        context: errorDetails.context,
      });

      return fail(errorDetails);
    }
  };
}
