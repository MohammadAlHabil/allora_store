import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  mergeCartIntoUser,
  findAnonymousCartByToken,
  transformCart,
} from "@/features/cart/services";
import { ok } from "@/shared/lib/errors";
import { withApiRoute } from "@/shared/lib/errors/handlers/api";

/**
 * POST /api/cart/merge
 * Merge anonymous cart into authenticated user's cart
 * Called after user logs in
 */
export const POST = withApiRoute(async (request: Request) => {
  const req = request as unknown as NextRequest;

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("User must be authenticated to merge cart");
  }

  // Get anonymous cart token from cookie or header
  const cookieToken = req.cookies.get("cart_token")?.value;
  const headerToken = req.headers.get("x-cart-token");
  const token = cookieToken || headerToken;

  if (!token) {
    return ok({ message: "No anonymous cart to merge", merged: false });
  }

  // Find anonymous cart by token
  const anonymousCart = await findAnonymousCartByToken(token);
  if (!anonymousCart || anonymousCart.items.length === 0) {
    return ok({ message: "No items in anonymous cart to merge", merged: false });
  }

  // Merge anonymous cart into user cart
  const mergedCart = await mergeCartIntoUser(anonymousCart.id, session.user.id);

  const response = ok({
    message: "Cart merged successfully",
    merged: true,
    cart: transformCart(mergedCart),
  });

  // Clear the anonymous cart token cookie
  const httpResponse = NextResponse.json(response);
  httpResponse.cookies.delete("cart_token");

  return httpResponse;
});
