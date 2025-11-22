import * as cartRepo from "../repositories/cart.repository";

/**
 * Cart Cleanup Service
 * Handles cleanup of expired anonymous carts
 */

export async function cleanupExpiredAnonymousCarts() {
  const result = await cartRepo.deleteExpiredAnonymousCarts();

  return {
    deletedCount: result.count,
  };
}
