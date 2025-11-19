/**
 * ═══════════════════════════════════════════════════════════════
 * REPOSITORY LAYER ERROR HANDLING
 * ═══════════════════════════════════════════════════════════════
 * Wraps repository functions with automatic error handling
 */

import type { Prisma } from "@/app/generated/prisma";
import { logger } from "@/shared/lib/logger";
import prisma from "@/shared/lib/prisma";
import { fail, ok } from "../core/result";
import { type Result } from "../core/types";
import { mapToErrorDetails } from "../mappers/error-mapper";

/**
 * Wraps repository operations with automatic error handling
 *
 * @example
 * export const getUserByEmail = (email: string): Promise<Result<User | null>> => {
 *   return withRepository(async (client) => {
 *     return client.user.findUnique({ where: { email } });
 *   });
 * };
 *
 * // Usage:
 * const result = await getUserByEmail("test@example.com")
 * if (result.success) {
 *   console.log(result.data) // User | null
 * } else {
 *   console.error(result.error) // ErrorDetails
 * }
 */
export const withRepository = async function withRepository<TData>(
  fn: (client: typeof prisma) => Promise<TData | Result<TData>>,
  context?: string
): Promise<Result<TData>> {
  try {
    const dataOrResult = await fn(prisma);

    // If the callback already returned a Result, forward it
    if (dataOrResult && typeof (dataOrResult as unknown as Result<TData>).success !== "undefined") {
      return dataOrResult as Result<TData>;
    }

    // Otherwise wrap the raw data into an ok Result
    return ok(dataOrResult as TData);
  } catch (error) {
    const errorDetails = mapToErrorDetails(error, context || "repository");

    // Log database errors
    logger.error({
      type: "repository",
      context: errorDetails.context,
      code: errorDetails.code,
      status: errorDetails.status,
      details: errorDetails.details,
    });

    return fail(errorDetails);
  }
} as {
  <TData>(
    fn: (client: typeof prisma) => Promise<TData | Result<TData>>,
    context?: string
  ): Promise<Result<TData>>;
  transaction?: <TData>(
    fn: (tx: Prisma.TransactionClient) => Promise<TData>,
    context?: string
  ) => Promise<Result<TData>>;
};

/**
 * Run a callback inside a Prisma transaction while preserving repository error mapping.
 * Useful to reduce boilerplate when services need to run multiple repo calls inside one transaction.
 */
export async function runInTransaction<TData>(
  fn: (tx: Prisma.TransactionClient) => Promise<TData>,
  context?: string
): Promise<Result<TData>> {
  return withRepository(
    async (client) => {
      const result = await client.$transaction(async (tx: Prisma.TransactionClient) => {
        return await fn(tx);
      });
      return result;
    },
    context ? `${context}.runInTransaction` : "repository.runInTransaction"
  );
}

// Expose transaction helper on withRepository for a unified API
// Attach transaction helper with proper typing
Object.defineProperty(withRepository, "transaction", {
  value: runInTransaction,
  writable: false,
  enumerable: false,
});
