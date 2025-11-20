import { NextRequest, NextResponse } from "next/server";
import { getCartContext, applyCouponToCart, removeCouponFromCart } from "@/features/cart/services";
import { ok, fail, ERROR_CODES } from "@/shared/lib/errors";
import { withApiRoute } from "@/shared/lib/errors/handlers/api";
import { isValidCouponCode, sanitizeCouponCode } from "@/shared/lib/utils/validation";

/**
 * POST /api/cart/apply-coupon
 * Apply coupon code to cart
 */
export const POST = withApiRoute(async (request: NextRequest) => {
  const cartContext = await getCartContext(request);
  const body = await request.json();

  // Validate input
  const { code, action } = body;

  if (action === "remove") {
    // Remove coupon
    const result = await removeCouponFromCart(cartContext.cartId);
    const response = ok({
      ...result,
      message: "Coupon removed",
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
  }

  // Validate coupon code for apply action
  if (!code || typeof code !== "string") {
    const err = {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "Coupon code is required and must be a string",
      status: 422,
      timestamp: new Date().toISOString(),
    };
    return fail(err);
  }

  const sanitizedCode = sanitizeCouponCode(code);
  if (!isValidCouponCode(sanitizedCode)) {
    const err = {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "Invalid coupon code format",
      status: 422,
      timestamp: new Date().toISOString(),
    };
    return fail(err);
  }

  // Apply coupon
  const result = await applyCouponToCart(cartContext.cartId, sanitizedCode, null);

  const response = ok({
    ...result,
    message: "Coupon applied successfully",
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
