import { NextRequest, NextResponse } from "next/server";
import prisma from "@/shared/lib/prisma";
import { calculateTotalStock } from "@/shared/lib/utils/product-availability";

/**
 * GET /api/products/[productId]/availability
 * Get product availability information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        isAvailable: true,
        isArchived: true,
        basePrice: true,
        variants: {
          include: {
            inventory: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Calculate actual stock using centralized utility
    const totalStock = calculateTotalStock(product.variants);

    return NextResponse.json({
      id: product.id,
      name: product.name,
      isAvailable: product.isAvailable,
      isArchived: product.isArchived,
      basePrice: product.basePrice,
      stock: totalStock,
    });
  } catch (error) {
    console.error("Error fetching product availability:", error);
    return NextResponse.json({ error: "Failed to fetch product availability" }, { status: 500 });
  }
}
