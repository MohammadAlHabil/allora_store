/**
 * ═══════════════════════════════════════════════════════════════
 * useAddAddress - Create new address mutation
 * ═══════════════════════════════════════════════════════════════
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AddressFormData } from "../validations/address.schema";
import { createAddressAPI } from "./checkout.api";
import { checkoutKeys } from "./checkout.query-keys";

/**
 * Hook to create a new address with optimistic updates
 *
 * @example
 * const { mutate: addAddress, isPending } = useAddAddress();
 * addAddress(addressData);
 */
export function useAddAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAddressAPI,
    onSuccess: () => {
      // Invalidate addresses query to refetch
      queryClient.invalidateQueries({ queryKey: checkoutKeys.addresses() });
    },
  });
}
