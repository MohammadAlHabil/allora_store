/**
 * ═══════════════════════════════════════════════════════════════
 * PUT /api/checkout/addresses/[id] - Update address
 * DELETE /api/checkout/addresses/[id] - Delete address
 * ═══════════════════════════════════════════════════════════════
 */

import { auth } from "@/auth";
import { updateUserAddress, deleteUserAddress } from "@/features/checkout/services/address.service";
import { updateAddressSchema } from "@/features/checkout/validations/address.schema";
import { UnauthorizedError } from "@/shared/lib/errors/core/AppError";
import { ERROR_CODES } from "@/shared/lib/errors/core/error-codes";
import { fail } from "@/shared/lib/errors/core/result";
import { withApiRoute } from "@/shared/lib/errors/handlers/api";

/**
 * PUT - Update existing address
 */
export const PUT = withApiRoute(async (request: Request, ctx?: Record<string, unknown>) => {
  const params =
    ctx && typeof ctx === "object" && "params" in ctx
      ? ((ctx as { params?: Promise<{ id: string }> | { id: string } }).params ?? {})
      : {};
  const resolvedParams = (await Promise.resolve(params)) as { id: string };
  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthorizedError("Please sign in to update address");
  }

  const body = await request.json();

  // Validate request body (partial update)
  const validation = updateAddressSchema.safeParse(body);
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

  return await updateUserAddress(resolvedParams.id, session.user.id, validation.data);
});

/**
 * DELETE - Delete address
 */
export const DELETE = withApiRoute(async (request: Request, ctx?: Record<string, unknown>) => {
  const params =
    ctx && typeof ctx === "object" && "params" in ctx
      ? ((ctx as { params?: Promise<{ id: string }> | { id: string } }).params ?? {})
      : {};
  const resolvedParams = (await Promise.resolve(params)) as { id: string };
  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthorizedError("Please sign in to delete address");
  }

  return await deleteUserAddress(resolvedParams.id, session.user.id);
});
