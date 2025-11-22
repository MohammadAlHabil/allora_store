export type CartItemInput = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};

export type CartItemResponse = {
  id: string;
  productId: string;
  variantId: string | null;
  sku: string;
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date | null;
};

export type CartResponse = {
  id: string;
  userId: string | null;
  expiresAt: Date | null;
  items: CartItemResponse[];
  createdAt: Date;
  updatedAt: Date | null;
};

export type AddToCartInput = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};

export type UpdateCartItemInput = {
  quantity: number;
};

export type ApplyCouponInput = {
  code: string;
};

export type ApplyCouponResponse = {
  coupon: {
    id: string;
    code: string;
    type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
    discountAmount: number;
  };
  subtotal: number;
  discountAmount: number;
  total: number;
};

export type MergeCartResponse = {
  message: string;
  merged: boolean;
  cart?: CartResponse;
};

export type CartError = {
  message: string;
  code?: string;
  field?: string;
};

export type CartOperationResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: CartError };
