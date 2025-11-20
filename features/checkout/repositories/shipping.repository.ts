import { ShippingMethod, Prisma } from "@/app/generated/prisma";
import prisma from "@/shared/lib/prisma";

/**
 * Find all active shipping methods
 */
export async function findActiveShippingMethods(): Promise<ShippingMethod[]> {
  return prisma.shippingMethod.findMany({
    where: { isActive: true },
    orderBy: { basePrice: "asc" },
  });
}

/**
 * Find shipping methods available for a specific country
 */
export async function findShippingMethodsByCountry(countryCode: string): Promise<ShippingMethod[]> {
  return prisma.shippingMethod.findMany({
    where: {
      isActive: true,
      availableCountries: {
        has: countryCode,
      },
    },
    orderBy: { basePrice: "asc" },
  });
}

/**
 * Find a specific shipping method by ID
 */
export async function findShippingMethodById(id: string): Promise<ShippingMethod | null> {
  return prisma.shippingMethod.findUnique({
    where: { id },
  });
}

/**
 * Find a shipping method by key (e.g., "standard", "express")
 */
export async function findShippingMethodByKey(key: string): Promise<ShippingMethod | null> {
  return prisma.shippingMethod.findUnique({
    where: { key },
  });
}

/**
 * Create a new shipping method (admin only)
 */
export async function createShippingMethod(
  data: Prisma.ShippingMethodCreateInput
): Promise<ShippingMethod> {
  return prisma.shippingMethod.create({
    data,
  });
}

/**
 * Update an existing shipping method (admin only)
 */
export async function updateShippingMethod(
  id: string,
  data: Prisma.ShippingMethodUpdateInput
): Promise<ShippingMethod> {
  return prisma.shippingMethod.update({
    where: { id },
    data,
  });
}

/**
 * Delete a shipping method (admin only)
 */
export async function deleteShippingMethod(id: string): Promise<ShippingMethod> {
  return prisma.shippingMethod.delete({
    where: { id },
  });
}

/**
 * Check if a shipping method is available for a country
 */
export async function isShippingMethodAvailableForCountry(
  methodId: string,
  countryCode: string
): Promise<boolean> {
  const method = await prisma.shippingMethod.findUnique({
    where: { id: methodId },
    select: { availableCountries: true, isActive: true },
  });

  if (!method || !method.isActive) return false;

  return method.availableCountries.includes(countryCode);
}
