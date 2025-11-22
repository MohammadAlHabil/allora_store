import { ShippingMethod as PrismaShippingMethod } from "@/app/generated/prisma";

// Base shipping method from Prisma
export type ShippingMethod = PrismaShippingMethod;

// Serialized version for API responses (Decimal -> number)
export interface ShippingMethodResponse {
  id: string;
  key: string;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  basePrice: number;
  currency: string;
  isActive: boolean;
  availableCountries: string[];
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  rules?: Record<string, unknown> | null;
  logoUrl?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
}

// For selecting a shipping method
export interface SelectShippingMethodPayload {
  addressId: string;
  shippingMethodId: string;
}

// Calculated shipping cost with breakdown
export interface ShippingCostCalculation {
  methodId: string;
  basePrice: number;
  additionalFees: number;
  total: number;
  currency: string;
  estimatedDelivery: {
    minDays: number;
    maxDays: number;
    displayText: string; // e.g., "2-4 business days"
  };
}
