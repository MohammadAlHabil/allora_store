/**
 * Query keys for cart-related queries
 * Following TanStack Query best practices for query key factories
 */
export const cartQueryKeys = {
  all: ["cart"] as const,
  cart: () => [...cartQueryKeys.all, "cart"] as const,
  item: (itemId: string) => [...cartQueryKeys.all, "item", itemId] as const,
} as const;
