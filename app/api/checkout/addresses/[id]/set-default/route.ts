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
export const POST = withApiRoute(async (request: Request, ctx?: Record<string, unknown>) => {
  const params =
    ctx && typeof ctx === "object" && "params" in ctx
      ? ((ctx as { params?: { id: string } }).params ?? {})
      : {};

  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthorizedError("Please sign in to set default address");
  }

  const id = (params as { id?: string }).id;
  return await setUserDefaultAddress(id!, session.user.id);
});
