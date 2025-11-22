"use client";

import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import type { UpdateCartItemInput, CartResponse } from "../types";
import { updateCartItem } from "./cart.api";
import { cartQueryKeys } from "./cart.query-keys";

type UpdateQuantityVariables = {
  itemId: string;
  input: UpdateCartItemInput;
  productName?: string; // Optional product name for toast messages
};

type UpdateQuantityResponse = {
  item: CartResponse["items"][0];
  cart: CartResponse;
};

type UseUpdateQuantityOptions = Omit<
  UseMutationOptions<
    UpdateQuantityResponse,
    Error,
    UpdateQuantityVariables,
    { previousCart: CartResponse | undefined }
  >,
  "mutationFn"
>;

/**
 * Mutation hook for updating cart item quantity
 * Handles optimistic updates and syncs with Redux store
 *
 * @example
 * ```tsx
 * const { mutate: updateQuantity, isPending, error } = useUpdateQuantity({
 *   onSuccess: (data) => {
 *     console.log('Updated:', data.item);
 *   },
 * });
 *
 * // Usage
 * updateQuantity({ itemId: '123', input: { quantity: 5 } });
 * ```
 */
export function useUpdateQuantity(options?: UseUpdateQuantityOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, input }: UpdateQuantityVariables) => updateCartItem(itemId, input),
    onMutate: async ({ itemId, input }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: cartQueryKeys.cart() });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData<CartResponse>(cartQueryKeys.cart());

      // Optimistically update the cart in cache
      if (previousCart) {
        const optimisticCart = {
          ...previousCart,
          items: previousCart.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  quantity: input.quantity,
                  totalPrice: item.unitPrice * input.quantity,
                }
              : item
          ),
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

      // Show success toast with product name and quantity
      const productName = variables.productName || "Product";
      toast.success(`${productName} quantity updated to ${variables.input.quantity}`);
    },
    onError: (error, variables, context) => {
      // Rollback to previous cart state
      if (context?.previousCart) {
        queryClient.setQueryData<CartResponse>(cartQueryKeys.cart(), context.previousCart);
      }

      // Invalidate queries to refetch from server
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() });

      // Show error toast
      toast.error(error.message || "Failed to update cart");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() });
    },
    ...options,
  });
}
