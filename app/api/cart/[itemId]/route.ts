import { NextRequest, NextResponse } from "next/server";
import {
  getCartContext,
  transformCartItem,
  transformCart,
  updateCartItem,
  removeCartItem,
  getCartWithItems,
} from "@/features/cart/services";
import { ok, fail, ERROR_CODES } from "@/shared/lib/errors";
import type { ErrorDetails } from "@/shared/lib/errors/core/types";
import { withApiRoute } from "@/shared/lib/errors/handlers/api";
import { validateQuantityUpdate } from "@/shared/lib/utils/validation";

/**
 * PUT /api/cart/:itemId
 * Update cart item quantity
 */
export const PUT = withApiRoute(async (request: Request, ctx?: Record<string, unknown>) => {
  const req = request as unknown as NextRequest;
  const params = await (ctx?.params ?? {});
  const { itemId } = params as { itemId: string };

  const cartContext = await getCartContext(req);
  const body = await req.json();

  // Validate input
  const validation = validateQuantityUpdate(body.quantity);
  if (!validation.isValid) {
    const err: ErrorDetails = {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: validation.error || "Invalid quantity",
      status: 422,
      timestamp: new Date().toISOString(),
    };
    return fail(err);
  }

  const { quantity } = body;

  // Update cart item
  const cartItem = await updateCartItem(itemId, cartContext.cartId, {
    quantity,
  });

  // Get updated cart
  const cart = await getCartWithItems(cartContext.cartId);

  const response = ok({
    item: transformCartItem(cartItem),
    cart: transformCart(cart),
  });

  // If anonymous cart, set cookie with token
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
 * DELETE /api/cart/:itemId
 * Remove item from cart
 */
export const DELETE = withApiRoute(async (request: Request, ctx?: Record<string, unknown>) => {
  const req = request as unknown as NextRequest;
  const params = await (ctx?.params ?? {});
  const { itemId } = params as { itemId: string };

  const cartContext = await getCartContext(req);

  // Remove cart item
  await removeCartItem(itemId, cartContext.cartId);

  // Get updated cart
  const cart = await getCartWithItems(cartContext.cartId);

  const response = ok({
    message: "Item removed from cart",
    cart: transformCart(cart),
  });

  // If anonymous cart, set cookie with token
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
