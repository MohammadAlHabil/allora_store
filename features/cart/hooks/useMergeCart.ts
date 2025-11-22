"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cartQueryKeys } from "./cart.query-keys";

/**
 * Merge anonymous cart into user cart
 * Call this after user logs in
 */
type MergeCartResponse = {
  message?: string;
  merged?: boolean;
  cart?: unknown;
};

async function mergeCart(): Promise<MergeCartResponse> {
  const response = await fetch("/api/cart/merge", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error?.message || "Failed to merge cart");
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error?.message || "Failed to merge cart");
  }

  return data.data as MergeCartResponse;
}

/**
 * Hook to merge anonymous cart into user cart
 * Use this after user logs in
 *
 * @example
 * ```tsx
 * const { mutate: mergeCart } = useMergeCart();
 *
 * // After login
 * await signIn();
 * mergeCart();
 * ```
 */
export function useMergeCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mergeCart,
    onSuccess: (data: MergeCartResponse | undefined) => {
      // Update React Query cache with merged cart
      if (data?.cart) {
        queryClient.setQueryData(cartQueryKeys.cart(), data.cart);
      }

      // Invalidate cart query to refetch
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() });

      if (data?.merged) {
        toast.success("Cart merged successfully");
      }
    },
    onError: (error: Error) => {
      // Don't show error toast for "no cart to merge"
      if (!error.message.includes("No anonymous cart")) {
        toast.error(error.message || "Failed to merge cart");
      }
    },
  });
}
