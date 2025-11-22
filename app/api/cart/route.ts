import { NextRequest, NextResponse } from "next/server";
import {
  getCartContext,
  transformCart,
  transformCartItem,
  getCartWithItems,
  addItemToCart,
} from "@/features/cart/services";
import { ok, fail, ERROR_CODES } from "@/shared/lib/errors";
import type { ErrorDetails } from "@/shared/lib/errors/core/types";
import { withApiRoute } from "@/shared/lib/errors/handlers/api";
import { validateCartItemInput } from "@/shared/lib/utils/validation";

/**
 * GET /api/cart
 * Get current user's cart (authenticated or anonymous)
 */
export const GET = withApiRoute(async (request: Request) => {
  const req = request as unknown as NextRequest;
  const cartContext = await getCartContext(req);
  const cart = await getCartWithItems(cartContext.cartId);
  const response = ok(transformCart(cart));

  // If anonymous cart, set cookie with token (must return a Response)
  if (!cartContext.isAuthenticated && cartContext.cartToken) {
    const httpResponse = NextResponse.json(response);
    httpResponse.cookies.set("cart_token", cartContext.cartToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return httpResponse;
  }

  return response;
});

/**
 * POST /api/cart
 * Add item to cart
 */
export const POST = withApiRoute(async (request: Request) => {
  const req = request as unknown as NextRequest;
  const cartContext = await getCartContext(req);
  const body = await req.json();

  // Validate input
  const validation = validateCartItemInput(body);
  if (!validation.isValid) {
    const err: ErrorDetails = {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: validation.errors.join(", "),
      status: 422,
      timestamp: new Date().toISOString(),
    };
    return fail(err);
  }

  const { productId, variantId, quantity } = body;

  // Add item to cart
  const cartItem = await addItemToCart(cartContext.cartId, {
    productId,
    variantId: variantId || null,
    quantity,
  });

  // Get updated cart
  const cart = await getCartWithItems(cartContext.cartId);

  const response = ok({
    item: transformCartItem(cartItem),
    cart: transformCart(cart),
  });

  // If anonymous cart, set cookie with token (return Response)
  if (!cartContext.isAuthenticated && cartContext.cartToken) {
    const httpResponse = NextResponse.json(response);
    httpResponse.cookies.set("cart_token", cartContext.cartToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return httpResponse;
  }

  return response;
});
