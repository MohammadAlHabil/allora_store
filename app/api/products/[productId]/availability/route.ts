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
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...product,
      stock: 100, // Mock stock for now
    });
  } catch (error) {
    console.error("Error fetching product availability:", error);
    return NextResponse.json({ error: "Failed to fetch product availability" }, { status: 500 });
  }
}
