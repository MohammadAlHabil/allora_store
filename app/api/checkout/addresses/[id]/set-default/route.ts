/**
 * ═══════════════════════════════════════════════════════════════
 * POST /api/checkout/addresses/[id]/set-default - Set default address
 * ═══════════════════════════════════════════════════════════════
 */

import { auth } from "@/auth";
import { setUserDefaultAddress } from "@/features/checkout/services/address.service";
import { UnauthorizedError } from "@/shared/lib/errors/core/AppError";
import { withApiRoute } from "@/shared/lib/errors/handlers/api";

/**
 * POST - Set address as default
 */
export const POST = withApiRoute(async (request: Request, context: { params: { id: string } }) => {
  const { params } = context;

  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthorizedError("Please sign in to set default address");
  }

  return await setUserDefaultAddress(params.id, session.user.id);
});
