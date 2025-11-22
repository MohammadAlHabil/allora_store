"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { OrdersListParams, OrderWithDetails, OrdersListResult } from "../types";

const QUERY_KEYS = {
  orders: ["orders"] as const,
  ordersList: (params: OrdersListParams) => ["orders", "list", params] as const,
  orderDetail: (id: string) => ["orders", "detail", id] as const,
};

/**
 * Hook to fetch user's orders list
 */
export function useOrders(params: OrdersListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.ordersList(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });

      const response = await fetch(`/api/orders?${searchParams.toString()}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data as OrdersListResult;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch single order details
 */
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.orderDetail(orderId),
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data as OrderWithDetails;
    },
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to cancel an order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason?: string }) => {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data as OrderWithDetails;
    },
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.orderDetail(data.id),
      });

      toast.success("Order Cancelled", {
        description: "Your order has been cancelled successfully.",
      });
    },
    onError: (error: Error) => {
      toast.error("Cancellation Failed", {
        description: error.message || "Failed to cancel the order.",
      });
    },
  });
}

/**
 * Hook to prefetch order details
 */
export function usePrefetchOrder() {
  const queryClient = useQueryClient();

  return (orderId: string) => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.orderDetail(orderId),
      queryFn: async () => {
        const response = await fetch(`/api/orders/${orderId}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error);
        }
        return result.data as OrderWithDetails;
      },
      staleTime: 1000 * 60 * 5,
    });
  };
}
