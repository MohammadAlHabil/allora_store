"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ShippingMethodResponse, ShippingCostCalculation } from "../types/shipping.types";

interface SelectShippingMethodPayload {
  addressId: string;
  shippingMethodId: string;
}

interface SelectShippingMethodResponse {
  method: ShippingMethodResponse;
  cost: ShippingCostCalculation;
}

/**
 * Select a shipping method and calculate cost
 */
export function useSelectShippingMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SelectShippingMethodPayload) => {
      const response = await fetch("/api/checkout/shipping-methods/select", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to select shipping method");
      }

      return result.data as SelectShippingMethodResponse;
    },
    onSuccess: () => {
      // Invalidate cart and checkout validation queries
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["checkout-validation"] });
    },
  });
}
