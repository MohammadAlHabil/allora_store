import prisma from "@/shared/lib/prisma";

/**
 * Product Repository
 * Handles product-related database queries
 */

export async function findProductById(productId: string, includeVariants = false) {
  return prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      sku: true,
      basePrice: true,
      isAvailable: true,
      isArchived: true,
      variants: includeVariants,
    },
  });
}
