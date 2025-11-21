import { NextResponse } from "next/server";
import prisma from "@/shared/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "12");

    const products = await prisma.product.findMany({
      where: { isAvailable: true, isArchived: false },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
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

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price,
        image: p.images?.[0]?.url ?? "/images/placeholder.png",
        rating: p.avgRating ?? 0,
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
