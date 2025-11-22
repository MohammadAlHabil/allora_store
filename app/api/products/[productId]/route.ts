import { NextRequest, NextResponse } from "next/server";

import prisma from "@/shared/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    const product = await prisma.product.findUnique({
      where: { slug: productId },
      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        variants: {
          include: {
            inventory: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        reviews: {
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product is archived or unavailable with specific error messages
    if (product.isArchived) {
      return NextResponse.json({ error: "Product has been archived" }, { status: 404 });
    }

    if (!product.isAvailable) {
      return NextResponse.json({ error: "Product is currently unavailable" }, { status: 404 });
    }

    // Return with cache headers for better performance
    return NextResponse.json(product, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
