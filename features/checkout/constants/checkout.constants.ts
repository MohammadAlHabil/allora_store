import type { ShippingMethod } from "../types";

/**
 * Checkout error messages and codes
 */
export const CHECKOUT_ERRORS = {
  // Authentication errors
  AUTH_REQUIRED: {
    code: "AUTH_REQUIRED",
    message: "Please sign in to proceed with checkout",
  },

  // Cart errors
  CART_EMPTY: {
    code: "CART_EMPTY",
    message: "Your cart is empty. Please add items before checkout.",
  },
  CART_NOT_FOUND: {
    code: "CART_NOT_FOUND",
    message: "Cart not found",
  },

  // Address errors
  INVALID_ADDRESS: {
    code: "INVALID_ADDRESS",
    message: "Please provide a valid address",
  },
  ADDRESS_NOT_FOUND: {
    code: "ADDRESS_NOT_FOUND",
    message: "Selected address not found",
  },

  // Shipping errors
  INVALID_SHIPPING_METHOD: {
    code: "INVALID_SHIPPING_METHOD",
    message: "Please select a valid shipping method",
  },
  SHIPPING_NOT_AVAILABLE: {
    code: "SHIPPING_NOT_AVAILABLE",
    message: "Shipping is not available to your location",
  },

  // Payment errors
  INVALID_PAYMENT_METHOD: {
    code: "INVALID_PAYMENT_METHOD",
    message: "Please select a valid payment method",
  },
  PAYMENT_FAILED: {
    code: "PAYMENT_FAILED",
    message: "Payment processing failed. Please try again.",
  },

  // Order creation errors
  ORDER_CREATION_FAILED: {
    code: "ORDER_CREATION_FAILED",
    message: "Failed to create order. Please try again.",
  },
  INSUFFICIENT_STOCK: {
    code: "INSUFFICIENT_STOCK",
    message: "Some items are out of stock",
  },

  // Validation errors
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    message: "Please check your input and try again",
  },
} as const;

/**
 * Available shipping methods
 */
export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "standard",
    name: "Standard Shipping",
    description: "Delivery in 5-7 business days",
    price: 0, // Free
    estimatedDays: "5-7 days",
  },
  {
    id: "express",
    name: "Express Shipping",
    description: "Delivery in 2-3 business days",
    price: 15,
    estimatedDays: "2-3 days",
  },
  {
    id: "overnight",
    name: "Overnight Shipping",
    description: "Next business day delivery",
    price: 30,
    estimatedDays: "1 day",
  },
];

/**
 * Checkout steps in order
 */
export const CHECKOUT_STEPS = ["address", "shipping", "payment", "review", "confirmation"] as const;

/**
 * Payment methods
 */
export const PAYMENT_METHODS = [
  {
    id: "CREDIT_CARD",
    name: "Credit Card",
    description: "Pay with Visa, Mastercard, or Amex",
    icon: "CreditCard",
  },
  {
    id: "DEBIT_CARD",
    name: "Debit Card",
    description: "Pay with your debit card",
    icon: "CreditCard",
  },
  {
    id: "PAYPAL",
    name: "PayPal",
    description: "Pay with your PayPal account",
    icon: "Wallet",
  },
  {
    id: "CASH_ON_DELIVERY",
    name: "Cash on Delivery",
    description: "Pay when you receive your order",
    icon: "Banknote",
  },
] as const;

/**
 * Tax rate (example: 10%)
 */
export const TAX_RATE = 0.1;

/**
 * Free shipping threshold
 */
export const FREE_SHIPPING_THRESHOLD = 50;
