"use client";

import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AddToCartInput, CartResponse } from "../types";
import { addItemToCart } from "./cart.api";
import { cartQueryKeys } from "./cart.query-keys";

type AddToCartResponse = {
  item: CartResponse["items"][0];
  cart: CartResponse;
};

type UseAddToCartOptions = Omit<
  UseMutationOptions<
    AddToCartResponse,
    Error,
    AddToCartInput,
    { previousCart: CartResponse | undefined }
  >,
  "mutationFn"
>;

/**
 * Mutation hook for adding items to cart
 * Handles optimistic updates and syncs with Redux store
 *
 * @example
 * ```tsx
 * const { mutate: addItem, isPending, error } = useAddToCart({
 *   onSuccess: (data) => {
 *     console.log('Item added:', data.item);
 *   },
 * });
 *
 * // Usage
 * addItem({ productId: '123', quantity: 1 });
 * ```
 */
export function useAddToCart(options?: UseAddToCartOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addItemToCart,
    onMutate: async (input) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: cartQueryKeys.cart() });

      // Snapshot the previous value for rollback
      const previousCart = queryClient.getQueryData<CartResponse>(cartQueryKeys.cart());

      // Return context with the snapshot
      return { previousCart } as { previousCart: CartResponse | undefined };
    },
    onSuccess: (data, variables, context) => {
      // Update React Query cache
      queryClient.setQueryData<CartResponse>(cartQueryKeys.cart(), data.cart);

      // Invalidate and refetch cart query (to ensure sync)
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() });

      // Show success toast with product name
      const productName = variables.productName || "Product";
      toast.success(`${productName} added to cart`);
    },
    onError: (error, variables, context) => {
      // Rollback to previous cart state
      if (context?.previousCart) {
        queryClient.setQueryData<CartResponse>(cartQueryKeys.cart(), context.previousCart);
      }

      // Invalidate queries to refetch from server
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() });

      // Show error toast
      toast.error(error.message || "Failed to add item to cart");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() });
    },
    ...options,
  });
}
