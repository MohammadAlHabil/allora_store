import { NextRequest, NextResponse } from "next/server";
import prisma from "@/shared/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        products: [],
        categories: [],
        message: "Please enter at least 2 characters to search",
      });
    }

    const searchQuery = query.trim();

    // Search products by name or description
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { isArchived: false },
          {
            OR: [
              { name: { contains: searchQuery, mode: "insensitive" } },
              { description: { contains: searchQuery, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        shortDesc: true,
        description: true,
        basePrice: true,
        images: {
          select: {
            url: true,
            alt: true,
          },
          take: 1,
          orderBy: {
            sortOrder: "asc",
          },
        },
        categories: {
          select: {
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
          take: 1,
        },
      },
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Search categories by name
    const categories = await prisma.category.findMany({
      where: {
        AND: [{ isActive: true }, { name: { contains: searchQuery, mode: "insensitive" } }],
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      take: 5,
    });

    // Convert Decimal to number and format data for products
    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.shortDesc || product.description,
      basePrice: product.basePrice.toNumber(),
      image: product.images[0]?.url || null,
      categoryName: product.categories[0]?.category.name || null,
      categorySlug: product.categories[0]?.category.slug || null,
    }));

    return NextResponse.json({
      products: formattedProducts,
      categories,
      total: formattedProducts.length + categories.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search", products: [], categories: [] },
      { status: 500 }
    );
  }
}
