"use client";

import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import { cartQueryKeys } from "@/features/cart/hooks/cart.query-keys";
import { applyCoupon } from "../actions";
import type { CouponApplicationResult } from "../types";

type UseApplyCouponOptions = Omit<
  UseMutationOptions<CouponApplicationResult, Error, string>,
  "mutationFn"
>;

/**
 * Hook for applying coupon to cart
 *
 * @example
 * ```tsx
 * const { mutate: apply, isPending } = useApplyCoupon({
 *   onSuccess: (data) => {
 *     console.log('Discount:', data.discountAmount);
 *   },
 * });
 *
 * apply("SUMMER2024");
 * ```
 */
export function useApplyCoupon(options?: UseApplyCouponOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applyCoupon,
    onSuccess: (data, code, context) => {
      // Invalidate cart query to refetch updated cart
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() });

      // Show success message
      toast.success(`Coupon "${code}" applied successfully!`, {
        description: `You saved ${data.discountAmount.toFixed(2)}`,
      });
    },
    onError: (error, code, context) => {
      // Show error message
      toast.error("Failed to apply coupon", {
        description: error.message,
      });
    },
    ...options,
  });
}
