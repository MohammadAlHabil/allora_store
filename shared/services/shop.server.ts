import prisma from "@/shared/lib/prisma";

/**
 * Fetch featured categories from database
 * Returns top-level categories (parentId = null) that are active
 */
export async function getFeaturedCategories(limit = 6) {
  const cats = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    orderBy: { sortOrder: "asc" },
    take: limit,
  });

  // Map to plain objects matching the FeaturedCategories component type
  return cats.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    // Use local category images from public/images folder
    image: `/images/cat-${c.slug}.jpg`,
  }));
}

/**
 * Fetch products from database with their images
 * Returns products that are available and not archived
 */
export async function getProducts({ limit = 24 } = {}) {
  const products = await prisma.product.findMany({
    where: { isAvailable: true, isArchived: false },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 }, // Get first image only for performance
      categories: {
        include: { category: true },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  console.log("Fetched products:", products.length);
  // Map to plain objects matching ProductGrid component type
  return products.map((p) => {
    // Handle Prisma Decimal type for price
    const basePrice = p.basePrice;
    const price =
      typeof basePrice === "object" && "toNumber" in basePrice
        ? (basePrice as { toNumber: () => number }).toNumber()
        : Number(basePrice);

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price,
      // Use first product image or fallback to placeholder
      image: p.images?.[0]?.url ?? "/images/placeholder.png",
      rating: p.avgRating ?? 0,
    };
  });
}
