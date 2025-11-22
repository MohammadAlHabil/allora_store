"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Wishlist Hooks
 * React Query hooks for wishlist operations using API routes
 */

/**
 * Hook to get user's wishlist (authenticated or anonymous)
 */
export function useWishlist() {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const response = await fetch("/api/wishlist");
      if (!response.ok) {
        throw new Error("Failed to fetch wishlist");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get wishlist count
 */
export function useWishlistCount() {
  return useQuery({
    queryKey: ["wishlist", "count"],
    queryFn: async () => {
      const response = await fetch("/api/wishlist/count");
      if (!response.ok) {
        throw new Error("Failed to fetch wishlist count");
      }
      const data = await response.json();
      return data.count;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to toggle product in wishlist with optimistic updates
 */
export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to toggle wishlist");
      }

      return response.json();
    },
    onMutate: async (productId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });

      // Snapshot previous value
      const previousWishlist = queryClient.getQueryData(["wishlist"]);
      const previousCount = queryClient.getQueryData(["wishlist", "count"]);

      return { previousWishlist, previousCount, productId };
    },
    onError: (error, _productId, context) => {
      // Rollback on error
      if (context?.previousWishlist) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(["wishlist", "count"], context.previousCount);
      }

      // Show error toast
      const errorMessage = error instanceof Error ? error.message : "Failed to update wishlist";

      toast.error("Failed to update wishlist", {
        description: errorMessage,
      });
    },
    onSuccess: (result) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist", "count"] });

      // Show success toast
      if (result.action === "added") {
        toast.success("Added to wishlist", {
          description: "Product has been added to your wishlist",
        });
      } else {
        toast.success("Removed from wishlist", {
          description: "Product has been removed from your wishlist",
        });
      }
    },
  });
}

/**
 * Hook to merge anonymous wishlist on login
 */
export function useMergeWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/wishlist/merge", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to merge wishlist");
      }

      return response.json();
    },
    onSuccess: (result) => {
      // Invalidate wishlist queries after merge
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist", "count"] });

      if (result.mergedCount > 0) {
        toast.success("Wishlist merged", {
          description: `${result.mergedCount} ${result.mergedCount === 1 ? "item" : "items"} added to your wishlist`,
        });
      }
    },
    onError: (error) => {
      console.error("Error merging wishlist:", error);
      // Silent fail - don't show error to user
    },
  });
}
