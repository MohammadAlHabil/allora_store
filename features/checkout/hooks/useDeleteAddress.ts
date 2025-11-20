/**
 * ═══════════════════════════════════════════════════════════════
 * useDeleteAddress - Delete address mutation
 * ═══════════════════════════════════════════════════════════════
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAddressAPI } from "./checkout.api";
import { checkoutKeys } from "./checkout.query-keys";

/**
 * Hook to delete an address with optimistic updates
 *
 * @example
 * const { mutate: deleteAddress, isPending } = useDeleteAddress();
 * deleteAddress("address-id");
 */
export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAddressAPI,
    onSuccess: () => {
      // Invalidate addresses query to refetch
      queryClient.invalidateQueries({ queryKey: checkoutKeys.addresses() });
    },
  });
}
