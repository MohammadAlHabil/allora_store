export * from "./useCart";
export * from "./useCartQuery";
export * from "./useAddToCart";
export * from "./useUpdateQuantity";
export * from "./useRemoveItem";
export * from "./useMergeCart";
export * from "./cart.query-keys";
// Export cart.api functions with specific names to avoid conflicts
export {
  fetchCart,
  addItemToCart as addItemToCartApi,
  updateCartItem as updateCartItemApi,
  removeCartItem as removeCartItemApi,
} from "./cart.api";
