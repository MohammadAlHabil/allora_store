import { Decimal } from "@prisma/client/runtime/library";
import { NotFoundError, ValidationError } from "@/shared/lib/errors";
import { isValidQuantity } from "@/shared/lib/utils/validation";
import { CART_ERRORS } from "../constants";
import * as cartItemRepo from "../repositories/cart-item.repository";
import * as cartRepo from "../repositories/cart.repository";
import * as productRepo from "../repositories/product.repository";
import type { AddToCartInput, UpdateCartItemInput } from "../types";
import { cleanupExpiredAnonymousCarts } from "./cart-cleanup.service";

/**
 * Cart Service
 * Business logic for cart operations
 */

/**
 * Get or create a cart for an authenticated user
 */
export async function getOrCreateUserCart(userId: string) {
  let cart = await cartRepo.findCartByUserId(userId);

  if (!cart) {
    cart = await cartRepo.createCart({
      userId,
      token: null, // Explicit: user carts don't use tokens
    });
  }

  return cart;
}

/**
 * Get or create an anonymous cart by token
 */
export async function getOrCreateAnonymousCart(token?: string) {
  if (token) {
    const cart = await cartRepo.findCartByToken(token);

    if (cart) {
      // Check if cart is expired
      if (cart.expiresAt && cart.expiresAt < new Date()) {
        // Cart expired, delete it and create new one
        await cartRepo.deleteCart(cart.id).catch(() => {
          // Ignore deletion errors
        });
        return createNewAnonymousCart();
      }
      return cart;
    }
  }

  // Create new anonymous cart
  // Cleanup expired carts in background (non-blocking)
  cleanupExpiredAnonymousCarts().catch((error) => {
    console.error("Error cleaning up expired carts:", error);
  });

  return createNewAnonymousCart();
}

/**
 * Create a new anonymous cart with token
 */
async function createNewAnonymousCart() {
  const crypto = await import("crypto");
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

  return cartRepo.createCart({
    userId: null, // Explicit: anonymous carts don't have userId
    token,
    expiresAt,
  });
}

/**
 * Add item to cart
 */
export async function addItemToCart(cartId: string, input: AddToCartInput) {
  const { productId, variantId, quantity } = input;

  // Verify product exists
  const product = await productRepo.findProductById(productId, !!variantId);

  if (!product) {
    throw new NotFoundError(`Product ${productId}`);
  }

  // Check product availability
  if (!product.isAvailable || product.isArchived) {
    throw new ValidationError(CART_ERRORS.PRODUCT_UNAVAILABLE.message);
  }

  // Determine price
  let unitPrice: Decimal;
  let sku: string;
  let title: string;

  if (variantId) {
    const variant = product.variants?.find((v) => v.id === variantId);
    if (!variant) {
      throw new NotFoundError(`ProductVariant ${variantId}`);
    }
    unitPrice = variant.price || product.basePrice;
    sku = variant.sku || product.sku || `VARIANT-${variantId}`;
    title = variant.title || product.name;
  } else {
    unitPrice = product.basePrice;
    sku = product.sku || `PROD-${productId}`;
    title = product.name;
  }

  const totalPrice = new Decimal(unitPrice.toString()).mul(quantity);

  // Check if item already exists in cart
  const existingItem = await cartItemRepo.findCartItemByProductAndVariant(
    cartId,
    productId,
    variantId || null
  );

  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity + quantity;
    const newTotalPrice = new Decimal(unitPrice.toString()).mul(newQuantity);

    return cartItemRepo.updateCartItem(existingItem.id, {
      quantity: newQuantity,
      totalPrice: newTotalPrice,
    });
  }

  // Create new cart item
  return cartItemRepo.createCartItem({
    cart: { connect: { id: cartId } },
    product: { connect: { id: productId } },
    variant: variantId ? { connect: { id: variantId } } : undefined,
    sku,
    title,
    quantity,
    unitPrice,
    totalPrice,
  });
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(itemId: string, cartId: string, input: UpdateCartItemInput) {
  const { quantity } = input;

  if (!isValidQuantity(quantity)) {
    throw new ValidationError(CART_ERRORS.INVALID_QUANTITY.message);
  }

  // Verify item exists and belongs to cart
  const existingItem = await cartItemRepo.findCartItemById(itemId);

  if (!existingItem || existingItem.cartId !== cartId) {
    throw new NotFoundError(`CartItem ${itemId}`);
  }

  const totalPrice = new Decimal(existingItem.unitPrice.toString()).mul(quantity);

  return cartItemRepo.updateCartItem(itemId, {
    quantity,
    totalPrice,
  });
}

/**
 * Remove item from cart
 */
export async function removeCartItem(itemId: string, cartId: string) {
  // Verify item exists and belongs to cart
  const existingItem = await cartItemRepo.findCartItemById(itemId);

  if (!existingItem || existingItem.cartId !== cartId) {
    throw new NotFoundError(`CartItem ${itemId}`);
  }

  await cartItemRepo.deleteCartItem(itemId);

  return { success: true };
}

/**
 * Get cart with items
 */
export async function getCartWithItems(cartId: string) {
  const cart = await cartRepo.findCartById(cartId);

  if (!cart) {
    throw new NotFoundError(`Cart ${cartId}`);
  }

  return cart;
}
