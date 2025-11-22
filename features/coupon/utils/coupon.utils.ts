import type { CouponType } from "../types";

/**
 * Calculate discount amount based on coupon type
 */
export function calculateDiscount(
  couponValue: number,
  couponType: CouponType,
  cartTotal: number,
  maxDiscount?: number | null
): number {
  let discountAmount = 0;

  switch (couponType) {
    case "PERCENTAGE":
      discountAmount = (cartTotal * couponValue) / 100;
      if (maxDiscount) {
        discountAmount = Math.min(discountAmount, maxDiscount);
      }
      break;

    case "FIXED":
      discountAmount = Math.min(couponValue, cartTotal);
      break;

    case "FREE_SHIPPING":
      discountAmount = 0; // Handled separately in shipping calculation
      break;

    default:
      discountAmount = 0;
  }

  return Math.round(discountAmount * 100) / 100;
}

/**
 * Format coupon discount for display
 */
export function formatCouponDiscount(
  type: CouponType,
  value: number,
  currency: string = "USD"
): string {
  switch (type) {
    case "PERCENTAGE":
      return `${value}% OFF`;
    case "FIXED":
      return `${currency} ${value.toFixed(2)} OFF`;
    case "FREE_SHIPPING":
      return "FREE SHIPPING";
    default:
      return "";
  }
}

/**
 * Check if coupon is valid by date
 */
export function isCouponDateValid(
  startsAt?: Date | null,
  endsAt?: Date | null
): { isValid: boolean; error?: string } {
  const now = new Date();

  if (startsAt && startsAt > now) {
    return {
      isValid: false,
      error: "This coupon is not yet valid",
    };
  }

  if (endsAt && endsAt < now) {
    return {
      isValid: false,
      error: "This coupon has expired",
    };
  }

  return { isValid: true };
}

/**
 * Check if coupon usage limit is reached
 */
export function isCouponUsageLimitReached(usedCount: number, usageLimit?: number | null): boolean {
  if (!usageLimit) return false;
  return usedCount >= usageLimit;
}
