"use client";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  categories?: string[];
};

export type ProductsResponse = {
  products: Product[];
  total: number;
  hasMore: boolean;
};

export type ProductFilters = {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  category?: string;
  inStock?: boolean;
  sortBy?: string;
  limit?: number;
  offset?: number;
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

/**
 * Fetch all products with filters
 */
async function fetchAllProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.append("search", filters.search);
  if (filters.minPrice !== undefined) params.append("minPrice", filters.minPrice.toString());
  if (filters.maxPrice !== undefined) params.append("maxPrice", filters.maxPrice.toString());
  if (filters.minRating !== undefined) params.append("minRating", filters.minRating.toString());
  if (filters.category) params.append("category", filters.category);
  if (filters.inStock !== undefined) params.append("inStock", filters.inStock.toString());
  if (filters.sortBy) params.append("sortBy", filters.sortBy);
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.offset) params.append("offset", filters.offset.toString());

  const response = await fetch(`/api/products/all?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

/**
 * Hook to fetch all products with filters using React Query
 */
export function useAllProducts(
  filters: ProductFilters = {},
  options?: Omit<UseQueryOptions<ProductsResponse, Error>, "queryKey" | "queryFn">
) {
  return useQuery<ProductsResponse, Error>({
    queryKey: ["products", "all", filters],
    queryFn: () => fetchAllProducts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
}
