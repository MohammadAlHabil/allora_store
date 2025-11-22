import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import * as wishlistService from "@/features/wishlist/services/wishlist.service";

/**
 * POST /api/wishlist/merge
 * Merge anonymous wishlist into user wishlist on login
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get token from cookie
    const token = request.cookies.get("wishlist_token")?.value;

    if (!token) {
      // No anonymous wishlist to merge
      return NextResponse.json({
        success: true,
        mergedCount: 0,
      });
    }

    // Merge wishlists
    const result = await wishlistService.mergeWishlistsOnLogin(token, session.user.id);

    // Clear wishlist token cookie after merge
    const response = NextResponse.json(result);
    response.cookies.delete("wishlist_token");

    return response;
  } catch (error) {
    console.error("Error merging wishlists:", error);
    return NextResponse.json({ error: "Failed to merge wishlists" }, { status: 500 });
  }
}
