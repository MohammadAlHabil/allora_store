import prisma from "@/shared/lib/prisma";

/**
 * Product Repository for Wishlist
 * Data access layer for product operations related to wishlist
 */

/**
 * Find product by ID
 */
export async function findProductById(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
  });
}

/**
 * Find multiple products by IDs
 */
export async function findProductsByIds(productIds: string[]) {
  return prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
  });
}
