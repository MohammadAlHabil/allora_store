import { NextRequest, NextResponse } from "next/server";
import {
  getWishlistContext,
  generateWishlistToken,
} from "@/features/wishlist/services/wishlist-context.service";
import * as wishlistService from "@/features/wishlist/services/wishlist.service";

/**
 * POST /api/wishlist/toggle
 * Toggle product in/out of wishlist
 * Body: { productId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const context = await getWishlistContext(request);
    let result;
    let newToken: string | undefined;

    if (context.isAuthenticated && context.userId) {
      // Authenticated user
      result = await wishlistService.toggleWishlist(context.userId, productId);
    } else {
      // Anonymous user
      let token = context.token;

      // Generate new token if doesn't exist
      if (!token) {
        token = await generateWishlistToken();
        newToken = token;
      }

      result = await wishlistService.toggleWishlistAnonymous(token, productId);
    }

    const response = NextResponse.json(result);

    // Set cookie for anonymous users if new token was generated
    if (newToken) {
      response.cookies.set("wishlist_token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Error toggling wishlist:", error);

    const errorMessage = error instanceof Error ? error.message : "Failed to toggle wishlist";
    const status = errorMessage.includes("not found")
      ? 404
      : errorMessage.includes("already in wishlist")
        ? 409
        : 500;

    return NextResponse.json({ error: errorMessage }, { status });
  }
}
