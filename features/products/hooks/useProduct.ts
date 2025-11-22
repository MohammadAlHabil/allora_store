"use client";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import type { ProductDetails } from "../types/product.types";

/**
 * Fetch product details by slug
 */
async function fetchProductBySlug(slug: string): Promise<ProductDetails> {
  const response = await fetch(`/api/products/${slug}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to fetch product" }));
    throw new Error(error.error || "Failed to fetch product");
  }

  const data = await response.json();

  // Transform Decimal to number
  return {
    ...data,
    basePrice: Number(data.basePrice),
    avgRating: data.avgRating ? Number(data.avgRating) : null,
    variants:
      data.variants?.map(
        (variant: { price?: unknown; compareAt?: unknown; [key: string]: unknown }) => ({
          ...variant,
          price: variant.price ? Number(variant.price) : null,
          compareAt: variant.compareAt ? Number(variant.compareAt) : null,
        })
      ) || [],
    images: data.images || [],
    categories: data.categories || [],
    reviews: data.reviews || [],
  };
}

/**
 * Hook to fetch product details with React Query
 *
 * @param slug - Product slug
 * @param options - Additional React Query options
 *
 * @example
 * ```tsx
 * const { data: product, isLoading, error } = useProduct("floral-midi-dress");
 * ```
 */
export function useProduct(
  slug: string,
  options?: Omit<UseQueryOptions<ProductDetails, Error>, "queryKey" | "queryFn">
) {
  return useQuery<ProductDetails, Error>({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: !!slug,
    ...options,
  });
}
