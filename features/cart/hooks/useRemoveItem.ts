"use client";

import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CartResponse } from "../types";
import { removeCartItem } from "./cart.api";
import { cartQueryKeys } from "./cart.query-keys";

type RemoveItemResponse = {
  message: string;
  cart: CartResponse;
};

type RemoveItemVariables = {
  itemId: string;
  productName?: string; // Optional product name for toast messages
};

type UseRemoveItemOptions = Omit<
  UseMutationOptions<
    RemoveItemResponse,
    Error,
    RemoveItemVariables,
    { previousCart: CartResponse | undefined }
  >,
  "mutationFn"
>;

/**
 * Mutation hook for removing items from cart
 * Handles optimistic updates and syncs with Redux store
 *
 * @example
 * ```tsx
 * const { mutate: removeItem, isPending, error } = useRemoveItem({
 *   onSuccess: (data) => {
 *     console.log('Removed:', data.message);
 *   },
 * });
 *
 * // Usage
 * removeItem('item-id-123');
 * ```
 */
export function useRemoveItem(options?: UseRemoveItemOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId }: RemoveItemVariables) => removeCartItem(itemId),
    onMutate: async ({ itemId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: cartQueryKeys.cart() });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData<CartResponse>(cartQueryKeys.cart());

      // Optimistically update the cart in cache
      if (previousCart) {
        const optimisticCart = {
          ...previousCart,
          items: previousCart.items.filter((item) => item.id !== itemId),
        };

        queryClient.setQueryData<CartResponse>(cartQueryKeys.cart(), optimisticCart);
      }

      // Return context with the snapshot
      return { previousCart };
    },
    onSuccess: (data, variables, context) => {
      // Update React Query cache with server response
      queryClient.setQueryData<CartResponse>(cartQueryKeys.cart(), data.cart);

      // Invalidate queries to ensure sync
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() });

      // Show success toast with product name
      const productName = variables.productName || "Item";
      toast.success(`${productName} removed from cart`);
    },
    onError: (error, itemId, context) => {
      // Rollback to previous cart state
      if (context?.previousCart) {
        queryClient.setQueryData<CartResponse>(cartQueryKeys.cart(), context.previousCart);
      }

      // Invalidate queries to refetch from server
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() });

      // Show error toast
      toast.error(error.message || "Failed to remove item");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() });
    },
    ...options,
  });
}
