/**
 * ═══════════════════════════════════════════════════════════════
 * ADDRESS SERVICE
 * ═══════════════════════════════════════════════════════════════
 * Business logic for user address management
 */

import { NotFoundError } from "@/shared/lib/errors/core/AppError";
import { ERROR_CODES } from "@/shared/lib/errors/core/error-codes";
import { ok, fail } from "@/shared/lib/errors/core/result";
import type { Result } from "@/shared/lib/errors/core/types";
import {
  findAddressesByUserId,
  findAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  addressExistsForUser,
} from "../repositories/address.repository";
import type { AddressResponse, Address } from "../types/address.types";
import type { AddressFormData } from "../validations/address.schema";

/**
 * Convert Prisma Decimal to number for API response
 */
function serializeAddress(address: Address): AddressResponse {
  return {
    ...address,
    latitude: address.latitude ? Number(address.latitude) : null,
    longitude: address.longitude ? Number(address.longitude) : null,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt ? address.updatedAt.toISOString() : null,
  };
}

/**
 * Get all addresses for a user
 */
export async function getUserAddresses(userId: string): Promise<Result<AddressResponse[]>> {
  try {
    const addresses = await findAddressesByUserId(userId);
    return ok(addresses.map(serializeAddress));
  } catch (error) {
    return fail({
      code: ERROR_CODES.DATABASE_ERROR,
      message: "Failed to fetch addresses",
      status: 500,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Get single address by ID
 */
export async function getAddressById(id: string, userId: string): Promise<Result<AddressResponse>> {
  try {
    const address = await findAddressById(id, userId);

    if (!address) {
      throw new NotFoundError("Address");
    }

    return ok(serializeAddress(address));
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
      message: "Failed to fetch address",
      status: 500,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Create new address
 */
export async function addUserAddress(
  userId: string,
  data: AddressFormData
): Promise<Result<AddressResponse>> {
  try {
    const address = await createAddress(userId, data);
    return ok(serializeAddress(address));
  } catch (error) {
    return fail({
      code: ERROR_CODES.DATABASE_ERROR,
      message: "Failed to create address",
      status: 500,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Update existing address
 */
export async function updateUserAddress(
  id: string,
  userId: string,
  data: Partial<AddressFormData>
): Promise<Result<AddressResponse>> {
  try {
    // Check ownership
    const exists = await addressExistsForUser(id, userId);
    if (!exists) {
      throw new NotFoundError("Address");
    }

    const address = await updateAddress(id, userId, data);
    return ok(serializeAddress(address));
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
      message: "Failed to update address",
      status: 500,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Delete address
 */
export async function deleteUserAddress(
  id: string,
  userId: string
): Promise<Result<{ message: string }>> {
  try {
    // Check ownership
    const exists = await addressExistsForUser(id, userId);
    if (!exists) {
      throw new NotFoundError("Address");
    }

    await deleteAddress(id, userId);
    return ok({ message: "Address deleted successfully" });
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
      message: "Failed to delete address",
      status: 500,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Set address as default
 */
export async function setUserDefaultAddress(
  id: string,
  userId: string
): Promise<Result<AddressResponse>> {
  try {
    // Check ownership
    const exists = await addressExistsForUser(id, userId);
    if (!exists) {
      throw new NotFoundError("Address");
    }

    const address = await setDefaultAddress(id, userId);
    return ok(serializeAddress(address));
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
      message: "Failed to set default address",
      status: 500,
      timestamp: new Date().toISOString(),
    });
  }
}
