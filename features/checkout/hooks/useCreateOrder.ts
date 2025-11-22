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
      console.log("🔵 useCreateOrder: Calling API with input:", input);
      return createOrderAPI(input);
    },

    onSuccess: (data: OrderResponse) => {
      console.log("✅ useCreateOrder: Order created successfully:", data);

      // Invalidate cart queries (cart is now empty)
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() });

      // Note: Don't show toast here - will be shown on order confirmation page
      // The onSuccess callback from mutate() will be called after this
    },

    onError: (error: Error) => {
      console.log("❌ useCreateOrder: Failed to create order:", error);
      toast.error("Failed to create order", {
        description: error.message,
      });
    },
  });
}
