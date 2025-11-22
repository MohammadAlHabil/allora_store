/**
 * ═══════════════════════════════════════════════════════════════
 * useSetDefaultAddress - Set default address mutation
 * ═══════════════════════════════════════════════════════════════
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setDefaultAddressAPI } from "./checkout.api";
import { checkoutKeys } from "./checkout.query-keys";

/**
 * Hook to set an address as default with optimistic updates
 *
 * @example
 * const { mutate: setDefaultAddress, isPending } = useSetDefaultAddress();
 * setDefaultAddress("address-id");
 */
export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setDefaultAddressAPI,
    onSuccess: () => {
      // Invalidate addresses query to refetch
      queryClient.invalidateQueries({ queryKey: checkoutKeys.addresses() });
    },
  });
}
