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
    });

    // Map to plain objects matching the FeaturedCategories component type
    const result = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      // Use local category images from public/images folder
      image: `/images/cat-${c.slug}.jpg`,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
