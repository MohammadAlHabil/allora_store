import { NextRequest, NextResponse } from "next/server";
import { cleanupExpiredAnonymousCarts } from "@/features/cart/services";
import { ok, fail } from "@/shared/lib/errors";
import { ERROR_CODES } from "@/shared/lib/errors/core/error-codes";
import { withApiRoute } from "@/shared/lib/errors/handlers/api";

/**
 * POST /api/cart/cleanup
 * Cleanup expired anonymous carts
 */
export const POST = withApiRoute(async (request: Request) => {
  const req = request as unknown as NextRequest;

  // Security: Verify this is a cron request
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || process.env.CLEANUP_SECRET;

  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      const err = {
        code: ERROR_CODES.UNAUTHORIZED,
        message: "Unauthorized",
        status: 401,
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(fail(err), { status: 401 });
    }
  }

  const result = await cleanupExpiredAnonymousCarts();

  return ok({
    ...result,
    message: `Cleaned up ${result.deletedCount} expired anonymous cart(s)`,
  });
});
