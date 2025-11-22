// Lightweight selectors that operate on a given state shape
// These are kept simple to avoid a runtime dependency on Redux/toolkit.

type CartItem = {
  id?: string;
  quantity?: number;
  totalPrice?: number;
  productId?: string;
  variantId?: string | null;
};

type CartStateShape = {
  cart?: {
    cart?: { items?: CartItem[] } | null;
    isLoading?: boolean;
    error?: unknown;
  };
};

export const selectCart = (state: CartStateShape) => state?.cart?.cart ?? null;
export const selectCartItems = (state: CartStateShape) =>
  state?.cart?.cart?.items ?? ([] as CartItem[]);
export const selectCartLoading = (state: CartStateShape) => state?.cart?.isLoading ?? false;
export const selectCartError = (state: CartStateShape) => state?.cart?.error ?? null;

export const selectCartItemCount = (state: AnyState) =>
  (selectCartItems(state) || []).reduce(
    (total: number, item: CartItem) => total + (item.quantity || 0),
    0
  );

export const selectCartTotal = (state: AnyState) =>
  (selectCartItems(state) || []).reduce(
    (total: number, item: CartItem) => total + (item.totalPrice || 0),
    0
  );

export const selectCartSubtotal = selectCartTotal;

export const selectIsCartEmpty = (state: AnyState) => (selectCartItems(state) || []).length === 0;

export const selectCartItemById = (itemId: string) => (state: AnyState) =>
  (selectCartItems(state) || []).find((item: CartItem) => item.id === itemId);

export const selectCartItemByProduct =
  (productId: string, variantId: string | null = null) =>
  (state: AnyState) =>
    (selectCartItems(state) || []).find(
      (item: CartItem) => item.productId === productId && item.variantId === variantId
    );
