import type { ShippingMethod as PrismaShippingMethod } from "@/app/generated/prisma";
import { NotFoundError } from "@/shared/lib/errors/core/AppError";
import { ERROR_CODES } from "@/shared/lib/errors/core/error-codes";
import { ok, fail } from "@/shared/lib/errors/core/result";
import type { Result } from "@/shared/lib/errors/core/types";
import { findAddressById } from "../repositories/address.repository";
import {
  findShippingMethodsByCountry,
  findShippingMethodById,
  isShippingMethodAvailableForCountry,
} from "../repositories/shipping.repository";
import { ShippingMethodResponse, ShippingCostCalculation } from "../types/shipping.types";

/**
 * Serialize Decimal fields to numbers for JSON responses
 */
function serializeShippingMethod(method: PrismaShippingMethod): ShippingMethodResponse {
  const rulesVal = (method as unknown as { rules?: unknown }).rules;

  let parsedRules: Record<string, unknown> | null = null;
  if (rulesVal == null) {
    parsedRules = null;
  } else if (typeof rulesVal === "string") {
    try {
      parsedRules = JSON.parse(rulesVal);
    } catch {
      parsedRules = null;
    }
  } else if (typeof rulesVal === "object") {
    parsedRules = rulesVal as Record<string, unknown>;
  }

  const methodRecord = method as unknown as Record<string, unknown>;
  return {
    ...methodRecord,
    basePrice: Number(method.basePrice),
    rules: parsedRules,
  } as ShippingMethodResponse;
}

/**
 * Normalize common country representations to ISO 2-letter codes.
 * Handles Arabic "مصر" and common name variants.
 */
function normalizeCountry(raw?: string | null): string | null | undefined {
  if (!raw) return raw;
  const countryMap: Record<string, string> = {
    مصر: "EG",
    مصرُ: "EG",
    egypt: "EG",
    eg: "EG",
    egp: "EG",
    egy: "EG",
    EG: "EG",
    EGY: "EG",
  };

  const rawTrim = String(raw).trim();
  const lower = rawTrim.toLowerCase();
  if (countryMap[rawTrim]) return countryMap[rawTrim];
  if (countryMap[lower]) return countryMap[lower];
  if (/^[a-zA-Z]{2}$/.test(rawTrim)) return rawTrim.toUpperCase();
  return rawTrim;
}

/**
 * Get available shipping methods for a specific address
 * Validates country availability (Egypt-only for Allora Delivery)
 */
export async function getAvailableShippingMethods(
  addressId: string,
  userId: string
): Promise<Result<ShippingMethodResponse[]>> {
  try {
    // Fetch the address to get the country
    const address = await findAddressById(addressId, userId);

    if (!address) {
      throw new NotFoundError("Address");
    }

    // Normalize country to ISO code where possible (support Arabic names)
    const normalized = normalizeCountry(address.country);

    // Get shipping methods available for the address country (try normalized code first)
    const methods = await findShippingMethodsByCountry(normalized || "");

    if (methods.length === 0) {
      return fail({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: `Shipping is not available for ${address.country}`,
        status: 400,
        timestamp: new Date().toISOString(),
      });
    }

    return ok(methods.map(serializeShippingMethod));
  } catch (error) {
    if (error instanceof NotFoundError) {
      return fail({
        code: error.code,
        message: error.message,
        status: error.status,
        timestamp: new Date().toISOString(),
      });
    }
    return fail({
      code: ERROR_CODES.DATABASE_ERROR,
      message: "Failed to fetch shipping methods",
      status: 500,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Calculate shipping cost for a method and address
 * Can be extended with rules for weight, size, or regional pricing
 */
export async function calculateShippingCost(
  methodId: string,
  addressId: string,
  userId: string
): Promise<Result<ShippingCostCalculation>> {
  try {
    const method = await findShippingMethodById(methodId);
    if (!method) {
      throw new NotFoundError("Shipping method");
    }

    const address = await findAddressById(addressId, userId);
    if (!address) {
      throw new NotFoundError("Address");
    }

    // Check if method is available for country
    const countryCode = normalizeCountry(address.country) || "";
    const isAvailable = await isShippingMethodAvailableForCountry(methodId, countryCode);
    if (!isAvailable) {
      return fail({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: `Shipping method not available for ${address.country}`,
        status: 400,
        timestamp: new Date().toISOString(),
      });
    }

    // Base calculation (can be extended with rules from method.rules)
    const basePrice = Number(method.basePrice);

    // TODO: Apply additional rules from method.rules
    // - Weight-based fees
    // - Size-based fees
    // - Regional pricing adjustments
    const additionalFees = 0;

    const total = basePrice + additionalFees;

    // Format estimated delivery
    const displayText =
      method.estimatedDaysMin === method.estimatedDaysMax
        ? `${method.estimatedDaysMin} business days`
        : `${method.estimatedDaysMin}-${method.estimatedDaysMax} business days`;

    return ok({
      methodId: method.id,
      basePrice,
      additionalFees,
      total,
      currency: method.currency,
      estimatedDelivery: {
        minDays: method.estimatedDaysMin,
        maxDays: method.estimatedDaysMax,
        displayText,
      },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return fail({
        code: error.code,
        message: error.message,
        status: error.status,
        timestamp: new Date().toISOString(),
      });
    }
    return fail({
      code: ERROR_CODES.DATABASE_ERROR,
      message: "Failed to calculate shipping cost",
      status: 500,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Validate a shipping method selection
 * Ensures the method is available for the address country
 */
export async function validateShippingMethodSelection(
  methodId: string,
  addressId: string,
  userId: string
): Promise<Result<{ valid: boolean; method: ShippingMethodResponse }>> {
  try {
    const method = await findShippingMethodById(methodId);
    if (!method) {
      throw new NotFoundError("Shipping method");
    }

    const address = await findAddressById(addressId, userId);
    if (!address) {
      throw new NotFoundError("Address");
    }

    const countryCode = normalizeCountry(address.country) || "";
    const isAvailable = await isShippingMethodAvailableForCountry(methodId, countryCode);

    if (!isAvailable) {
      return fail({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: `Shipping to ${address.country} is not available with this method`,
        status: 400,
        timestamp: new Date().toISOString(),
      });
    }

    return ok({
      valid: true,
      method: serializeShippingMethod(method),
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return fail({
        code: error.code,
        message: error.message,
        status: error.status,
        timestamp: new Date().toISOString(),
      });
    }
    return fail({
      code: ERROR_CODES.DATABASE_ERROR,
      message: "Failed to validate shipping method",
      status: 500,
      timestamp: new Date().toISOString(),
    });
  }
}
