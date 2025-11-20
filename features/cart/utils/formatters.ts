/**
 * Cart-specific formatting utilities
 */

import { formatPrice, parseDecimal } from "@/shared/lib/utils/formatters";
import type { CartItemResponse, CartResponse } from "../types";

/**
 * Format cart item price
 */
export function formatCartItemPrice(item: CartItemResponse): string {
  return formatPrice(item.unitPrice);
}

/**
 * Format cart item total
 */
export function formatCartItemTotal(item: CartItemResponse): string {
  return formatPrice(item.totalPrice);
}

/**
 * Calculate cart subtotal
 */
export function calculateCartSubtotal(items: CartItemResponse[]): number {
  return items.reduce((sum, item) => sum + parseDecimal(item.totalPrice), 0);
}

/**
 * Calculate cart total with discount
 */
export function calculateCartTotal(
  items: CartItemResponse[],
  discount: number = 0,
  shipping: number = 0,
  tax: number = 0
): number {
  const subtotal = calculateCartSubtotal(items);
  return Math.max(0, subtotal - discount + shipping + tax);
}

/**
 * Format cart total
 */
export function formatCartTotal(total: number): string {
  return formatPrice(total);
}

/**
 * Get cart item count
 */
export function getCartItemCount(items: CartItemResponse[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Check if cart is empty
 */
export function isCartEmpty(items: CartItemResponse[]): boolean {
  return items.length === 0;
}

/**
 * Find item in cart by product and variant
 */
export function findCartItem(
  items: CartItemResponse[],
  productId: string,
  variantId: string | null = null
): CartItemResponse | undefined {
  return items.find((item) => item.productId === productId && item.variantId === variantId);
}
