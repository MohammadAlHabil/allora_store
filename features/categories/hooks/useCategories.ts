"use client";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export type Category = {
  id: string;
  name: string;
  slug: string;
  image: string;
};

/**
 * Fetch featured categories
 */
async function fetchFeaturedCategories(): Promise<Category[]> {
  const response = await fetch("/api/categories/featured");
  if (!response.ok) {
    throw new Error("Failed to fetch featured categories");
  }
  return response.json();
}

/**
 * Hook to fetch featured categories with React Query
 */
export function useFeaturedCategories(
  options?: Omit<UseQueryOptions<Category[], Error>, "queryKey" | "queryFn">
) {
  return useQuery<Category[], Error>({
    queryKey: ["categories", "featured"],
    queryFn: fetchFeaturedCategories,
    staleTime: 1000 * 60 * 10, // 10 minutes (categories change less frequently)
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
}
