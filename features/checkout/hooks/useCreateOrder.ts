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
    mutationFn: (input: CreateOrderInput) => createOrderAPI(input),

    onSuccess: (data: OrderResponse) => {
      // Invalidate cart queries (cart is now empty)
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() });

      // Show success message
      toast.success("Order placed successfully!", {
        description: `Order ${data.orderNumber} has been created.`,
      });

      // If payment URL exists, redirect to payment
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    },

    onError: (error: Error) => {
      toast.error("Failed to create order", {
        description: error.message,
      });
    },
  });
}
