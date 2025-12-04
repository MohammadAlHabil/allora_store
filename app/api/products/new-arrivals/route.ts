import { NextResponse } from "next/server";
import prisma from "@/shared/lib/prisma";
import { calculateTotalStock, getDefaultVariantId } from "@/shared/lib/utils/product-availability";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "12");

    const products = await prisma.product.findMany({
      where: { isAvailable: true, isArchived: false },
      include: {
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        variants: {
          include: {
            inventory: true,
          },
        },
        inventories: {
          where: {
            variantId: null,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Map to plain objects matching ProductGrid component type
    const result = products.map((p) => {
      // Handle Prisma Decimal type for price
      const basePrice = p.basePrice;
      const price =
        typeof basePrice === "object" && "toNumber" in basePrice
          ? (basePrice as { toNumber: () => number }).toNumber()
          : Number(basePrice);

      // Calculate total available stock using centralized utility
      // Handles both variant-based and direct inventories
      const totalStock = calculateTotalStock(p.variants, p.inventories);

      // Find default variant using centralized utility
      const hasVariants = p.variants.length > 0;
      const defaultVariantId = getDefaultVariantId(p.variants);

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price,
        image: p.images?.[0]?.url ?? "/images/placeholder.png",
        rating: p.avgRating ?? 0,
        isAvailable: p.isAvailable,
        isArchived: p.isArchived,
        stock: totalStock,
        hasVariants,
        defaultVariantId,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      {
        error: "Failed to fetch new arrivals",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
