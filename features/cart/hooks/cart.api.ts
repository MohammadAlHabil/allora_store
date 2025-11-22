import type { CartResponse, AddToCartInput, UpdateCartItemInput } from "../types";

/**
 * Fetch cart from API
 */
export async function fetchCart(): Promise<CartResponse> {
  const response = await fetch("/api/cart", {
    credentials: "include", // Include cookies for anonymous cart token
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error?.message || "Failed to fetch cart");
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error?.message || "Failed to fetch cart");
  }

  return data.data;
}

/**
 * Add item to cart API call
 */
export async function addItemToCart(input: AddToCartInput): Promise<{
  item: CartResponse["items"][0];
  cart: CartResponse;
}> {
  const response = await fetch("/api/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error?.message || "Failed to add item to cart");
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error?.message || "Failed to add item to cart");
  }

  return data.data;
}

/**
 * Update cart item API call
 */
export async function updateCartItem(
  itemId: string,
  input: UpdateCartItemInput
): Promise<{
  item: CartResponse["items"][0];
  cart: CartResponse;
}> {
  const response = await fetch(`/api/cart/${itemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error?.message || "Failed to update cart item");
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error?.message || "Failed to update cart item");
  }

  return data.data;
}

/**
 * Remove cart item API call
 */
export async function removeCartItem(itemId: string): Promise<{
  message: string;
  cart: CartResponse;
}> {
  const response = await fetch(`/api/cart/${itemId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error?.message || "Failed to remove cart item");
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error?.message || "Failed to remove cart item");
  }

  return data.data;
}
