"use client";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  rating?: number;
};

/**
 * Fetch new arrivals products
 */
async function fetchNewArrivals(): Promise<Product[]> {
  const response = await fetch("/api/products/new-arrivals");
  if (!response.ok) {
    throw new Error("Failed to fetch new arrivals");
  }
  return response.json();
}

/**
 * Hook to fetch new arrivals products with React Query
 */
export function useNewArrivals(
  options?: Omit<UseQueryOptions<Product[], Error>, "queryKey" | "queryFn">
) {
  return useQuery<Product[], Error>({
    queryKey: ["products", "new-arrivals"],
    queryFn: fetchNewArrivals,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
}

/**
 * Fetch best sellers products
 */
async function fetchBestSellers(): Promise<Product[]> {
  const response = await fetch("/api/products/best-sellers");
  if (!response.ok) {
    throw new Error("Failed to fetch best sellers");
  }
  return response.json();
}

/**
 * Hook to fetch best sellers products with React Query
 */
export function useBestSellers(
  options?: Omit<UseQueryOptions<Product[], Error>, "queryKey" | "queryFn">
) {
  return useQuery<Product[], Error>({
    queryKey: ["products", "best-sellers"],
    queryFn: fetchBestSellers,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
}
