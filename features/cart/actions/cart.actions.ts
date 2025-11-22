"use server";

import { NextRequest } from "next/server";
import { getCartContext } from "../services/cart-context.service";
import { transformCart, transformCartItem } from "../services/cart-transform.service";
import { getCartWithItems, addItemToCart } from "../services/cart.service";

/**
 * Cart Actions
 * Server actions for cart operations
 */

export async function getCartAction(request: NextRequest) {
  const cartContext = await getCartContext(request);
  const cart = await getCartWithItems(cartContext.cartId);
  return {
    cart: transformCart(cart),
    cartContext,
  };
}

export async function addItemToCartAction(
  request: NextRequest,
  input: { productId: string; variantId?: string | null; quantity: number }
) {
  const cartContext = await getCartContext(request);
  const cartItem = await addItemToCart(cartContext.cartId, input);
  const cart = await getCartWithItems(cartContext.cartId);

  return {
    item: transformCartItem(cartItem),
    cart: transformCart(cart),
    cartContext,
  };
}
