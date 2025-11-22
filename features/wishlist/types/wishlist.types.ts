import type { Product } from "@/app/generated/prisma";

/**
 * Wishlist item from database
 */
export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
}

/**
 * Product in wishlist with full details
 */
export interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  image: string;
  isAvailable: boolean;
  isArchived: boolean;
  addedAt: Date;
}

/**
 * Wishlist response from API
 */
export interface WishlistResponse {
  items: WishlistProduct[];
  count: number;
}

/**
 * Product type from database (for transformations)
 */
export type ProductWithImages = Product & {
  images: Array<{
    url: string;
    alt: string | null;
  }>;
};
