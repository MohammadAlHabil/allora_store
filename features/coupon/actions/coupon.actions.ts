"use server";

import type { CouponApplicationResult } from "../types";

/**
 * Coupon Actions
 * Server actions for coupon operations
 */

/**
 * Apply coupon to cart (client-side API call)
 * This is kept for backward compatibility with existing hooks
 */
export async function applyCoupon(code: string): Promise<CouponApplicationResult> {
  const response = await fetch("/api/cart/apply-coupon", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error?.message || "Failed to apply coupon");
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error?.message || "Failed to apply coupon");
  }

  return data.data;
}

/**
 * Remove coupon from cart
 */
export async function removeCoupon(): Promise<{
  subtotal: number;
  discountAmount: number;
  total: number;
  message: string;
}> {
  const response = await fetch("/api/cart/apply-coupon", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ action: "remove" }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error?.message || "Failed to remove coupon");
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error?.message || "Failed to remove coupon");
  }

  return data.data;
}
