/**
 * Centralized error messages and codes for cart operations
 */

export const CART_ERRORS = {
  // Product errors
  PRODUCT_NOT_FOUND: {
    code: "PRODUCT_NOT_FOUND",
    message: "Product not found",
  },
  VARIANT_NOT_FOUND: {
    code: "VARIANT_NOT_FOUND",
    message: "Product variant not found",
  },
  PRODUCT_UNAVAILABLE: {
    code: "PRODUCT_UNAVAILABLE",
    message: "Product is currently unavailable",
  },

  // Cart errors
  CART_NOT_FOUND: {
    code: "CART_NOT_FOUND",
    message: "Cart not found",
  },
  CART_ITEM_NOT_FOUND: {
    code: "CART_ITEM_NOT_FOUND",
    message: "Cart item not found",
  },
  CART_EMPTY: {
    code: "CART_EMPTY",
    message: "Cart is empty",
  },

  // Validation errors
  INVALID_QUANTITY: {
    code: "INVALID_QUANTITY",
    message: "Quantity must be a positive integer",
  },
  QUANTITY_EXCEEDS_STOCK: {
    code: "QUANTITY_EXCEEDS_STOCK",
    message: "Requested quantity exceeds available stock",
  },
  MAX_QUANTITY_EXCEEDED: {
    code: "MAX_QUANTITY_EXCEEDED",
    message: "Maximum quantity per order exceeded",
  },

  // Authentication errors
  AUTH_REQUIRED: {
    code: "AUTH_REQUIRED",
    message: "Please sign in to add items to cart",
  },
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    message: "You are not authorized to perform this action",
  },

  // General errors
  OPERATION_FAILED: {
    code: "OPERATION_FAILED",
    message: "Cart operation failed",
  },
  FETCH_ERROR: {
    code: "FETCH_ERROR",
    message: "Failed to fetch cart",
  },
  ADD_ERROR: {
    code: "ADD_ERROR",
    message: "Failed to add item to cart",
  },
  UPDATE_ERROR: {
    code: "UPDATE_ERROR",
    message: "Failed to update cart item",
  },
  REMOVE_ERROR: {
    code: "REMOVE_ERROR",
    message: "Failed to remove item from cart",
  },
} as const;

export type CartErrorCode = keyof typeof CART_ERRORS;

/**
 * Get error details by code
 */
export function getCartError(code: CartErrorCode) {
  return CART_ERRORS[code];
}

/**
 * Create cart error object
 */
export function createCartError(code: CartErrorCode, details?: string) {
  const error = CART_ERRORS[code];
  return {
    code: error.code,
    message: details || error.message,
  };
}
