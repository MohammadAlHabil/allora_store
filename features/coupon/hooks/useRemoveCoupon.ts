"use client";

import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import { cartQueryKeys } from "@/features/cart/hooks/cart.query-keys";
import { removeCoupon } from "../actions";

type RemoveCouponResult = {
  subtotal: number;
  discountAmount: number;
  total: number;
  message: string;
};

type UseRemoveCouponOptions = Omit<
  UseMutationOptions<RemoveCouponResult, Error, void>,
  "mutationFn"
>;

/**
 * Hook for removing coupon from cart
 *
 * @example
 * ```tsx
 * const { mutate: remove, isPending } = useRemoveCoupon();
 *
 * remove();
 * ```
 */
export function useRemoveCoupon(options?: UseRemoveCouponOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCoupon,
    onSuccess: (data, variables, context) => {
      // Invalidate cart query to refetch updated cart
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() });

      // Show success message
      toast.success("Coupon removed");
    },
    onError: (error, variables, context) => {
      // Show error message
      toast.error("Failed to remove coupon", {
        description: error.message,
      });
    },
    ...options,
  });
}
