import prisma from "@/shared/lib/prisma";

/**
 * Coupon Repository
 * Handles all database operations for Coupon model
 */

export async function findCouponByCode(code: string) {
  return prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });
}

export async function findCouponById(couponId: string) {
  return prisma.coupon.findUnique({
    where: { id: couponId },
  });
}
