/**
 * ═══════════════════════════════════════════════════════════════
 * GET /api/checkout/addresses - List user addresses
 * POST /api/checkout/addresses - Create new address
 * ═══════════════════════════════════════════════════════════════
 */

import { auth } from "@/auth";
import { getUserAddresses, addUserAddress } from "@/features/checkout/services/address.service";
import { addressSchema } from "@/features/checkout/validations/address.schema";
import { UnauthorizedError } from "@/shared/lib/errors/core/AppError";
import { ERROR_CODES } from "@/shared/lib/errors/core/error-codes";
import { fail } from "@/shared/lib/errors/core/result";
import { withApiRoute } from "@/shared/lib/errors/handlers/api";

/**
 * GET - List all addresses for authenticated user
 */
export const GET = withApiRoute(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthorizedError("Please sign in to view addresses");
  }

  return await getUserAddresses(session.user.id);
});

/**
 * POST - Create new address
 */
export const POST = withApiRoute(async (request: Request) => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthorizedError("Please sign in to create address");
  }

  const body = await request.json();

  // Validate request body
  const validation = addressSchema.safeParse(body);
  if (!validation.success) {
    const flattened = validation.error.flatten().fieldErrors;
    const fieldErrors: Record<string, string> = Object.fromEntries(
      Object.entries(flattened).map(([k, v]) => [k, (v || []).join(", ")])
    );
    return fail({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "Validation failed",
      status: 422,
      fieldErrors,
      timestamp: new Date().toISOString(),
    });
  }

  return await addUserAddress(session.user.id, validation.data);
});
