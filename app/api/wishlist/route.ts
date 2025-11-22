import { NextRequest, NextResponse } from "next/server";
import { getWishlistContext } from "@/features/wishlist/services/wishlist-context.service";
import * as wishlistService from "@/features/wishlist/services/wishlist.service";

/**
 * GET /api/wishlist
 * Get user's wishlist (authenticated or anonymous)
 */
export async function GET(request: NextRequest) {
  try {
    const context = await getWishlistContext(request);

    let wishlist;

    if (context.isAuthenticated && context.userId) {
      // Authenticated user
      wishlist = await wishlistService.getUserWishlist(context.userId);
    } else if (context.token) {
      // Anonymous user with token
      wishlist = await wishlistService.getAnonymousWishlist(context.token);
    } else {
      // No token yet, return empty wishlist
      wishlist = { items: [], count: 0 };
    }

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}
