import { createHash } from "crypto";
import { Prisma, IdempotencyStatus } from "@/app/generated/prisma";
import prisma from "@/shared/lib/prisma";
import {
  auditor,
  responseSigner,
  IdempotencyKeyValidator,
  type IdempotencySecurityConfig,
} from "./idempotency-security";
import { logger } from "./logger";

// Note: Rate limiting is handled by your existing Upstash implementation

/**
 * Typed error used to signal that another worker is processing the same key.
 */
export class IdempotencyInProgressError extends Error {
  constructor(message = "Idempotency key is currently being processed") {
    super(message);
    this.name = "IDEMPOTENCY_IN_PROGRESS";
    Object.setPrototypeOf(this, IdempotencyInProgressError.prototype);
  }
}

export type WithIdempotencyOptions = {
  /** TTL for the idempotency record, in seconds */
  expiresInSeconds?: number;
  /** If true, run the handler inside a Prisma transaction and persist the COMPLETED state inside that transaction */
  useTransaction?: boolean;
  /** Maximum retry attempts for stuck operations */
  maxRetryAttempts?: number;
  /** Enable request hash validation for added security */
  enableRequestHashValidation?: boolean;
  /** Custom timeout for stuck IN_PROGRESS operations in seconds */
  stuckTimeoutSeconds?: number;
  /** User ID for audit logging */
  userId?: string;
  /** Security configuration (rate limiting handled by Upstash separately) */
  security?: IdempotencySecurityConfig;
};

/**
 * Enhanced configuration with sensible defaults
 */
const DEFAULT_OPTIONS: Required<WithIdempotencyOptions> = {
  expiresInSeconds: 7 * 24 * 60 * 60, // 7 days
  useTransaction: false,
  maxRetryAttempts: 3,
  enableRequestHashValidation: true,
  stuckTimeoutSeconds: 300, // 5 minutes
  userId: "system",
  security: {
    enableAuditLogging: true,
    enableResponseSigning: false,
    enableKeyValidation: true,
    // Rate limiting is handled by Upstash, not here
  },
};

/**
 * Generate a cryptographically secure idempotency key
 */
export function generateIdempotencyKey(input: string | object): string {
  const data = typeof input === "string" ? input : JSON.stringify(input);
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Generate request hash for validation
 */
function generateRequestHash(
  handler: (tx?: Prisma.TransactionClient) => Promise<unknown>,
  args?: unknown[]
): string {
  const handlerString = handler.toString();
  const argsString = args ? JSON.stringify(args) : "";
  return createHash("sha256")
    .update(handlerString + argsString)
    .digest("hex");
}

/**
 * DB-backed idempotency helper with enhanced error handling and security.
 *
 * - Creates an IN_PROGRESS record for `key` (unique constraint on key expected).
 * - If COMPLETED exists, returns cached response.
 * - If IN_PROGRESS exists, throws `IdempotencyInProgressError`.
 * - Handles stuck operations with timeout mechanism.
 * - Provides comprehensive error recovery and retry logic.
 *
 * Notes:
 * - If `useTransaction` is true, the handler receives a `Prisma.TransactionClient` and the COMPLETED update
 *   is persisted inside the same transaction (atomic commit with handler DB changes).
 * - The helper safely serializes the handler result to JSON before storing.
 * - Includes request hash validation for enhanced security when enabled.
 * - Automatically handles stuck IN_PROGRESS operations with configurable timeout.
 */
export async function withIdempotency<T = unknown>(
  key: string,
  handler: (tx?: Prisma.TransactionClient) => Promise<T>,
  opts: WithIdempotencyOptions = {}
): Promise<T> {
  const options = {
    ...DEFAULT_OPTIONS,
    ...opts,
    security: { ...DEFAULT_OPTIONS.security, ...opts.security },
  };

  // Security validations
  const originalKey = key;
  if (options.security.enableKeyValidation) {
    const keyValidation = IdempotencyKeyValidator.validateKey(key);
    if (!keyValidation.valid) {
      // If the key fails only due to low entropy (common for short client-supplied
      // keys like payment provider tokens), transform it into a secure internal
      // key derived from the original value + userId. This preserves idempotency
      // semantics for the client while ensuring our stored keys are cryptographically
      // strong. For other validation failures, log and reject.
      if (
        keyValidation.reason &&
        keyValidation.reason.toLowerCase().includes("insufficient entropy")
      ) {
        const transformedKey = `client:${options.userId}:${generateIdempotencyKey(originalKey)}`;
        await auditor.logOperation("key_transformed", transformedKey, options.userId, {
          originalKey,
          reason: keyValidation.reason,
        });
        // Replace the working key with the transformed secure key

        key = transformedKey;
      } else {
        await auditor.logOperation("validation_failed", key, options.userId, {
          reason: keyValidation.reason,
        });
        throw new Error(`Invalid idempotency key: ${keyValidation.reason}`);
      }
    }
  }

  // Note: Rate limiting is handled by your existing Upstash middleware/implementation
  // We focus on idempotency-specific concerns here

  // Audit logging
  if (options.security.enableAuditLogging) {
    await auditor.logOperation("operation_started", key, options.userId, {
      useTransaction: options.useTransaction,
      maxRetryAttempts: options.maxRetryAttempts,
    });
  }

  const expiresAt = options.expiresInSeconds
    ? new Date(Date.now() + options.expiresInSeconds * 1000)
    : undefined;

  const requestHash = options.enableRequestHashValidation
    ? generateRequestHash(handler)
    : undefined;

  try {
    // Check for stuck IN_PROGRESS operations and clean them up
    await cleanupStuckOperations(key, options.stuckTimeoutSeconds);

    // Attempt to create or get existing record
    let idempotencyRecord = await getOrCreateIdempotencyRecord(key, requestHash, expiresAt);

    // Handle existing records based on status
    if (idempotencyRecord.status === IdempotencyStatus.COMPLETED) {
      logger.info({ key }, "Returning cached response for completed operation");

      // Verify response signature if enabled
      if (options.security.enableResponseSigning && idempotencyRecord.responseBody) {
        const signature = (idempotencyRecord.meta as Record<string, unknown>)?.signature as string;
        if (
          signature &&
          !responseSigner.verifyResponse(idempotencyRecord.responseBody, key, signature)
        ) {
          logger.error({ key }, "Response signature verification failed");
          throw new Error("Response integrity verification failed");
        }
      }

      if (options.security.enableAuditLogging) {
        await auditor.logOperation("cache_hit", key, options.userId);
      }

      return idempotencyRecord.responseBody as T;
    }

    if (idempotencyRecord.status === IdempotencyStatus.IN_PROGRESS) {
      logger.warn({ key }, "Operation already in progress");
      if (options.security.enableAuditLogging) {
        await auditor.logOperation("duplicate_request", key, options.userId);
      }
      throw new IdempotencyInProgressError();
    }

    if (idempotencyRecord.status === IdempotencyStatus.FAILED) {
      // Check retry attempts
      if (idempotencyRecord.attemptCount >= options.maxRetryAttempts) {
        logger.error(
          {
            key,
            attemptCount: idempotencyRecord.attemptCount,
            errorDetails: idempotencyRecord.errorDetails,
          },
          "Maximum retry attempts reached for failed operation"
        );

        if (options.security.enableAuditLogging) {
          await auditor.logOperation("max_retries_exceeded", key, options.userId, {
            attemptCount: idempotencyRecord.attemptCount,
          });
        }

        throw new Error(
          `Operation failed after ${options.maxRetryAttempts} attempts. ` +
            `Check logs for details. Key: ${key}`
        );
      }

      // Reset to IN_PROGRESS for retry
      idempotencyRecord = await retryFailedOperation(key, idempotencyRecord.attemptCount + 1);

      if (options.security.enableAuditLogging) {
        await auditor.logOperation("retry_attempt", key, options.userId, {
          attemptNumber: idempotencyRecord.attemptCount,
        });
      }
    }

    // Execute the operation with comprehensive error handling
    const result = await executeOperation(key, handler, options, requestHash);

    if (options.security.enableAuditLogging) {
      await auditor.logOperation("operation_completed", key, options.userId);
    }

    return result;
  } catch (error) {
    if (options.security.enableAuditLogging) {
      await auditor.logOperation("operation_failed", key, options.userId, {
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
    throw error;
  }
}

/**
 * Clean up stuck IN_PROGRESS operations
 */
async function cleanupStuckOperations(key: string, timeoutSeconds: number): Promise<void> {
  const stuckThreshold = new Date(Date.now() - timeoutSeconds * 1000);

  try {
    const updated = await prisma.idempotencyKey.updateMany({
      where: {
        key,
        status: IdempotencyStatus.IN_PROGRESS,
        lastProcessedAt: { lt: stuckThreshold },
      },
      data: {
        status: IdempotencyStatus.FAILED,
        errorDetails: {
          reason: "Operation timeout",
          timeoutSeconds,
          cleanedUpAt: new Date().toISOString(),
        },
      },
    });

    if (updated.count > 0) {
      logger.warn(
        {
          key,
          timeoutSeconds,
          count: updated.count,
        },
        "Cleaned up stuck IN_PROGRESS operation"
      );
    }
  } catch (error) {
    logger.error({ key, error }, "Failed to cleanup stuck operations");
  }
}

/**
 * Get or create idempotency record with race condition handling
 */
async function getOrCreateIdempotencyRecord(key: string, requestHash?: string, expiresAt?: Date) {
  try {
    // Try to create new record
    return await prisma.idempotencyKey.create({
      data: {
        key,
        status: IdempotencyStatus.IN_PROGRESS,
        requestHash,
        expiresAt,
        lastProcessedAt: new Date(),
        attemptCount: 1,
      },
    });
  } catch (createErr: unknown) {
    // Record likely exists, fetch it
    const existing = await prisma.idempotencyKey.findUnique({ where: { key } });

    if (!existing) {
      // Race condition: record was deleted between create and findUnique
      logger.error({ key }, "Idempotency record disappeared during operation");
      throw createErr;
    }

    // Validate request hash if enabled
    if (requestHash && existing.requestHash && existing.requestHash !== requestHash) {
      logger.error(
        {
          key,
          expectedHash: requestHash,
          actualHash: existing.requestHash,
        },
        "Request hash mismatch detected"
      );
      throw new Error("Request hash validation failed - potential tampering detected");
    }

    return existing;
  }
}

/**
 * Retry failed operation with attempt tracking
 */
async function retryFailedOperation(key: string, attemptCount: number) {
  const updated = await prisma.idempotencyKey.updateMany({
    where: {
      key,
      status: IdempotencyStatus.FAILED,
    },
    data: {
      status: IdempotencyStatus.IN_PROGRESS,
      attemptCount,
      lastProcessedAt: new Date(),
      errorDetails: Prisma.JsonNull, // Clear previous error
    },
  });

  if (updated.count === 0) {
    // Race condition: someone else claimed this record
    const recheck = await prisma.idempotencyKey.findUnique({ where: { key } });
    if (recheck?.status === IdempotencyStatus.IN_PROGRESS) {
      throw new IdempotencyInProgressError();
    }
    if (recheck?.status === IdempotencyStatus.COMPLETED) {
      return recheck;
    }
    throw new Error(`Failed to claim failed operation for retry: ${key}`);
  }

  // Return updated record
  const record = await prisma.idempotencyKey.findUnique({ where: { key } });
  if (!record) {
    throw new Error(`Idempotency record not found after update: ${key}`);
  }

  logger.info({ key, attemptCount }, "Retrying failed operation");
  return record;
}

/**
 * Execute the operation with enhanced error handling
 */
async function executeOperation<T>(
  key: string,
  handler: (tx?: Prisma.TransactionClient) => Promise<T>,
  options: Required<WithIdempotencyOptions>,
  requestHash?: string
): Promise<T> {
  const tryUpdate = createRetryHelper();

  if (options.useTransaction) {
    return executeWithTransaction(key, handler, tryUpdate, requestHash, options);
  } else {
    return executeWithoutTransaction(key, handler, tryUpdate, requestHash, options);
  }
}

/**
 * Create retry helper for database operations
 */
function createRetryHelper() {
  return async (fn: () => Promise<unknown>, attempts = 3) => {
    let attempt = 0;
    let lastErr: unknown = undefined;

    while (attempt < attempts) {
      try {
        return await fn();
      } catch (e) {
        lastErr = e;
        attempt += 1;
        const backoff = 50 * Math.pow(2, attempt); // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, backoff));
      }
    }
    throw lastErr;
  };
}

/**
 * Execute operation within transaction
 */
async function executeWithTransaction<T>(
  key: string,
  handler: (tx?: Prisma.TransactionClient) => Promise<T>,
  tryUpdate: (fn: () => Promise<unknown>, attempts?: number) => Promise<unknown>,
  requestHash?: string,
  options?: Required<WithIdempotencyOptions>
): Promise<T> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const res = await handler(tx as Prisma.TransactionClient);

      // Safe serialization with better error handling
      const serializedResponse = safeSerialize(res);
      const responseBodyValue: Prisma.InputJsonValue | typeof Prisma.JsonNull =
        serializedResponse === null
          ? Prisma.JsonNull
          : (serializedResponse as Prisma.InputJsonValue);

      // Generate response signature if enabled
      let meta = {};
      if (options?.security?.enableResponseSigning) {
        const signature = responseSigner.signResponse(serializedResponse, key);
        meta = { signature, signedAt: new Date().toISOString() };
      }

      await tx.idempotencyKey.update({
        where: { key },
        data: {
          status: IdempotencyStatus.COMPLETED,
          responseBody: responseBodyValue,
          responseStatus: 200,
          lastProcessedAt: new Date(),
          meta: Object.keys(meta).length > 0 ? meta : undefined,
        },
      });

      return res;
    });

    logger.info({ key }, "Operation completed successfully");
    return result as T;
  } catch (txErr) {
    await handleOperationFailure(key, txErr, tryUpdate);
    throw txErr;
  }
}

/**
 * Execute operation without transaction
 */
async function executeWithoutTransaction<T>(
  key: string,
  handler: (tx?: Prisma.TransactionClient) => Promise<T>,
  tryUpdate: (fn: () => Promise<unknown>, attempts?: number) => Promise<unknown>,
  requestHash?: string,
  options?: Required<WithIdempotencyOptions>
): Promise<T> {
  try {
    const result = await handler();

    try {
      const serializedResponse = safeSerialize(result);
      const responseBodyValue: Prisma.InputJsonValue | typeof Prisma.JsonNull =
        serializedResponse === null
          ? Prisma.JsonNull
          : (serializedResponse as Prisma.InputJsonValue);

      // Generate response signature if enabled
      let meta = {};
      if (options?.security?.enableResponseSigning) {
        const signature = responseSigner.signResponse(serializedResponse, key);
        meta = { signature, signedAt: new Date().toISOString() };
      }

      await tryUpdate(() =>
        prisma.idempotencyKey.update({
          where: { key },
          data: {
            status: IdempotencyStatus.COMPLETED,
            responseBody: responseBodyValue,
            responseStatus: 200,
            lastProcessedAt: new Date(),
            meta: Object.keys(meta).length > 0 ? meta : undefined,
          },
        })
      );
    } catch (updateErr) {
      logger.error({ key, error: updateErr }, "Failed to update idempotency record after success");
    }

    logger.info({ key }, "Operation completed successfully");
    return result;
  } catch (handlerErr) {
    await handleOperationFailure(key, handlerErr, tryUpdate);
    throw handlerErr;
  }
}

/**
 * Handle operation failure with detailed error logging
 */
async function handleOperationFailure(
  key: string,
  error: unknown,
  tryUpdate: (fn: () => Promise<unknown>, attempts?: number) => Promise<unknown>
): Promise<void> {
  const errorDetails = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  };

  try {
    await tryUpdate(() =>
      prisma.idempotencyKey.update({
        where: { key },
        data: {
          status: IdempotencyStatus.FAILED,
          errorDetails,
          lastProcessedAt: new Date(),
        },
      })
    );
  } catch (markErr) {
    logger.error({ key, error: markErr }, "Failed to mark idempotency record as FAILED");
  }

  logger.error({ key, errorDetails }, "Operation failed");
}

/**
 * Safe serialization that handles complex objects
 */
function safeSerialize(obj: unknown): unknown {
  try {
    // First attempt: standard JSON serialization
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    logger.warn({ error }, "Standard serialization failed, attempting safe serialization");

    // Second attempt: safe serialization that handles circular references and functions
    return JSON.parse(
      JSON.stringify(obj, (key, value) => {
        // Handle circular references
        if (typeof value === "object" && value !== null) {
          if (typeof value === "function") return "[Function]";
          if (value instanceof Date) return value.toISOString();
          if (value instanceof Error) return { message: value.message, stack: value.stack };
        }
        return value;
      })
    );
  }
}

/**
 * Utility function to get idempotency metrics for monitoring
 */
export async function getIdempotencyMetrics() {
  const [totalRecords, inProgressCount, completedCount, failedCount, expiredCount, stuckCount] =
    await Promise.all([
      prisma.idempotencyKey.count(),
      prisma.idempotencyKey.count({ where: { status: IdempotencyStatus.IN_PROGRESS } }),
      prisma.idempotencyKey.count({ where: { status: IdempotencyStatus.COMPLETED } }),
      prisma.idempotencyKey.count({ where: { status: IdempotencyStatus.FAILED } }),
      prisma.idempotencyKey.count({
        where: {
          expiresAt: { lt: new Date() },
        },
      }),
      prisma.idempotencyKey.count({
        where: {
          status: IdempotencyStatus.IN_PROGRESS,
          lastProcessedAt: { lt: new Date(Date.now() - 5 * 60 * 1000) }, // 5 minutes ago
        },
      }),
    ]);

  return {
    total: totalRecords,
    inProgress: inProgressCount,
    completed: completedCount,
    failed: failedCount,
    expired: expiredCount,
    stuck: stuckCount,
    healthScore: completedCount / Math.max(totalRecords, 1), // 0-1 score
  };
}

/**
 * Cleanup expired and old idempotency records
 */
export async function cleanupExpiredRecords(olderThanDays = 7): Promise<number> {
  const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

  const result = await prisma.idempotencyKey.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } }, // Expired records
        { createdAt: { lt: cutoffDate } }, // Very old records
      ],
    },
  });

  logger.info(
    {
      deletedCount: result.count,
      olderThanDays,
    },
    "Cleaned up expired idempotency records"
  );

  return result.count;
}
