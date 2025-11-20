import type { ZodSchema, ZodIssue } from "zod";
import { failValidation, type Result } from "../errors";

// Parse and validate FormData using Zod schema
export function parseFormData<T>(formData: FormData, schema: ZodSchema<T>): Result<T> {
  try {
    // Convert FormData to plain object
    const data = Object.fromEntries(formData.entries());
    return safeParseToResult(data, schema);
  } catch (error) {
    return failValidation({
      _form: error instanceof Error ? error.message : "Validation failed",
    });
  }
}

// Parse and validate JSON body using Zod schema
export async function parseJsonBody<T>(request: Request, schema: ZodSchema<T>): Promise<Result<T>> {
  try {
    const body = await request.json();
    return safeParseToResult(body, schema);
  } catch (error) {
    return failValidation({
      _body: error instanceof Error ? error.message : "Invalid JSON",
    });
  }
}

// Validate data using Zod schema (for non-request validation)
export function validateData<T>(data: unknown, schema: ZodSchema<T>): Result<T> {
  return safeParseToResult(data, schema);
}

// =========================
// Helpers
// =========================

function zodIssuesToFieldErrors(issues: ZodIssue[]): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  issues.forEach((issue) => {
    const field = issue.path.join(".") || "_form";
    // If multiple issues for same field, keep the first message
    if (!fieldErrors[field]) fieldErrors[field] = issue.message;
  });
  return fieldErrors;
}

function safeParseToResult<T>(data: unknown, schema: ZodSchema<T>): Result<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const fieldErrors = zodIssuesToFieldErrors(result.error.issues);
    return failValidation(fieldErrors);
  }
  return {
    success: true,
    data: result.data,
  };
}

/**
 * Validation utilities
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate quantity (must be positive integer)
 */
export function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity > 0;
}

/**
 * Validate price (must be positive number)
 */
export function isValidPrice(price: number): boolean {
  return typeof price === "number" && !isNaN(price) && price >= 0;
}

/**
 * Validate cart item input
 */
export function validateCartItemInput(input: {
  productId?: unknown;
  variantId?: unknown;
  quantity?: unknown;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.productId || typeof input.productId !== "string") {
    errors.push("Product ID is required and must be a string");
  }

  if (
    input.variantId !== null &&
    input.variantId !== undefined &&
    typeof input.variantId !== "string"
  ) {
    errors.push("Variant ID must be a string or null");
  }

  if (input.quantity === undefined || input.quantity === null) {
    errors.push("Quantity is required");
  } else if (!isValidQuantity(input.quantity as number)) {
    errors.push("Quantity must be a positive integer");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate coupon code format
 */
export function isValidCouponCode(code: string): boolean {
  // Coupon codes should be alphanumeric, uppercase, 3-20 characters
  const couponRegex = /^[A-Z0-9]{3,20}$/;
  return couponRegex.test(code.toUpperCase());
}

/**
 * Sanitize coupon code
 */
export function sanitizeCouponCode(code: string): string {
  return code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

/**
 * Validate quantity update
 */
export function validateQuantityUpdate(quantity: unknown): { isValid: boolean; error?: string } {
  if (quantity === undefined || quantity === null) {
    return { isValid: false, error: "Quantity is required" };
  }

  if (typeof quantity !== "number") {
    return { isValid: false, error: "Quantity must be a number" };
  }

  if (!Number.isInteger(quantity)) {
    return { isValid: false, error: "Quantity must be an integer" };
  }

  if (quantity <= 0) {
    return { isValid: false, error: "Quantity must be greater than 0" };
  }

  return { isValid: true };
}
