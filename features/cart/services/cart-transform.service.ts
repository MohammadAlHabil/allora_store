/**
 * Cart Transform Service
 * Transforms cart data for API responses
 */

/**
 * Transform cart item for API response
 */
import type { Cart, CartItem } from "@/app/generated/prisma";

/**
 * Transform cart item for API response
 */
export function transformCartItem(item: CartItem) {
  // Get first product image if available
  const productImage = item.product?.images?.[0]?.url || null;

  return {
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    sku: item.sku,
    title: item.title,
    quantity: item.quantity,
    unitPrice: parseFloat(item.unitPrice.toString()),
    totalPrice: parseFloat(item.totalPrice.toString()),
    imageUrl: productImage,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

/**
 * Transform cart for API response
 */
export function transformCart(cart: Cart) {
  return {
    id: cart.id,
    userId: cart.userId,
    expiresAt: cart.expiresAt,
    items: cart.items.map(transformCartItem),
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
}
