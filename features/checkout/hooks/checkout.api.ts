import type { CreateOrderInput, OrderResponse } from "../types";
import type { AddressResponse } from "../types/address.types";
import type { AddressFormData } from "../validations/address.schema";

/**
 * Checkout API endpoints
 */
const CHECKOUT_API = {
  CREATE_ORDER: "/api/checkout/create-order",
  ADDRESSES: "/api/checkout/addresses",
  VALIDATE_CHECKOUT: "/api/checkout/validate",
} as const;

/**
 * Create order via API
 */
export async function createOrderAPI(input: CreateOrderInput): Promise<OrderResponse> {
  const response = await fetch(CHECKOUT_API.CREATE_ORDER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create order");
  }

  return response.json();
}

/**
 * Get user addresses via API
 */
export async function getUserAddressesAPI() {
  const response = await fetch(CHECKOUT_API.ADDRESSES);

  if (!response.ok) {
    throw new Error("Failed to fetch addresses");
  }

  return response.json();
}

/**
 * Create new address
 */
export async function createAddressAPI(data: AddressFormData) {
  const response = await fetch(CHECKOUT_API.ADDRESSES, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to create address");
  }

  return response.json();
}

/**
 * Update existing address
 */
export async function updateAddressAPI(id: string, data: Partial<AddressFormData>) {
  const response = await fetch(`${CHECKOUT_API.ADDRESSES}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to update address");
  }

  return response.json();
}

/**
 * Delete address
 */
export async function deleteAddressAPI(id: string) {
  const response = await fetch(`${CHECKOUT_API.ADDRESSES}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to delete address");
  }

  return response.json();
}

/**
 * Set address as default
 */
export async function setDefaultAddressAPI(id: string) {
  const response = await fetch(`${CHECKOUT_API.ADDRESSES}/${id}/set-default`, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to set default address");
  }

  return response.json();
}

/**
 * Validate checkout access
 */
export async function validateCheckoutAPI(): Promise<{
  canProceed: boolean;
  reason?: string;
}> {
  const response = await fetch(CHECKOUT_API.VALIDATE_CHECKOUT);

  if (!response.ok) {
    throw new Error("Failed to validate checkout");
  }

  return response.json();
}
