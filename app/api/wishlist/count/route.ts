import { NextRequest, NextResponse } from "next/server";
import { getWishlistContext } from "@/features/wishlist/services/wishlist-context.service";
import * as wishlistService from "@/features/wishlist/services/wishlist.service";

/**
 * GET /api/wishlist/count
 * Get wishlist item count
 */
export async function GET(request: NextRequest) {
  try {
    const context = await getWishlistContext(request);
    let count;

    if (context.isAuthenticated && context.userId) {
      // Authenticated user
      const result = await wishlistService.getWishlistCount(context.userId);
      count = result.count;
    } else if (context.token) {
      // Anonymous user with token
      const result = await wishlistService.getWishlistCountAnonymous(context.token);
      count = result.count;
    } else {
      // No token yet
      count = 0;
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching wishlist count:", error);
    return NextResponse.json({ error: "Failed to fetch wishlist count" }, { status: 500 });
  }
}
