import { NextRequest, NextResponse } from "next/server";
import prisma from "@/shared/lib/prisma";

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

    // Calculate actual stock from variants
    const totalStock = product.variants.reduce((sum, variant) => {
      const quantity = variant.inventory?.quantity || 0;
      const reserved = variant.inventory?.reserved || 0;
      const available = Math.max(0, quantity - reserved);
      return sum + available;
    }, 0);

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
