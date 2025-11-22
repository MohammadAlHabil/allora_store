/**
 * Checkout Service
 *
 * Orchestrates the complete checkout flow with inventory management:
 * 1. PHASE A: Validate cart and check stock availability
 * 2. PHASE B: Reserve stock and create PENDING_PAYMENT order
 * 3. PHASE C: Process payment (delegated to payment service)
 * 4. PHASE D: Handle payment failures/cancellations
 */

import prisma from "@/shared/lib/prisma";
import { sendOrderConfirmationEmail } from "@/shared/services/emails.server";
import { CHECKOUT_ERRORS } from "../constants";
import type { CreateOrderInput, OrderResponse } from "../types";
import {
  checkStockAvailability,
  reserveStock,
  commitStock,
  type CartItemForStock,
  type StockCheckResult,
} from "./inventory.service";
import { createPendingOrder } from "./order.service";

/**
 * PHASE A: Validate cart and check stock availability
 *
 * This is a READ-ONLY check to inform users if items are in stock.
 * Does NOT reserve stock yet.
 *
 * @param userId - User ID
 * @returns Validation result with stock availability
 */
export async function validateCheckout(userId: string) {
  if (!userId) {
    throw new Error(CHECKOUT_ERRORS.AUTH_REQUIRED.message);
  }

  // Get user's cart
  const cart = await prisma.cart.findFirst({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              basePrice: true,
              images: true,
            },
          },
          variant: true,
        },
      },
    },
  });

  if (!cart) {
    throw new Error(CHECKOUT_ERRORS.CART_NOT_FOUND.message);
  }

  console.log("🔵 Validate Checkout - Cart:", {
    cartId: cart.id,
    itemCount: cart.items.length,
    items: cart.items.map((i) => ({ id: i.id, title: i.title, quantity: i.quantity })),
  });

  if (cart.items.length === 0) {
    throw new Error(CHECKOUT_ERRORS.CART_EMPTY.message);
  }

  // Check stock availability for all items
  const stockItems: CartItemForStock[] = cart.items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    quantity: item.quantity,
  }));

  const stockResults = await checkStockAvailability(stockItems);

  // Enrich results with product names and images from cart
  const enrichedResults = stockResults.map((result: StockCheckResult) => {
    const cartItem = cart.items.find(
      (item) => item.productId === result.productId && item.variantId === result.variantId
    );

    // Get image from variant or product
    const image = cartItem?.product.images?.[0]?.url;
    // If variant has specific images, we could use them here if available in the schema
    // For now, defaulting to product image

    return {
      ...result,
      title: result.title || cartItem?.product.name || "Unknown Product",
      image,
    };
  });

  // Find any items that are not available
  const unavailableItems = enrichedResults.filter(
    (result: StockCheckResult) => !result.isAvailable
  );

  // Check for price changes
  const priceIssues: {
    message: string;
    code: string;
    field: string;
    image?: string;
    productId: string;
    variantId: string | null;
  }[] = [];

  cart.items.forEach((item) => {
    const currentPrice = item.variant
      ? parseFloat((item.variant.price || item.product.basePrice).toString())
      : parseFloat(item.product.basePrice.toString());

    const cartPrice = parseFloat(item.unitPrice.toString());

    console.log(`💰 Price Check for ${item.title}:`, {
      currentPrice,
      cartPrice,
      diff: currentPrice - cartPrice,
      isMatch: currentPrice === cartPrice,
    });

    if (currentPrice !== cartPrice) {
      priceIssues.push({
        message: `Price changed for ${item.title} (was ${cartPrice}, now ${currentPrice})`,
        code: "PRICE_CHANGED",
        field: item.sku,
        image: item.product.images?.[0]?.url,
        productId: item.productId,
        variantId: item.variantId,
      });
    }
  });

  const allErrors = [
    ...unavailableItems.map((item: StockCheckResult) => ({
      message: item.reason || "Item not available",
      code: "OUT_OF_STOCK",
      field: item.sku,
    })),
    ...priceIssues,
  ];

  return {
    isValid: unavailableItems.length === 0 && priceIssues.length === 0,
    cart,
    stockResults: enrichedResults,
    unavailableItems,
    errors: allErrors,
  };
}

/**
 * PHASE B: Reserve stock and create PENDING_PAYMENT order
 *
 * This is called BEFORE redirecting to payment.
 * - Validates stock availability
 * - Reserves stock (soft reservation)
 * - Creates order with PENDING_PAYMENT status
 * - Returns payment session data
 *
 * All operations are atomic via Prisma transaction.
 *
 * @param userId - User ID
 * @param input - Checkout data (addresses, shipping, payment method)
 * @returns Order response with payment URL
 */
export async function reserveAndCreateOrder(
  userId: string,
  input: CreateOrderInput
): Promise<OrderResponse> {
  // First validate checkout (including stock check)
  const validation = await validateCheckout(userId);

  if (!validation.isValid) {
    throw new Error(
      `Cannot proceed to checkout: ${validation.errors
        .map((e: { message?: string }) => e.message)
        .join(", ")}`
    );
  }

  const cart = validation.cart;

  // Handle addresses
  let shippingAddressId = input.shippingAddressId;
  let billingAddressId = input.billingAddressId;

  // Create addresses if needed (outside transaction for simplicity)
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

  // Get shipping method for cost calculation
  const shippingMethod = input.shippingMethodId
    ? await prisma.shippingMethod.findUnique({
        where: { id: input.shippingMethodId },
      })
    : null;

  const shippingCost = shippingMethod ? parseFloat(shippingMethod.basePrice.toString()) : 0;

  // Calculate tax (simplified - you can make this more sophisticated)
  const subtotal = cart.items.reduce(
    (sum, item) => sum + parseFloat(item.totalPrice.toString()),
    0
  );
  const taxRate = 0.1; // 10% tax
  const taxAmount = subtotal * taxRate;

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // ATOMIC TRANSACTION: Reserve stock + Create order
  const order = await prisma.$transaction(async (tx) => {
    // 1. Reserve stock for cart items
    const stockItems: CartItemForStock[] = cart.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    await reserveStock(tx, stockItems);

    // 2. Create order in PENDING_PAYMENT status
    const newOrder = await createPendingOrder(tx, {
      userId,
      items: cart.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        sku: item.sku,
        title: item.title,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice.toString()),
      })),
      shippingAddressId,
      billingAddressId,
      shippingMethodId: input.shippingMethodId,
      shippingCost,
      taxAmount,
      discountAmount: 0,
      currency: "USD",
      metadata: {
        orderNumber,
        paymentMethod: input.paymentMethod,
        notes: input.notes,
        couponCode: input.couponCode,
      },
    });

    // 3. Clear cart items (order is now the source of truth)
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return newOrder;
  });

  // Generate payment URL based on payment method
  let paymentUrl: string | undefined;

  if (input.paymentMethod === "CREDIT_CARD") {
    // For card payments, redirect to Stripe checkout
    paymentUrl = `/api/payment/create-session?orderId=${order.id}`;
  }
  // For CASH_ON_DELIVERY, no payment URL needed

  // Safely extract orderNumber from metadata if present
  const orderMeta = order.metadata as unknown;
  let metadataOrderNumber: string | undefined;
  if (orderMeta && typeof orderMeta === "object" && !Array.isArray(orderMeta)) {
    metadataOrderNumber = (orderMeta as Record<string, unknown>)["orderNumber"] as
      | string
      | undefined;
  }

  return {
    id: order.id,
    orderNumber: metadataOrderNumber || orderNumber,
    status: order.status,
    total: parseFloat(order.total.toString()),
    createdAt: order.createdAt,
    paymentUrl,
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
 * Create Order (NEW FLOW)
 *
 * This is called AFTER payment confirmation (for Stripe) or immediately (for COD).
 * - Validates cart and stock
 * - Reserves stock
 * - Creates order
 * - For COD: Commits stock immediately and marks as PAID
 * - For Stripe: Links paymentIntentId and waits for webhook to commit stock
 * - Clears cart
 * - Sends order confirmation email
 *
 * @param userId - User ID
 * @param input - Order creation input with paymentIntentId for Stripe payments
 * @returns Order response
 */
export async function createOrder(userId: string, input: CreateOrderInput): Promise<OrderResponse> {
  // Check if this is express checkout (single product purchase)
  const isExpressCheckout = !!input.expressCheckoutItem;

  let cart: Awaited<ReturnType<typeof validateCheckout>>["cart"] | undefined;
  let orderItems;

  if (isExpressCheckout && input.expressCheckoutItem) {
    // Express checkout: Create order from single product
    console.log(
      "🚀 Express Checkout Mode - Creating order from express item:",
      input.expressCheckoutItem
    );

    // Validate product and variant exist
    const product = await prisma.product.findUnique({
      where: { id: input.expressCheckoutItem.productId },
      include: {
        variants: {
          where: input.expressCheckoutItem.variantId
            ? { id: input.expressCheckoutItem.variantId }
            : undefined,
          include: { inventory: true },
        },
      },
    });

    if (!product || !product.isAvailable) {
      throw new Error("Product is not available");
    }

    // Check stock for the variant or product
    const variant = input.expressCheckoutItem.variantId
      ? product.variants.find((v) => v.id === input.expressCheckoutItem!.variantId)
      : null;

    const inventory = variant?.inventory;
    const availableQty = inventory
      ? Math.max(0, (inventory.quantity || 0) - (inventory.reserved || 0))
      : 0;

    if (inventory && availableQty < input.expressCheckoutItem.quantity) {
      throw new Error(`Only ${availableQty} units available for this product`);
    }

    // Create order items array for express checkout
    orderItems = [
      {
        productId: input.expressCheckoutItem.productId,
        variantId: input.expressCheckoutItem.variantId,
        sku: input.expressCheckoutItem.sku || product.sku || `PROD-${product.id}`,
        title: input.expressCheckoutItem.productName,
        quantity: input.expressCheckoutItem.quantity,
        unitPrice: input.expressCheckoutItem.unitPrice,
      },
    ];
  } else {
    // Regular checkout: Validate cart and use cart items
    const validation = await validateCheckout(userId);

    if (!validation.isValid) {
      throw new Error(
        `Cannot proceed to checkout: ${validation.errors
          .map((e: { message?: string }) => e.message)
          .join(", ")}`
      );
    }

    cart = validation.cart;

    // Create order items from cart
    orderItems = cart.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      sku: item.sku,
      title: item.title,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unitPrice.toString()),
    }));
  }

  // Get user details for email
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user?.email) {
    throw new Error("User email not found");
  }

  // Handle addresses
  let shippingAddressId = input.shippingAddressId;
  let billingAddressId = input.billingAddressId;

  console.log("🔍 Address handling:", {
    shippingAddressId,
    hasShippingAddress: !!input.shippingAddress,
    shippingAddressHasId: input.shippingAddress?.id,
    billingAddressId,
    hasBillingAddress: !!input.billingAddress,
    billingAddressHasId: input.billingAddress?.id,
  });

  // Create addresses if needed (outside transaction for simplicity)
  // Only create new address if no ID provided AND address data exists
  if (!shippingAddressId && input.shippingAddress) {
    // Check if address has an ID (user selected existing address)
    if (input.shippingAddress.id) {
      console.log("✅ Using existing shipping address:", input.shippingAddress.id);
      shippingAddressId = input.shippingAddress.id;
    } else {
      console.log("📝 Creating new shipping address");
      // Create new address only if no ID exists
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
      console.log("✅ New shipping address created:", shippingAddressId);
    }
  }

  if (!billingAddressId && input.billingAddress) {
    // Check if address has an ID (user selected existing address)
    if (input.billingAddress.id) {
      console.log("✅ Using existing billing address:", input.billingAddress.id);
      billingAddressId = input.billingAddress.id;
    } else {
      console.log("📝 Creating new billing address");
      // Create new address only if no ID exists
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
      console.log("✅ New billing address created:", billingAddressId);
    }
  }

  // Use same address for billing if not provided
  if (!billingAddressId) {
    billingAddressId = shippingAddressId;
  }

  if (!shippingAddressId || !billingAddressId) {
    throw new Error(CHECKOUT_ERRORS.INVALID_ADDRESS.message);
  }

  // Get shipping method for cost calculation
  const shippingMethod = input.shippingMethodId
    ? await prisma.shippingMethod.findUnique({
        where: { id: input.shippingMethodId },
      })
    : null;

  const shippingCost = shippingMethod ? parseFloat(shippingMethod.basePrice.toString()) : 0;

  // Calculate tax (simplified - you can make this more sophisticated)
  const subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const taxRate = 0.1; // 10% tax
  const taxAmount = subtotal * taxRate;

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Determine if this is COD or card payment
  const isCOD = input.paymentMethod === "CASH_ON_DELIVERY";
  const hasPaymentIntent = !!input.paymentIntentId;

  // ATOMIC TRANSACTION: Reserve stock + Create order + Commit stock (for COD) + Clear cart
  // Increase timeout to 15 seconds for complex operations (inventory, order, payment, cart)
  const order = await prisma.$transaction(
    async (tx) => {
      // 1. Reserve stock for items
      const stockItems: CartItemForStock[] = orderItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      await reserveStock(tx, stockItems);

      // 2. Create order
      const newOrder = await createPendingOrder(tx, {
        userId,
        items: orderItems,
        shippingAddressId,
        billingAddressId,
        shippingMethodId: input.shippingMethodId,
        shippingCost,
        taxAmount,
        discountAmount: 0,
        currency: "USD",
        metadata: {
          orderNumber,
          paymentMethod: input.paymentMethod,
          notes: input.notes,
          couponCode: input.couponCode,
          paymentIntentId: input.paymentIntentId,
        },
      });

      // 3. Commit stock and create payment
      await commitStock(tx, stockItems);

      if (isCOD) {
        // For COD: Payment will be collected on delivery
        await tx.order.update({
          where: { id: newOrder.id },
          data: {
            status: "PENDING_PAYMENT", // Will be paid on delivery
            paymentStatus: "PENDING", // Will be updated to PAID on delivery
            reservationExpiresAt: null, // Stock committed, no expiration
          },
        });

        await tx.payment.create({
          data: {
            orderId: newOrder.id,
            provider: "CASH_ON_DELIVERY",
            providerPaymentId: `COD-${newOrder.id}`,
            amount: newOrder.total,
            currency: newOrder.currency,
            status: "PENDING", // Will be updated to PAID on delivery
            method: "CASH_ON_DELIVERY",
          },
        });
      } else if (hasPaymentIntent) {
        // For Stripe: Payment confirmed
        await tx.order.update({
          where: { id: newOrder.id },
          data: {
            status: "PAID",
            paymentStatus: "PAID",
            paidAt: new Date(),
            reservationExpiresAt: null,
          },
        });

        await tx.payment.create({
          data: {
            orderId: newOrder.id,
            provider: "stripe",
            providerPaymentId: input.paymentIntentId!,
            amount: newOrder.total,
            currency: newOrder.currency,
            status: "PAID",
            method: "card",
            processedAt: new Date(),
          },
        });
      } else {
        // For other payment methods: Mark as pending
        await tx.order.update({
          where: { id: newOrder.id },
          data: {
            status: "PENDING_PAYMENT",
            paymentStatus: "PENDING",
            reservationExpiresAt: null, // Stock committed
          },
        });

        await tx.payment.create({
          data: {
            orderId: newOrder.id,
            provider: input.paymentMethod === "CREDIT_CARD" ? "card" : "other",
            providerPaymentId: `ORDER-${newOrder.id}`,
            amount: newOrder.total,
            currency: newOrder.currency,
            status: "PENDING",
            method: input.paymentMethod === "CREDIT_CARD" ? "card" : "other",
          },
        });
      }

      // 4. Clear cart items ONLY for regular checkout (not express)
      if (!isExpressCheckout && cart) {
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }

      return newOrder;
    },
    {
      timeout: 15000, // 15 seconds timeout for complex checkout operations
    }
  );

  // Send order confirmation email (async, don't block the response)
  const orderWithDetails = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      items: true,
      shippingAddress: true,
    },
  });

  if (orderWithDetails && user.email) {
    sendOrderConfirmationEmail(user.email, {
      orderNumber,
      orderId: order.id,
      total: parseFloat(order.total.toString()),
      currency: order.currency,
      items: orderWithDetails.items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice.toString()),
      })),
      shippingAddress: orderWithDetails.shippingAddress,
    }).catch((err) => {
      // Log error but don't fail the order creation
      console.error("Failed to send order confirmation email:", err);
    });
  }

  return {
    id: order.id,
    orderNumber,
    status: order.status, // Return actual status (CONFIRMED for COD, PAID for card)
    total: parseFloat(order.total.toString()),
    createdAt: order.createdAt,
  };
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
