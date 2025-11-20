import { Decimal } from "@prisma/client/runtime/library";
import { parseDecimal, formatPrice } from "@/shared/lib/utils/formatters";
import * as couponRepo from "../repositories/coupon.repository";
import { NotFoundError, ValidationError } from "@/shared/lib/utils/errors";

/**
 * Coupon Service
 * Business logic for coupon operations
 */

type CouponValidationResult = {
  isValid: boolean;
  error?: string;
  coupon?: {
    id: string;
    code: string;
    type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
    value: Decimal;
    maxDiscount: Decimal | null;
    currency: string | null;
  };
};

type CouponApplicationResult = {
  coupon: {
    id: string;
    code: string;
    type: string;
    discountAmount: number;
  };
  subtotal: number;
  discountAmount: number;
  total: number;
};

/**
 * Validate coupon code against all business rules
 */
export async function validateCoupon(
  code: string,
  cartTotal: number,
  userId?: string | null
): Promise<CouponValidationResult> {
  const coupon = await couponRepo.findCouponByCode(code);

  if (!coupon) {
    return {
      isValid: false,
      error: `Coupon code "${code.toUpperCase()}" not found`,
    };
  }

  if (!coupon.isActive) {
    return {
      isValid: false,
      error: "This coupon is no longer active",
    };
  }

  if (coupon.startsAt && coupon.startsAt > new Date()) {
    return {
      isValid: false,
      error: "This coupon is not yet valid",
    };
  }

  if (coupon.endsAt && coupon.endsAt < new Date()) {
    return {
      isValid: false,
      error: "This coupon has expired",
    };
  }

  const minOrderAmount = parseDecimal(coupon.minOrderAmount);
  if (coupon.minOrderAmount && cartTotal < minOrderAmount) {
    return {
      isValid: false,
      error: `Minimum order amount of ${formatPrice(minOrderAmount)} required`,
    };
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return {
      isValid: false,
      error: "This coupon has reached its usage limit",
    };
  }

  if (userId && coupon.perCustomerLimit) {
    // TODO: Implement per-user coupon usage tracking
  }

  return {
    isValid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount,
      currency: coupon.currency,
    },
  };
}

/**
 * Calculate discount amount based on coupon type
 */
function calculateDiscount(
  couponValue: Decimal,
  couponType: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING",
  cartTotal: number,
  maxDiscount?: Decimal | null
): number {
  const value = parseDecimal(couponValue);
  let discountAmount = 0;

  switch (couponType) {
    case "PERCENTAGE":
      discountAmount = (cartTotal * value) / 100;
      if (maxDiscount) {
        const max = parseDecimal(maxDiscount);
        discountAmount = Math.min(discountAmount, max);
      }
      break;

    case "FIXED":
      discountAmount = Math.min(value, cartTotal);
      break;

    case "FREE_SHIPPING":
      discountAmount = 0;
      break;

    default:
      discountAmount = 0;
  }

  return Math.round(discountAmount * 100) / 100;
}
