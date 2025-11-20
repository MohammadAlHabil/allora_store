import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { getOrCreateUserCart, getOrCreateAnonymousCart } from "./cart.service";

export type CartContext = {
  cartId: string;
  isAuthenticated: boolean;
  cartToken?: string; // Token for anonymous carts
};

/**
 * Get cart context (authenticated or anonymous)
 * Supports both authenticated users and anonymous visitors
 */
export async function getCartContext(request: NextRequest): Promise<CartContext> {
  const session = await auth();

  // Authenticated user - use user cart
  if (session?.user?.id) {
    const cart = await getOrCreateUserCart(session.user.id);
    return {
      cartId: cart.id,
      isAuthenticated: true,
    };
  }

  // Anonymous user - check for token in cookie or header
  const cookieToken = request.cookies.get("cart_token")?.value;
  const headerToken = request.headers.get("x-cart-token");

  const token = cookieToken || headerToken || undefined;
  const cart = await getOrCreateAnonymousCart(token);

  return {
    cartId: cart.id,
    isAuthenticated: false,
    cartToken: cart.token || undefined,
  };
}
