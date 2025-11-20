import { z } from "zod";

/**
 * Address validation schema
 */
export const checkoutAddressSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"),
  street: z.string().min(5, "Street address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State/Province must be at least 2 characters"),
  zipCode: z.string().min(3, "ZIP/Postal code must be at least 3 characters"),
  country: z.string().min(2, "Please select a country"),
});

/**
 * Shipping method validation schema
 */
export const shippingMethodSchema = z.object({
  shippingMethodId: z.string().min(1, "Please select a shipping method"),
});

/**
 * Payment method validation schema
 */
export const paymentMethodSchema = z.object({
  paymentMethod: z.enum(["CREDIT_CARD", "DEBIT_CARD", "PAYPAL", "CASH_ON_DELIVERY"]),
});

/**
 * Complete checkout form validation schema
 */
export const checkoutFormSchema = z.object({
  shippingAddress: checkoutAddressSchema,
  billingAddress: checkoutAddressSchema.optional(),
  useSameAddress: z.boolean().default(true),
  shippingMethodId: z.string().min(1, "Please select a shipping method"),
  paymentMethod: z.enum(["CREDIT_CARD", "DEBIT_CARD", "PAYPAL", "CASH_ON_DELIVERY"]),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
});

/**
 * Create order validation schema
 */
export const createOrderSchema = z
  .object({
    shippingAddressId: z.string().optional(),
    billingAddressId: z.string().optional(),
    shippingAddress: checkoutAddressSchema.optional(),
    billingAddress: checkoutAddressSchema.optional(),
    shippingMethodId: z.string().min(1, "Shipping method is required"),
    paymentMethod: z.enum(["CREDIT_CARD", "DEBIT_CARD", "PAYPAL", "CASH_ON_DELIVERY"]),
    couponCode: z.string().optional(),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => data.shippingAddressId || data.shippingAddress, {
    message: "Either shipping address ID or address data is required",
    path: ["shippingAddress"],
  });

/**
 * Type inference from schemas
 */
export type CheckoutAddressInput = z.infer<typeof checkoutAddressSchema>;
export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
