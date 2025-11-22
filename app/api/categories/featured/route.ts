import { NextResponse } from "next/server";
import prisma from "@/shared/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "6");

    const categories = await prisma.category.findMany({
      where: { parentId: null, isActive: true },
      orderBy: { sortOrder: "asc" },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    // Category-specific images mapping (matching CategoryCard.tsx)
    const categoryImages: Record<string, string> = {
      bags: "/images/categories/bags.jpg",
      fashion: "/images/categories/fashion.jpg",
      dresses: "/images/categories/dresses.jpg",
      watches: "/images/categories/watches.webp",
      belts: "/images/categories/belts.webp",
      makeup: "/images/categories/makeup.webp",
      skincare: "/images/categories/Skincare.webp",
      accessories: "/images/categories/accesories.webp",
      sportswear: "/images/categories/sportware.webp",
      haircare: "/images/categories/haircare.webp",
      shoes: "/images/categories/shoes.webp",
      pants: "/images/categories/pantes.webp",
      scarves: "/images/categories/Scarves.webp",
      sunglasses: "/images/categories/Sunglasses.webp",
      perfumes: "/images/categories/Perfumes.webp",
      skirts: "/images/categories/Skirts.webp",
      tops: "/images/categories/Tops.webp",
      beauty: "/images/categories/Beauty.webp",
    };

    // Map to plain objects matching the FeaturedCategories component type
    const result = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      // Use mapped image or fallback
      image: categoryImages[c.slug] || `/images/categories/placeholder-1.jpg`,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
