/**
 * ═══════════════════════════════════════════════════════════════
 * useUpdateAddress - Update existing address mutation
 * ═══════════════════════════════════════════════════════════════
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AddressFormData } from "../validations/address.schema";
import { updateAddressAPI } from "./checkout.api";
import { checkoutKeys } from "./checkout.query-keys";

/**
 * Hook to update an existing address with optimistic updates
 *
 * @example
 * const { mutate: updateAddress, isPending } = useUpdateAddress();
 * updateAddress({ id: "123", data: { city: "New York" } });
 */
export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AddressFormData> }) =>
      updateAddressAPI(id, data),
    onSuccess: () => {
      // Invalidate addresses query to refetch
      queryClient.invalidateQueries({ queryKey: checkoutKeys.addresses() });
    },
  });
}
