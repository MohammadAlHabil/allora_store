"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserAddressesAPI } from "./checkout.api";
import { checkoutKeys } from "./checkout.query-keys";

/**
 * Hook to fetch user's saved addresses
 *
 * @example
 * const { data: addresses, isLoading } = useAddresses();
 */
export function useAddresses() {
  return useQuery({
    queryKey: checkoutKeys.addresses(),
    queryFn: getUserAddressesAPI,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
