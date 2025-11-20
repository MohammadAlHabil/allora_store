import { TAX_RATE, FREE_SHIPPING_THRESHOLD } from "../constants";
import type { OrderSummary, ShippingMethod } from "../types";

/**
 * Calculate order summary with all fees
 */
export function calculateOrderSummary(
  subtotal: number,
  discount: number,
  shippingMethod: ShippingMethod | null,
  couponCode?: string
): OrderSummary {
  // Apply free shipping if threshold is met
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : shippingMethod?.price || 0;

  // Calculate subtotal after discount
  const subtotalAfterDiscount = Math.max(0, subtotal - discount);

  // Calculate tax on subtotal after discount
  const tax = subtotalAfterDiscount * TAX_RATE;

  // Calculate final total
  const total = subtotalAfterDiscount + shippingCost + tax;

  return {
    subtotal,
    discount,
    shipping: shippingCost,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    itemCount: 0, // Will be set from cart
    couponCode,
  };
}

/**
 * Format order number
 */
export function formatOrderNumber(orderNumber: string): string {
  return `#${orderNumber}`;
}

/**
 * Check if free shipping is available
 */
export function isFreeShippingAvailable(subtotal: number): boolean {
  return subtotal >= FREE_SHIPPING_THRESHOLD;
}

/**
 * Calculate amount needed for free shipping
 */
export function getAmountForFreeShipping(subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  return FREE_SHIPPING_THRESHOLD - subtotal;
}

/**
 * Format address for display
 */
export function formatAddress(address: {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}): string {
  return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
}

/**
 * Get checkout progress percentage
 */
export function getCheckoutProgress(currentStep: string): number {
  const steps = ["address", "shipping", "payment", "review", "confirmation"];
  const currentIndex = steps.indexOf(currentStep);
  return ((currentIndex + 1) / steps.length) * 100;
}

/**
 * Validate if user can proceed to checkout
 */
export function canProceedToCheckout(
  isAuthenticated: boolean,
  cartItemCount: number
): {
  canProceed: boolean;
  reason?: string;
} {
  if (!isAuthenticated) {
    return {
      canProceed: false,
      reason: "Please sign in to proceed with checkout",
    };
  }

  if (cartItemCount === 0) {
    return {
      canProceed: false,
      reason: "Your cart is empty. Please add items before checkout.",
    };
  }

  return { canProceed: true };
}
