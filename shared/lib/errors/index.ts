/**
 * ═══════════════════════════════════════════════════════════════
 * ALLORA STORE - ERROR HANDLING SYSTEM (CLIENT-SAFE)
 * ═══════════════════════════════════════════════════════════════
 * Core error handling types and utilities safe for client-side use
 *
 * For server-only handlers (repository, service, action, api),
 * use: import { ... } from '@/shared/lib/errors/server'
 */

// ========== Core Types & Builders ==========
export * from "./core/result";
export * from "./core/types";
export * from "./core/error-codes";
export * from "./core/error-messages";

// ========== Error Classes ==========
export * from "./core/AppError";

// ========== Mappers ==========
export * from "./mappers/error-mapper";

// ========== Client Utilities ==========
export * from "./client";

// NOTE: Server handlers (repository, service, action, api) are NOT exported here
// to avoid bundling Prisma client into browser code.
// Import from '@/shared/lib/errors/server' for server-side code.
