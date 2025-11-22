import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItemResponse, CartResponse } from "../types";

interface CartState {
  cart: CartResponse | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<CartResponse>) => {
      state.cart = action.payload;
      state.error = null;
    },
    addItem: (state, action: PayloadAction<CartItemResponse>) => {
      if (!state.cart) return;
      const existingItemIndex = state.cart.items.findIndex(
        (item) =>
          item.productId === action.payload.productId && item.variantId === action.payload.variantId
      );

      if (existingItemIndex >= 0) {
        state.cart.items[existingItemIndex].quantity += action.payload.quantity;
        state.cart.items[existingItemIndex].totalPrice =
          state.cart.items[existingItemIndex].unitPrice *
          state.cart.items[existingItemIndex].quantity;
      } else {
        state.cart.items.push(action.payload);
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      if (!state.cart) return;
      state.cart.items = state.cart.items.filter((item) => item.id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
      if (!state.cart) return;
      const item = state.cart.items.find((item) => item.id === action.payload.itemId);
      if (item) {
        item.quantity = action.payload.quantity;
        item.totalPrice = item.unitPrice * item.quantity;
      }
    },
    clearCart: (state) => {
      if (!state.cart) return;
      state.cart.items = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetCart: (state) => {
      state.cart = null;
      state.error = null;
      state.isLoading = false;
    },
  },
});

export const {
  setCart,
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  setLoading,
  setError,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;
