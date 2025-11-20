"use client";

import { useQuery } from "@tanstack/react-query";
import { validateCheckoutAPI } from "./checkout.api";
import { checkoutKeys } from "./checkout.query-keys";

/**
 * Hook to validate checkout access
 * - Checks if user is authenticated
 * - Checks if cart is not empty
 *
 * @example
 * const { data: validation, isLoading } = useCheckoutValidation();
 *
 * if (!validation?.canProceed) {
 *   // Show error: validation.reason
 * }
 */
export function useCheckoutValidation() {
  return useQuery({
    queryKey: checkoutKeys.validation(),
    queryFn: validateCheckoutAPI,
    retry: false,
  });
}
