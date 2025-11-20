import prisma from "@/shared/lib/prisma";
import { CHECKOUT_ERRORS } from "../constants";
import type { CreateOrderInput, OrderResponse } from "../types";

/**
 * Validate that user can proceed to checkout
 * - User must be authenticated
 * - Cart must not be empty
 */
export async function validateCheckoutAccess(userId: string) {
  if (!userId) {
    throw new Error(CHECKOUT_ERRORS.AUTH_REQUIRED.message);
  }

  // Get user's cart
  const cart = await prisma.cart.findFirst({
    where: { userId },
    include: { items: true },
  });

  if (!cart) {
    throw new Error(CHECKOUT_ERRORS.CART_NOT_FOUND.message);
  }

  if (cart.items.length === 0) {
    throw new Error(CHECKOUT_ERRORS.CART_EMPTY.message);
  }

  return cart;
}

/**
 * Create order from checkout data
 */
export async function createOrder(userId: string, input: CreateOrderInput): Promise<OrderResponse> {
  // Validate checkout access
  const cart = await validateCheckoutAccess(userId);

  // Create or get addresses
  let shippingAddressId = input.shippingAddressId;
  let billingAddressId = input.billingAddressId;

  // If new shipping address provided, create it
  if (!shippingAddressId && input.shippingAddress) {
    const { firstName, lastName, street, city, state, zipCode, country, phone } =
      input.shippingAddress;
    const shippingAddress = await prisma.address.create({
      data: {
        userId,
        firstName,
        lastName,
        line1: street,
        city,
        region: state,
        postalCode: zipCode,
        country,
        phone,
        label: "Shipping Address",
      },
    });
    shippingAddressId = shippingAddress.id;
  }

  // If new billing address provided, create it
  if (!billingAddressId && input.billingAddress) {
    const { firstName, lastName, street, city, state, zipCode, country, phone } =
      input.billingAddress;
    const billingAddress = await prisma.address.create({
      data: {
        userId,
        firstName,
        lastName,
        line1: street,
        city,
        region: state,
        postalCode: zipCode,
        country,
        phone,
        label: "Billing Address",
      },
    });
    billingAddressId = billingAddress.id;
  }

  // Use same address for billing if not provided
  if (!billingAddressId) {
    billingAddressId = shippingAddressId;
  }

  if (!shippingAddressId || !billingAddressId) {
    throw new Error(CHECKOUT_ERRORS.INVALID_ADDRESS.message);
  }

  // Calculate totals (simplified - adjust based on your business logic)
  const subtotal = cart.items.reduce(
    (sum, item) => sum + parseFloat(item.totalPrice.toString()),
    0
  );

  const shippingCost = 10; // Fixed for now, can be dynamic based on shipping method
  const taxRate = 0.1; // 10% tax
  const taxAmount = subtotal * taxRate;
  const total = subtotal + shippingCost + taxAmount;

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Create order in transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create order
    const newOrder = await tx.order.create({
      data: {
        userId,
        status: "PENDING",
        paymentStatus: "PENDING",
        shippingStatus: "PENDING",
        shippingAddressId,
        billingAddressId,
        subtotal,
        shippingCost,
        taxAmount,
        discountAmount: 0,
        total,
        currency: "USD",
        metadata: {
          orderNumber,
          paymentMethod: input.paymentMethod,
          notes: input.notes,
        },
      },
    });

    // Create order items from cart items
    await Promise.all(
      cart.items.map((item) =>
        tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            variantId: item.variantId,
            sku: item.sku,
            title: item.title,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            taxAmount: 0,
            discountAmount: 0,
          },
        })
      )
    );

    // Clear cart items
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return newOrder;
  });

  return {
    id: order.id,
    orderNumber,
    status: order.status,
    total: parseFloat(order.total.toString()),
    createdAt: order.createdAt,
    paymentUrl: input.paymentMethod === "CREDIT_CARD" ? `/payment/${order.id}` : undefined,
  };
}

/**
 * Get user's saved addresses
 */
export async function getUserAddresses(userId: string) {
  return await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      shippingAddress: true,
      billingAddress: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
}
