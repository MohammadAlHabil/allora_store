"use client";

import { useQuery } from "@tanstack/react-query";
import type { ShippingMethodResponse } from "../types/shipping.types";

interface UseShippingMethodsOptions {
  addressId?: string;
  enabled?: boolean;
}

/**
 * Fetch available shipping methods for a given address
 */
export function useShippingMethods({ addressId, enabled = true }: UseShippingMethodsOptions) {
  return useQuery({
    queryKey: ["shipping-methods", addressId],
    queryFn: async () => {
      if (!addressId) {
        throw new Error("Address ID is required");
      }

      const response = await fetch(`/api/checkout/shipping-methods?addressId=${addressId}`);

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to fetch shipping methods");
      }

      return result.data as ShippingMethodResponse[];
    },
    enabled: enabled && !!addressId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
