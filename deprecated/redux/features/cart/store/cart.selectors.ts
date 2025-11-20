import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./store";

// Basic selectors
export const selectCart = (state: RootState) => state.cart.cart;
export const selectCartItems = (state: RootState) => state.cart.cart?.items ?? [];
export const selectCartLoading = (state: RootState) => state.cart.isLoading;
export const selectCartError = (state: RootState) => state.cart.error;

// Computed selectors
export const selectCartItemCount = createSelector([selectCartItems], (items) =>
  items.reduce((total, item) => total + item.quantity, 0)
);

export const selectCartTotal = createSelector([selectCartItems], (items) =>
  items.reduce((total, item) => total + item.totalPrice, 0)
);

export const selectCartSubtotal = selectCartTotal;

export const selectIsCartEmpty = createSelector([selectCartItems], (items) => items.length === 0);

export const selectCartItemById = (itemId: string) => (state: RootState) =>
  selectCartItems(state).find((item) => item.id === itemId);

export const selectCartItemByProduct =
  (productId: string, variantId: string | null = null) =>
  (state: RootState) =>
    selectCartItems(state).find(
      (item) => item.productId === productId && item.variantId === variantId
    );
