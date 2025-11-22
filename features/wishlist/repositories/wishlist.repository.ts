import prisma from "@/shared/lib/prisma";

/**
 * Wishlist Repository
 * Data access layer for wishlist operations
 * Supports both authenticated users and anonymous users via tokens
 */

// ============ Authenticated User Operations ============

/**
 * Find all wishlist items for a user
 */
export async function findWishlistItems(userId: string) {
  return prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Find a specific wishlist item for a user
 */
export async function findWishlistItem(userId: string, productId: string) {
  return prisma.wishlistItem.findFirst({
    where: {
      userId,
      productId,
    },
  });
}

/**
 * Add product to wishlist for authenticated user
 */
export async function addWishlistItem(userId: string, productId: string) {
  return prisma.wishlistItem.create({
    data: {
      userId,
      productId,
    },
  });
}

/**
 * Remove product from wishlist for authenticated user
 */
export async function removeWishlistItem(userId: string, productId: string) {
  return prisma.wishlistItem.deleteMany({
    where: {
      userId,
      productId,
    },
  });
}

/**
 * Get wishlist count for a user
 */
export async function getWishlistCount(userId: string): Promise<number> {
  return prisma.wishlistItem.count({
    where: { userId },
  });
}

// ============ Anonymous User Operations (Token-based) ============

/**
 * Find all wishlist items by token (anonymous)
 */
export async function findWishlistItemsByToken(token: string) {
  return prisma.wishlistItem.findMany({
    where: { token },
    include: {
      product: {
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Find a specific wishlist item by token
 */
export async function findWishlistItemByToken(token: string, productId: string) {
  return prisma.wishlistItem.findFirst({
    where: {
      token,
      productId,
    },
  });
}

/**
 * Add product to wishlist for anonymous user
 */
export async function addWishlistItemAnonymous(token: string, productId: string) {
  return prisma.wishlistItem.create({
    data: {
      token,
      productId,
    },
  });
}

/**
 * Remove product from wishlist for anonymous user
 */
export async function removeWishlistItemByToken(token: string, productId: string) {
  return prisma.wishlistItem.deleteMany({
    where: {
      token,
      productId,
    },
  });
}

/**
 * Get wishlist count by token
 */
export async function getWishlistCountByToken(token: string): Promise<number> {
  return prisma.wishlistItem.count({
    where: { token },
  });
}

// ============ Utility Operations ============

/**
 * Check if product is in user's wishlist
 */
export async function isProductInWishlist(userId: string, productId: string): Promise<boolean> {
  const item = await prisma.wishlistItem.findFirst({
    where: {
      userId,
      productId,
    },
  });
  return !!item;
}

/**
 * Check if product is in anonymous wishlist
 */
export async function isProductInWishlistByToken(
  token: string,
  productId: string
): Promise<boolean> {
  const item = await prisma.wishlistItem.findFirst({
    where: {
      token,
      productId,
    },
  });
  return !!item;
}

/**
 * Merge anonymous wishlist into user wishlist on login
 * This transfers all items from token to userId and removes duplicates
 */
export async function mergeWishlistsOnLogin(token: string, userId: string): Promise<number> {
  // Get all anonymous wishlist items
  const anonymousItems = await prisma.wishlistItem.findMany({
    where: { token },
    select: { productId: true },
  });

  if (anonymousItems.length === 0) {
    return 0;
  }

  // Get existing user wishlist items to avoid duplicates
  const userItems = await prisma.wishlistItem.findMany({
    where: { userId },
    select: { productId: true },
  });

  const userProductIds = new Set(userItems.map((item) => item.productId));
  const itemsToMerge = anonymousItems.filter((item) => !userProductIds.has(item.productId));

  let mergedCount = 0;

  // Transfer non-duplicate items to user
  for (const item of itemsToMerge) {
    await prisma.wishlistItem.create({
      data: {
        userId,
        productId: item.productId,
      },
    });
    mergedCount++;
  }

  // Delete all anonymous items
  await prisma.wishlistItem.deleteMany({
    where: { token },
  });

  return mergedCount;
}
