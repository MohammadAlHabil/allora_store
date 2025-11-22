/**
 * ═══════════════════════════════════════════════════════════════
 * POST /api/checkout/shipping-methods/select - Select shipping method
 * ═══════════════════════════════════════════════════════════════
 */

import { auth } from "@/auth";
import {
  validateShippingMethodSelection,
  calculateShippingCost,
} from "@/features/checkout/services/shipping.service";
import { selectShippingMethodSchema } from "@/features/checkout/validations/shipping.schema";
import { ok } from "@/shared/lib/errors";
import { UnauthorizedError } from "@/shared/lib/errors/core/AppError";
import { ERROR_CODES } from "@/shared/lib/errors/core/error-codes";
import { fail } from "@/shared/lib/errors/core/result";
import { withApiRoute } from "@/shared/lib/errors/handlers/api";

/**
 * POST - Select a shipping method and calculate cost
 */
export const POST = withApiRoute(async (request: Request) => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthorizedError("Please sign in to select shipping method");
  }

  const body = await request.json();

  // Validate request body
  const validation = selectShippingMethodSchema.safeParse(body);

  if (!validation.success) {
    return fail({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "Invalid shipping method selection",
      status: 400,
      timestamp: new Date().toISOString(),
      details: validation.error.issues,
    });
  }

  const { addressId, shippingMethodId } = validation.data;

  // Validate the selection (check country availability)
  const validationResult = await validateShippingMethodSelection(
    shippingMethodId,
    addressId,
    session.user.id
  );

  if (!validationResult.success) {
    return validationResult;
  }

  // Calculate the shipping cost
  const costResult = await calculateShippingCost(shippingMethodId, addressId, session.user.id);

  if (!costResult.success) {
    return costResult;
  }

  // Return both validation and cost calculation
  return ok({
    method: validationResult.data.method,
    cost: costResult.data,
  });
});
