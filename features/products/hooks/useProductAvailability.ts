"use client";

import { useQuery } from "@tanstack/react-query";

export type ProductAvailability = {
  id: string;
  name: string;
  isAvailable: boolean;
  isArchived: boolean;
  stock: number;
  price: number;
};

/**
 * Fetch product availability and stock info
 */
async function fetchProductAvailability(productId: string): Promise<ProductAvailability> {
  const response = await fetch(`/api/products/${productId}/availability`);
  if (!response.ok) {
    throw new Error("Failed to fetch product availability");
  }
  return response.json();
}

/**
 * Hook to check product availability and stock
 */
export function useProductAvailability(productId: string) {
  return useQuery<ProductAvailability, Error>({
    queryKey: ["product", "availability", productId],
    queryFn: () => fetchProductAvailability(productId),
    staleTime: 1000 * 30, // 30 seconds (stock changes frequently)
    gcTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
    enabled: !!productId, // Only fetch if productId exists
  });
}
