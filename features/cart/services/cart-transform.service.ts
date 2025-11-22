/**
 * Cart Transform Service
 * Transforms cart data for API responses
 */

/**
 * Transform cart item for API response
 */
import type { Cart, CartItem } from "@/app/generated/prisma";

// Local helper types to represent optional relations returned by Prisma when include is used
type ProductImage = { url?: string } | undefined;
type ProductWithImages = { images?: ProductImage[]; slug: string } | undefined;
type CartItemWithProduct = CartItem & { product?: ProductWithImages };
type CartWithItems = Cart & { items?: CartItemWithProduct[] };

/**
 * Transform cart item for API response
 */
export function transformCartItem(item: CartItem) {
  // Get first product image if available (guarding optional relation)
  const productImage = (item as CartItemWithProduct).product?.images?.[0]?.url || null;

  return {
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    sku: item.sku,
    title: item.title,
    slug: (item as CartItemWithProduct).product?.slug || "",
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
  const items = (cart as CartWithItems).items?.map(transformCartItem) || [];

  return {
    id: cart.id,
    userId: cart.userId,
    expiresAt: cart.expiresAt,
    items,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
}
