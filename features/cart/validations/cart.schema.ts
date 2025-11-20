import { z } from "zod";

/**
 * Cart item input validation schema
 */
export const addToCartSchema = z.object({
  productId: z.string().cuid("Invalid product ID format"),
  variantId: z.string().cuid("Invalid variant ID format").nullable().optional(),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be greater than 0")
    .max(100, "Maximum quantity is 100"),
});

/**
 * Update quantity validation schema
 */
export const updateQuantitySchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be greater than 0")
    .max(100, "Maximum quantity is 100"),
});

/**
 * Apply coupon validation schema
 */
export const applyCouponSchema = z.object({
  code: z
    .string()
    .min(3, "Coupon code must be at least 3 characters")
    .max(50, "Coupon code is too long")
    .regex(
      /^[A-Z0-9_-]+$/,
      "Coupon code can only contain uppercase letters, numbers, hyphens, and underscores"
    )
    .transform((val) => val.toUpperCase()),
});

/**
 * Cart item input type (inferred from schema)
 */
export type AddToCartSchemaInput = z.infer<typeof addToCartSchema>;

/**
 * Update quantity type (inferred from schema)
 */
export type UpdateQuantitySchemaInput = z.infer<typeof updateQuantitySchema>;

/**
 * Apply coupon type (inferred from schema)
 */
export type ApplyCouponSchemaInput = z.infer<typeof applyCouponSchema>;

/**
 * Validate add to cart input
 */
export function validateAddToCart(input: unknown) {
  return addToCartSchema.safeParse(input);
}

/**
 * Validate update quantity input
 */
export function validateUpdateQuantity(input: unknown) {
  return updateQuantitySchema.safeParse(input);
}

/**
 * Validate coupon code input
 */
export function validateCouponCode(input: unknown) {
  return applyCouponSchema.safeParse(input);
}
