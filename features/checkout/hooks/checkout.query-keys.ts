/**
 * React Query keys for checkout feature
 */
export const checkoutKeys = {
  all: ["checkout"] as const,
  addresses: () => [...checkoutKeys.all, "addresses"] as const,
  validation: () => [...checkoutKeys.all, "validation"] as const,
  order: (id: string) => [...checkoutKeys.all, "order", id] as const,
  orders: () => [...checkoutKeys.all, "orders"] as const,
} as const;
