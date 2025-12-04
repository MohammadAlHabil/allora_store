import { NextRequest, NextResponse } from "next/server";
import { cleanupExpiredAnonymousCarts } from "@/features/cart/services/cart-cleanup.service";
import { ADMIN_TASKS_SECRET } from "@/shared/constants/constant";
import { ok, fail } from "@/shared/lib/errors";
import { ERROR_CODES } from "@/shared/lib/errors/core/error-codes";
import { withApiRoute } from "@/shared/lib/errors/handlers/api";
// IP allowlist helper intentionally not imported to allow CI runners to call this endpoint.

/**
 * POST /api/admin/tasks/cleanup
 * Run cart cleanup from CI without DB credentials
 */
export const POST = withApiRoute(async (request: Request) => {
  const req = request as unknown as NextRequest;

  const authHeader = req.headers.get("authorization");
  const adminSecret = ADMIN_TASKS_SECRET || process.env.CRON_SECRET;

  if (!adminSecret) {
    const err = {
      code: ERROR_CODES.FORBIDDEN,
      message: "Admin tasks disabled",
      status: 403,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(fail(err), { status: 403 });
  }

  if (authHeader !== `Bearer ${adminSecret}`) {
    const err = {
      code: ERROR_CODES.UNAUTHORIZED,
      message: "Unauthorized",
      status: 401,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(fail(err), { status: 401 });
  }

  // IP allowlist removed to allow GitHub Actions runners to call this endpoint.
  // Audit log: record request summary (mask sensitive headers)
  try {
    const callerIp = req.headers.get("x-forwarded-for") || "unknown";
    const maskedAuth = authHeader ? "Bearer ***" : "none";
    console.info(new Date().toISOString(), "[Admin Cleanup] request", {
      callerIp,
      auth: maskedAuth,
    });
  } catch (logErr) {
    console.warn("[Admin Cleanup] failed to write audit log:", logErr);
  }

  const result = await cleanupExpiredAnonymousCarts();

  return ok({ ...result, message: `Cleaned up ${result.deletedCount} expired anonymous cart(s)` });
});
