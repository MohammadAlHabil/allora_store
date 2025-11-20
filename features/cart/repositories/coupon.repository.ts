import prisma from "@/shared/lib/prisma";

/**
 * Coupon Repository
 * Handles all database operations for Coupon model
 */

export async function findCouponByCode(code: string) {
  const normalized = code.trim();

  // Try a case-insensitive search to tolerate different stored formats
  // Prisma supports `mode: 'insensitive'` for string filters on supported DBs
  return prisma.coupon.findFirst({
    where: {
      code: {
        equals: normalized,
        mode: "insensitive",
      },
    },
  });
}

export async function findCouponById(couponId: string) {
  return prisma.coupon.findUnique({
    where: { id: couponId },
  });
}
