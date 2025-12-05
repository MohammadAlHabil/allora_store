"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cartQueryKeys } from "@/features/cart/hooks/cart.query-keys";
import type { CreateOrderInput, OrderResponse } from "../types";
import { createOrderAPI } from "./checkout.api";

/**
 * Hook to create order (checkout)
 *
 * @example
 * const { mutate: createOrder, isPending } = useCreateOrder();
 *
 * createOrder({
 *   shippingAddress: {...},
 *   paymentMethod: "CREDIT_CARD",
 *   ...
 * });
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrderInput) => {
      // Generate a unique key for this specific attempt
      // This ensures that if the network retries the SAME request, the key is consistent
      // But if the user clicks again (new mutation), we get a new key
      const idempotencyKey = crypto.randomUUID();
      console.log("🔵 useCreateOrder: Calling API with input:", input, "Key:", idempotencyKey);
      return createOrderAPI(input, idempotencyKey);
    },

    onSuccess: (data: OrderResponse) => {
      console.log("✅ useCreateOrder: Order created successfully:", data);

      // DON'T invalidate cart here - will be done after navigation
      // to prevent showing "empty cart" message during redirect

      // The onSuccess callback from mutate() will be called after this
      // and will handle navigation + cart invalidation
    },

    onError: (error: Error) => {
      console.log("❌ useCreateOrder: Failed to create order:", error);
      toast.error("Failed to create order", {
        description: error.message,
      });
    },
  });
}
