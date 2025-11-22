import { NextRequest } from "next/server";
import { auth } from "@/auth";

export type WishlistContext = {
  userId?: string;
  token?: string;
  isAuthenticated: boolean;
};

/**
 * Get wishlist context (authenticated or anonymous)
 * Supports both authenticated users and anonymous visitors
 */
export async function getWishlistContext(request: NextRequest): Promise<WishlistContext> {
  const session = await auth();

  // Authenticated user
  if (session?.user?.id) {
    return {
      userId: session.user.id,
      isAuthenticated: true,
    };
  }

  // Anonymous user - check for token in cookie or header
  const cookieToken = request.cookies.get("wishlist_token")?.value;
  const headerToken = request.headers.get("x-wishlist-token");

  const token = cookieToken || headerToken;

  return {
    token: token || undefined,
    isAuthenticated: false,
  };
}

/**
 * Generate a new anonymous wishlist token
 */
export async function generateWishlistToken(): Promise<string> {
  const crypto = await import("crypto");
  return crypto.randomBytes(32).toString("hex");
}
