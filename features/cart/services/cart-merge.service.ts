import { Decimal } from "@prisma/client/runtime/library";
import prisma from "@/shared/lib/prisma";
import * as cartItemRepo from "../repositories/cart-item.repository";
import * as cartRepo from "../repositories/cart.repository";
import { getCartWithItems, getOrCreateUserCart } from "./cart.service";

/**
 * Cart Merge Service
 * Handles merging anonymous cart into user cart
 */

/**
 * Merge anonymous cart into user cart
 * - Combines items from both carts
 * - Merges duplicate items (same product + variant) by adding quantities
 * - Deletes anonymous cart after merge
 */
export async function mergeCartIntoUser(anonymousCartId: string, userId: string) {
  // Get or create user cart
  const userCart = await getOrCreateUserCart(userId);

  // Get anonymous cart with items
  let anonymousCart;
  try {
    anonymousCart = await getCartWithItems(anonymousCartId);
  } catch (error) {
    // Anonymous cart not found, just return user cart
    return userCart;
  }

  if (!anonymousCart || anonymousCart.items.length === 0) {
    // No items to merge, just return user cart
    return userCart;
  }

  // Get existing user cart items to check for duplicates
  const existingUserItems = await cartItemRepo.findCartItemsByCartId(userCart.id);

  // Create a map of existing items by productId + variantId for quick lookup
  const existingItemsMap = new Map<string, (typeof existingUserItems)[0]>();
  existingUserItems.forEach((item) => {
    const key = `${item.productId}-${item.variantId || "null"}`;
    existingItemsMap.set(key, item);
  });

  // Process each anonymous cart item
  const itemsToCreate: Array<{
    cartId: string;
    productId: string;
    variantId: string | null;
    sku: string;
    title: string;
    quantity: number;
    unitPrice: Decimal;
    totalPrice: Decimal;
  }> = [];

  const itemsToUpdate: Array<{
    id: string;
    quantity: number;
    totalPrice: Decimal;
  }> = [];

  for (const anonymousItem of anonymousCart.items) {
    const key = `${anonymousItem.productId}-${anonymousItem.variantId || "null"}`;
    const existingItem = existingItemsMap.get(key);

    if (existingItem) {
      // Item exists in user cart - merge quantities
      const newQuantity = existingItem.quantity + anonymousItem.quantity;
      const unitPrice = existingItem.unitPrice;
      const newTotalPrice = new Decimal(unitPrice.toString()).mul(newQuantity);

      itemsToUpdate.push({
        id: existingItem.id,
        quantity: newQuantity,
        totalPrice: newTotalPrice,
      });
    } else {
      // New item - add to user cart
      itemsToCreate.push({
        cartId: userCart.id,
        productId: anonymousItem.productId,
        variantId: anonymousItem.variantId,
        sku: anonymousItem.sku,
        title: anonymousItem.title,
        quantity: anonymousItem.quantity,
        unitPrice: anonymousItem.unitPrice,
        totalPrice: anonymousItem.totalPrice,
      });
    }
  }

  // Use transaction to ensure all operations succeed or fail together
  const result = await prisma.$transaction(async (tx) => {
    // Update existing items
    for (const itemUpdate of itemsToUpdate) {
      await tx.cartItem.update({
        where: { id: itemUpdate.id },
        data: {
          quantity: itemUpdate.quantity,
          totalPrice: itemUpdate.totalPrice,
        },
      });
    }

    // Create new items
    if (itemsToCreate.length > 0) {
      await tx.cartItem.createMany({
        data: itemsToCreate,
      });
    }

    // Delete anonymous cart (cascade will delete items)
    await tx.cart.delete({
      where: { id: anonymousCartId },
    });

    // Return updated user cart
    return await tx.cart.findUnique({
      where: { id: userCart.id },
      include: {
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
      },
    });
  });

  return result || userCart;
}

/**
 * Find anonymous cart by token
 */
export async function findAnonymousCartByToken(token: string) {
  return cartRepo.findCartByToken(token);
}
