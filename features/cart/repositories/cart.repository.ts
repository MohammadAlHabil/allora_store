import type { Prisma } from "@/app/generated/prisma";
import prisma from "@/shared/lib/prisma";

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
      },
      variant: true,
    },
    orderBy: { createdAt: "asc" },
  },
} as const;

/**
 * Cart Repository
 * Handles all database operations for Cart model
 */

export async function findCartByUserId(userId: string) {
  return prisma.cart.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: cartInclude,
  });
}

export async function findCartByToken(token: string) {
  return prisma.cart.findUnique({
    where: { token },
    include: cartInclude,
  });
}

export async function findCartById(cartId: string) {
  return prisma.cart.findUnique({
    where: { id: cartId },
    include: cartInclude,
  });
}

export async function createCart(data: Prisma.CartCreateArgs["data"]) {
  return prisma.cart.create({
    data,
    include: cartInclude,
  });
}

export async function deleteCart(cartId: string) {
  return prisma.cart.delete({
    where: { id: cartId },
  });
}

export async function deleteExpiredAnonymousCarts() {
  const now = new Date();
  return prisma.cart.deleteMany({
    where: {
      userId: null,
      expiresAt: {
        not: null,
        lt: now,
      },
    },
  });
}
