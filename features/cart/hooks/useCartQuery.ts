"use client";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import type { CartResponse } from "../types";
import { fetchCart } from "./cart.api";
import { cartQueryKeys } from "./cart.query-keys";

type UseCartQueryOptions = Omit<
  UseQueryOptions<CartResponse, Error, CartResponse, ReturnType<typeof cartQueryKeys.cart>>,
  "queryKey" | "queryFn" | "onSuccess" | "onError"
> & {
  onSuccess?: (data: CartResponse) => void;
  onError?: (error: Error) => void;
};

/**
 * Query hook for fetching cart data
 * Automatically syncs with Redux store on success
 *
 * @example
 * ```tsx
 * const { data: cart, isLoading, error, refetch } = useCartQuery({
 *   enabled: true, // Control when to fetch
 *   onSuccess: (data) => {
 *     console.log('Cart loaded:', data);
 *   },
 * });
 * ```
 */
export function useCartQuery(options?: UseCartQueryOptions) {
  const query = useQuery({
    queryKey: cartQueryKeys.cart(),
    queryFn: fetchCart,
    enabled: options?.enabled !== false, // Default to enabled
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    ...options,
  });
  const cart = query.data;

  return {
    ...query,
    data: cart,
    cart, // Alias for convenience
  };
}
