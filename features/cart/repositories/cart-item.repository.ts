import type { Prisma } from "@/app/generated/prisma";
import prisma from "@/shared/lib/prisma";

const cartItemInclude = {
  product: {
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
  },
  variant: true,
} as const;

/**
 * Cart Item Repository
 * Handles all database operations for CartItem model
 */

export async function findCartItemById(itemId: string) {
  return prisma.cartItem.findUnique({
    where: { id: itemId },
    include: cartItemInclude,
  });
}

export async function findCartItemByProductAndVariant(
  cartId: string,
  productId: string,
  variantId: string | null
) {
  return prisma.cartItem.findFirst({
    where: {
      cartId,
      productId,
      variantId: variantId || null,
    },
    include: cartItemInclude,
  });
}

export async function findCartItemsByCartId(cartId: string) {
  return prisma.cartItem.findMany({
    where: { cartId },
    include: cartItemInclude,
    orderBy: { createdAt: "asc" },
  });
}

export async function createCartItem(data: Prisma.CartItemCreateArgs["data"]) {
  return prisma.cartItem.create({
    data,
    include: cartItemInclude,
  });
}

export async function updateCartItem(itemId: string, data: Prisma.CartItemUpdateArgs["data"]) {
  return prisma.cartItem.update({
    where: { id: itemId },
    data,
    include: cartItemInclude,
  });
}

export async function deleteCartItem(itemId: string) {
  return prisma.cartItem.delete({
    where: { id: itemId },
  });
}

export async function createManyCartItems(items: Prisma.CartItemCreateManyArgs["data"]) {
  return prisma.cartItem.createMany({
    data: items,
  });
}
