export type CouponType = "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";

export type CouponStatus = "ACTIVE" | "EXPIRED" | "INACTIVE" | "USED_UP";

export type CouponValidationResult = {
  isValid: boolean;
  error?: string;
  coupon?: CouponInfo;
};

export type CouponInfo = {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  maxDiscount?: number | null;
  currency?: string | null;
  minOrderAmount?: number | null;
};

export type AppliedCoupon = {
  id: string;
  code: string;
  type: string;
  discountAmount: number;
};

export type CouponApplicationResult = {
  coupon: AppliedCoupon;
  subtotal: number;
  discountAmount: number;
  total: number;
  message?: string;
};

export type ApplyCouponInput = {
  code: string;
  cartId?: string;
};

export type RemoveCouponInput = {
  cartId?: string;
};
