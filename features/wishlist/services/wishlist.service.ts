import { NotFoundError, ValidationError } from "@/shared/lib/errors";
import * as productRepo from "../repositories/product.repository";
import * as wishlistRepo from "../repositories/wishlist.repository";
import type { WishlistProduct, ProductWithImages } from "../types/wishlist.types";
import { generateWishlistToken } from "./wishlist-context.service";

/**
 * Wishlist Service
 * Business logic for wishlist operations
 * Supports both authenticated and anonymous users
 */

/**
 * Transform product to wishlist product format
 */
function transformToWishlistProduct(product: ProductWithImages, addedAt: Date): WishlistProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    basePrice: Number(product.basePrice),
    image: product.images[0]?.url || "/images/banner.png",
    isAvailable: product.isAvailable,
    isArchived: product.isArchived,
    addedAt,
  };
}

// ============ Get Wishlist Operations ============

/**
 * Get wishlist for authenticated user
 */
export async function getUserWishlist(userId: string) {
  const wishlistItems = await wishlistRepo.findWishlistItems(userId);

  const products: WishlistProduct[] = wishlistItems.map(
    (item: { product: ProductWithImages; createdAt: Date }) =>
      transformToWishlistProduct(item.product, item.createdAt)
  );

  return {
    items: products,
    count: products.length,
  };
}

/**
 * Get wishlist for anonymous user by token
 */
export async function getAnonymousWishlist(token: string) {
  const wishlistItems = await wishlistRepo.findWishlistItemsByToken(token);

  const products: WishlistProduct[] = wishlistItems.map(
    (item: { product: ProductWithImages; createdAt: Date }) =>
      transformToWishlistProduct(item.product, item.createdAt)
  );

  return {
    items: products,
    count: products.length,
  };
}

// ============ Add to Wishlist Operations ============

/**
 * Add product to wishlist for authenticated user
 */
export async function addToWishlist(userId: string, productId: string) {
  // Check if product exists
  const product = await productRepo.findProductById(productId);

  if (!product) {
    throw new NotFoundError(`Product ${productId}`);
  }

  // Check if already in wishlist
  const existingItem = await wishlistRepo.findWishlistItem(userId, productId);

  if (existingItem) {
    throw new ValidationError("Product is already in wishlist");
  }

  // Add to wishlist
  const wishlistItem = await wishlistRepo.addWishlistItem(userId, productId);

  return {
    success: true,
    item: transformToWishlistProduct(product as ProductWithImages, wishlistItem.createdAt),
  };
}

/**
 * Add product to anonymous wishlist
 */
export async function addToWishlistAnonymous(token: string, productId: string) {
  // Check if product exists
  const product = await productRepo.findProductById(productId);

  if (!product) {
    throw new NotFoundError(`Product ${productId}`);
  }

  // Check if already in wishlist
  const existingItem = await wishlistRepo.findWishlistItemByToken(token, productId);

  if (existingItem) {
    throw new ValidationError("Product is already in wishlist");
  }

  // Add to wishlist
  const wishlistItem = await wishlistRepo.addWishlistItemAnonymous(token, productId);

  return {
    success: true,
    item: transformToWishlistProduct(product as ProductWithImages, wishlistItem.createdAt),
  };
}

// ============ Remove from Wishlist Operations ============

/**
 * Remove product from wishlist for authenticated user
 */
export async function removeFromWishlist(userId: string, productId: string) {
  // Check if item exists in wishlist
  const existingItem = await wishlistRepo.findWishlistItem(userId, productId);

  if (!existingItem) {
    throw new NotFoundError(`Product ${productId} not found in wishlist`);
  }

  // Remove from wishlist
  await wishlistRepo.removeWishlistItem(userId, productId);

  return {
    success: true,
    productId,
  };
}

/**
 * Remove product from anonymous wishlist
 */
export async function removeFromWishlistAnonymous(token: string, productId: string) {
  // Check if item exists in wishlist
  const existingItem = await wishlistRepo.findWishlistItemByToken(token, productId);

  if (!existingItem) {
    throw new NotFoundError(`Product ${productId} not found in wishlist`);
  }

  // Remove from wishlist
  await wishlistRepo.removeWishlistItemByToken(token, productId);

  return {
    success: true,
    productId,
  };
}

// ============ Toggle Wishlist Operations ============

/**
 * Toggle product in wishlist for authenticated user
 */
export async function toggleWishlist(userId: string, productId: string) {
  const existingItem = await wishlistRepo.findWishlistItem(userId, productId);

  if (existingItem) {
    // Remove from wishlist
    await wishlistRepo.removeWishlistItem(userId, productId);
    return {
      success: true,
      action: "removed" as const,
      inWishlist: false,
    };
  } else {
    // Check if product exists
    const product = await productRepo.findProductById(productId);

    if (!product) {
      throw new NotFoundError(`Product ${productId}`);
    }

    // Add to wishlist
    await wishlistRepo.addWishlistItem(userId, productId);
    return {
      success: true,
      action: "added" as const,
      inWishlist: true,
    };
  }
}

/**
 * Toggle product in anonymous wishlist
 */
export async function toggleWishlistAnonymous(token: string, productId: string) {
  const existingItem = await wishlistRepo.findWishlistItemByToken(token, productId);

  if (existingItem) {
    // Remove from wishlist
    await wishlistRepo.removeWishlistItemByToken(token, productId);
    return {
      success: true,
      action: "removed" as const,
      inWishlist: false,
    };
  } else {
    // Check if product exists
    const product = await productRepo.findProductById(productId);

    if (!product) {
      throw new NotFoundError(`Product ${productId}`);
    }

    // Add to wishlist
    await wishlistRepo.addWishlistItemAnonymous(token, productId);
    return {
      success: true,
      action: "added" as const,
      inWishlist: true,
    };
  }
}

// ============ Count Operations ============

/**
 * Get wishlist count for authenticated user
 */
export async function getWishlistCount(userId: string) {
  const count = await wishlistRepo.getWishlistCount(userId);
  return { count };
}

/**
 * Get wishlist count for anonymous user
 */
export async function getWishlistCountAnonymous(token: string) {
  const count = await wishlistRepo.getWishlistCountByToken(token);
  return { count };
}

// ============ Merge Operations ============

/**
 * Merge anonymous wishlist into user wishlist on login
 */
export async function mergeWishlistsOnLogin(token: string, userId: string) {
  const mergedCount = await wishlistRepo.mergeWishlistsOnLogin(token, userId);

  return {
    success: true,
    mergedCount,
  };
}

// ============ Token Generation ============

/**
 * Generate new wishlist token for anonymous users
 */
export async function createWishlistToken() {
  const token = await generateWishlistToken();
  return { token };
}
