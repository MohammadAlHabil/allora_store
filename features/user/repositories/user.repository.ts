import type { OrderStatus } from "@/app/generated/prisma";
import prisma from "@/shared/lib/prisma";
import type { UpdateProfileData, UserStats, UserProfile } from "../types/user.types";

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      emailVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: UpdateProfileData
): Promise<UserProfile> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      emailVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

/**
 * Get user statistics for profile dashboard
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const [orders, addresses, wishlist] = await Promise.all([
    // Orders stats
    prisma.order.aggregate({
      where: { userId },
      _count: true,
    }),
    // Addresses count
    prisma.address.count({
      where: { userId },
    }),
    // Wishlist items count
    prisma.wishlistItem.count({
      where: { userId },
    }),
  ]);

  // Get orders breakdown
  const [pendingOrders, completedOrders, totalSpent] = await Promise.all([
    prisma.order.count({
      where: {
        userId,
        status: {
          in: ["PENDING_PAYMENT" as OrderStatus, "PAID" as OrderStatus],
        },
      },
    }),
    prisma.order.count({
      where: {
        userId,
        status: "FULFILLED" as OrderStatus,
      },
    }),
    prisma.order.aggregate({
      where: {
        userId,
        status: {
          in: ["PAID" as OrderStatus, "FULFILLED" as OrderStatus],
        },
      },
      _sum: {
        total: true,
      },
    }),
  ]);

  return {
    totalOrders: orders._count,
    pendingOrders,
    completedOrders,
    totalSpent: Number(totalSpent._sum.total || 0),
    savedAddresses: addresses,
    wishlistItems: wishlist,
  };
}

/**
 * Update user password
 */
export async function updateUserPasswordInDb(
  userId: string,
  hashedPassword: string
): Promise<UserProfile> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      emailVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

/**
 * Get user with password for verification
 */
export async function getUserWithPassword(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}
