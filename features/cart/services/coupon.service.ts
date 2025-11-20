import { Decimal } from "@prisma/client/runtime/library";
import type { CartItem as PrismaCartItem } from "@/app/generated/prisma";
import { NotFoundError, ValidationError } from "@/shared/lib/errors/server";
import { parseDecimal, formatPrice } from "@/shared/lib/utils/formatters";
import * as couponRepo from "../repositories/coupon.repository";
import { getCartWithItems } from "./cart.service";

/**
 * Coupon Service
 *
 * Handles coupon validation and application logic.
 *
 * Key Features:
 * - Validate coupon codes against business rules
 * - Calculate discounts based on coupon type
 * - Apply/remove coupons to/from carts
 * - Track coupon usage (TODO: implement per-user tracking)
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
  // Find coupon by code
  const coupon = await couponRepo.findCouponByCode(code);

  if (!coupon) {
    return {
      isValid: false,
      error: `Coupon code "${code.toUpperCase()}" not found`,
    };
  }

  // Check if coupon is active
  if (!coupon.isActive) {
    return {
      isValid: false,
      error: "This coupon is no longer active",
    };
  }

  // Check start date
  if (coupon.startsAt && coupon.startsAt > new Date()) {
    return {
      isValid: false,
      error: "This coupon is not yet valid",
    };
  }

  // Check end date
  if (coupon.endsAt && coupon.endsAt < new Date()) {
    return {
      isValid: false,
      error: "This coupon has expired",
    };
  }

  // Check minimum order amount
  const minOrderAmount = parseDecimal(coupon.minOrderAmount);
  if (coupon.minOrderAmount && cartTotal < minOrderAmount) {
    return {
      isValid: false,
      error: `Minimum order amount of ${formatPrice(minOrderAmount)} required`,
    };
  }

  // Check global usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return {
      isValid: false,
      error: "This coupon has reached its usage limit",
    };
  }

  // Check per-customer usage limit (if user is authenticated)
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

/**
 * Apply coupon to cart and calculate new totals
 */
export async function applyCouponToCart(
  cartId: string,
  couponCode: string,
  userId?: string | null
): Promise<CouponApplicationResult> {
  // Get cart with items
  const cart = await getCartWithItems(cartId);

  // Calculate cart total
  const items = (cart.items ?? []) as PrismaCartItem[];
  const cartTotal = items.reduce(
    (sum: number, item: PrismaCartItem) => sum + parseDecimal(item.totalPrice),
    0
  );

  // Validate coupon
  const validation = await validateCoupon(couponCode, cartTotal, userId);

  if (!validation.isValid || !validation.coupon) {
    throw new ValidationError(validation.error || "Invalid coupon");
  }

  const { coupon } = validation;

  // Calculate discount
  const discountAmount = calculateDiscount(
    coupon.value,
    coupon.type,
    cartTotal,
    coupon.maxDiscount
  );

  // Calculate new total
  const newTotal = Math.max(0, (cartTotal as number) - discountAmount);

  return {
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      discountAmount,
    },
    subtotal: cartTotal as number,
    discountAmount,
    total: newTotal,
  };
}

/**
 * Remove coupon from cart and recalculate totals
 */
export async function removeCouponFromCart(cartId: string) {
  const cart = await getCartWithItems(cartId);
  const items = (cart.items ?? []) as PrismaCartItem[];
  const cartTotal = items.reduce(
    (sum: number, item: PrismaCartItem) => sum + parseFloat(item.totalPrice.toString()),
    0
  );

  return {
    subtotal: cartTotal as number,
    discountAmount: 0,
    total: cartTotal,
  };
}
