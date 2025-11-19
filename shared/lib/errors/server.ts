/**
 * ═══════════════════════════════════════════════════════════════
 * SERVER-ONLY ERROR HANDLERS
 * ═══════════════════════════════════════════════════════════════
 * Import from this file only in server-side code (actions, services, repositories, API routes)
 */

// Re-export everything from main index
export * from "./index";

// Server-specific handlers
export * from "./handlers/repository";
export * from "./handlers/service";
export * from "./handlers/action";
export * from "./handlers/api";
