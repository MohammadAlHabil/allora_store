import prisma from "@/shared/lib/prisma";

/**
 * Product Repository
 * Handles product-related database queries
 */

export async function findProductById(productId: string, includeVariants?: boolean) {
  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      variants: includeVariants ? true : false,
    },
  });
}
