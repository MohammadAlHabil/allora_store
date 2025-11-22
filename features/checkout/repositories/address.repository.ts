/**
 * ═══════════════════════════════════════════════════════════════
 * ADDRESS REPOSITORY
 * ═══════════════════════════════════════════════════════════════
 * Database operations for user addresses
 */

import type { Address as PrismaAddress } from "@/app/generated/prisma";
import prisma from "@/shared/lib/prisma";
import type { AddressFormData } from "../validations/address.schema";

type Address = PrismaAddress;

/**
 * Get all addresses for a user
 */
export async function findAddressesByUserId(userId: string): Promise<Address[]> {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

/**
 * Get address by ID (with user ownership check)
 */
export async function findAddressById(id: string, userId: string): Promise<Address | null> {
  return prisma.address.findFirst({
    where: { id, userId },
  });
}

/**
 * Create new address
 */
export async function createAddress(userId: string, data: AddressFormData): Promise<Address> {
  // If caller requested this address to be default, run transaction to unset previous defaults
  if (data.isDefault) {
    return prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      return tx.address.create({
        data: {
          ...data,
          userId,
          isDefault: true,
        },
      });
    });
  }

  return prisma.address.create({
    data: {
      ...data,
      userId,
      isDefault: false,
    },
  });
}

/**
 * Update existing address
 */
export async function updateAddress(
  id: string,
  userId: string,
  data: Partial<AddressFormData>
): Promise<Address> {
  // If updating to become default, unset other defaults first
  if (data.isDefault) {
    return prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      return tx.address.update({
        where: { id },
        data,
      });
    });
  }

  return prisma.address.update({
    where: { id },
    data,
  });
}

/**
 * Delete address
 */
export async function deleteAddress(id: string, userId: string): Promise<Address> {
  return prisma.address.delete({
    where: { id },
  });
}

/**
 * Set address as default (unsets previous default)
 */
export async function setDefaultAddress(id: string, userId: string): Promise<Address> {
  return prisma.$transaction(async (tx) => {
    // Unset current default
    await tx.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // Set new default
    return tx.address.update({
      where: { id },
      data: { isDefault: true },
    });
  });
}

/**
 * Check if address exists and belongs to user
 */
export async function addressExistsForUser(id: string, userId: string): Promise<boolean> {
  const count = await prisma.address.count({
    where: { id, userId },
  });
  return count > 0;
}
