/**
 * ═══════════════════════════════════════════════════════════════
 * GET /api/checkout/shipping-methods - Get available shipping methods
 * ═══════════════════════════════════════════════════════════════
 */

import { auth } from "@/auth";
import { getAvailableShippingMethods } from "@/features/checkout/services/shipping.service";
import { UnauthorizedError } from "@/shared/lib/errors/core/AppError";
import { ERROR_CODES } from "@/shared/lib/errors/core/error-codes";
import { fail } from "@/shared/lib/errors/core/result";
import { withApiRoute } from "@/shared/lib/errors/handlers/api";

/**
 * GET - Get available shipping methods for an address
 * Query params: ?addressId=xxx
 */
export const GET = withApiRoute(async (request: Request) => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthorizedError("Please sign in to view shipping methods");
  }

  // Get addressId from query params
  const { searchParams } = new URL(request.url);
  const addressId = searchParams.get("addressId");

  if (!addressId) {
    return fail({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "addressId query parameter is required",
      status: 400,
      timestamp: new Date().toISOString(),
    });
  }

  return await getAvailableShippingMethods(addressId, session.user.id);
});
