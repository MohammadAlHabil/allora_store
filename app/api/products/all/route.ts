import { NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma";
import prisma from "@/shared/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "999999");
    const minRating = parseFloat(searchParams.get("minRating") || "0");
    const category = searchParams.get("category") || "";
    const inStock = searchParams.get("inStock");
    const sortBy = searchParams.get("sortBy") || "featured";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      isAvailable: true,
      isArchived: false,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minPrice > 0 || maxPrice < 999999) {
      where.basePrice = {
        gte: minPrice,
        lte: maxPrice,
      };
    }

    if (minRating > 0) {
      where.avgRating = {
        gte: minRating,
      };
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category,
          },
        },
      };
    }

    if (inStock === "true") {
      where.inventories = {
        some: {
          quantity: {
            gt: 0,
          },
        },
      };
    }

    // Build orderBy clause
    let orderBy: Prisma.ProductOrderByWithRelationInput = {};
    switch (sortBy) {
      case "price-asc":
        orderBy = { basePrice: "asc" };
        break;
      case "price-desc":
        orderBy = { basePrice: "desc" };
        break;
      case "name-asc":
        orderBy = { name: "asc" };
        break;
      case "name-desc":
        orderBy = { name: "desc" };
        break;
      case "rating":
        orderBy = { avgRating: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // Fetch products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          images: {
            take: 1,
            orderBy: { sortOrder: "asc" },
          },
          categories: {
            include: {
              category: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Format products for frontend
    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: parseFloat(product.basePrice.toString()),
      image: product.images[0]?.url || "/images/placeholder.png",
      rating: product.avgRating || 0,
      reviewCount: product.reviewCount || 0,
      categories: product.categories.map((pc) => pc.category.name),
    }));

    return NextResponse.json({
      products: formattedProducts,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
