"use client";

import { getErrorMessage } from "@/shared/lib/errors";
import type { AddToCartInput } from "../types";
import { useAddToCart } from "./useAddToCart";
import { useCartQuery } from "./useCartQuery";
import { useRemoveItem } from "./useRemoveItem";
import { useUpdateQuantity } from "./useUpdateQuantity";

/**
 * Main cart hook that combines all cart functionality
 * Provides a unified interface for cart operations with Redux selectors
 *
 * @example
 * ```tsx
 * const {
 *   cart,
 *   items,
 *   itemCount,
 *   total,
 *   isEmpty,
 *   isLoading,
 *   addItem,
 *   removeItem,
 *   updateQuantity,
 *   clearCart,
 * } = useCart();
 * ```
 */
export function useCart() {
  // Query hook for fetching cart (React Query is now source of truth)
  const {
    data: cart,
    isLoading: isFetching,
    error: fetchError,
    refetch: refetchCart,
  } = useCartQuery();

  const items = cart?.items ?? [];
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const total = items.reduce((total, item) => total + item.totalPrice, 0);
  const isEmpty = items.length === 0;

  // Mutation hooks
  const addItemMutation = useAddToCart();
  const updateQuantityMutation = useUpdateQuantity();
  const removeItemMutation = useRemoveItem();

  // Wrapper functions for easier API
  const addItem = (input: AddToCartInput) => {
    addItemMutation.mutate(input);
  };

  const removeItem = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    const productName = item?.title;
    removeItemMutation.mutate({ itemId, productName });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    const item = items.find((i) => i.id === itemId);
    const productName = item?.title;
    updateQuantityMutation.mutate({ itemId, input: { quantity }, productName });
  };

  const clearCart = () => {
    items.forEach((item) => removeItem(item.id));
  };

  return {
    // Cart data
    cart,
    items,
    itemCount,
    total,
    isEmpty,

    // Loading states
    isLoading:
      isFetching ||
      addItemMutation.isPending ||
      updateQuantityMutation.isPending ||
      removeItemMutation.isPending,
    isAdding: addItemMutation.isPending,
    isUpdating: updateQuantityMutation.isPending,
    isRemoving: removeItemMutation.isPending,

    // Error (use plain message from Error object)
    error: fetchError ? (fetchError as unknown as Error).message || String(fetchError) : null,

    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    refetchCart,
  };
}
