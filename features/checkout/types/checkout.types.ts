export type CheckoutStep = "address" | "shipping" | "payment" | "confirmation";

export type ShippingMethod = {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
};

export type PaymentMethod = "CREDIT_CARD" | "CASH_ON_DELIVERY";

export type CheckoutAddress = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
};

export type CheckoutFormData = {
  shippingAddress: CheckoutAddress;
  billingAddress?: CheckoutAddress;
  useSameAddress: boolean;
  shippingMethodId: string;
  shippingCost?: number; // Add shipping cost to preserve it
  paymentMethod: PaymentMethod;
  notes?: string;
};

export type OrderSummary = {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
  couponCode?: string;
};

export type CreateOrderInput = {
  shippingAddressId?: string;
  billingAddressId?: string;
  shippingAddress?: CheckoutAddress;
  billingAddress?: CheckoutAddress;
  shippingMethodId: string;
  paymentMethod: PaymentMethod;
  paymentIntentId?: string; // Stripe PaymentIntent ID (for card payments)
  couponCode?: string;
  notes?: string;
};

export type OrderResponse = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: Date;
  paymentUrl?: string; // For online payment redirect
};

export type CheckoutSession = {
  step: CheckoutStep;
  formData: Partial<CheckoutFormData>;
  isAuthenticated: boolean;
  canProceedToCheckout: boolean;
};

export type CheckoutError = {
  message: string;
  code?: string;
  field?: string;
};

export type CheckoutValidationResult = {
  isValid: boolean;
  errors: CheckoutError[];
};
