/**
 * Order Service
 *
 * Manages order lifecycle and transitions between states.
 *
 * ORDER STATES:
 * - DRAFT: Initial state (optional, for saved carts)
 * - PENDING_PAYMENT: Order created, stock reserved, awaiting payment
 * - PAID: Payment confirmed, stock committed
 * - EXPIRED: Payment timeout, stock released
 * - CANCELLED: User/admin cancelled, stock released
 * - FULFILLED: Order shipped/completed
 * - REFUNDED: Payment refunded (separate flow)
 */

import { OrderStatus, PaymentStatus, Prisma } from "@/app/generated/prisma";
import prisma from "@/shared/lib/prisma";
import { releaseReservedStock, type CartItemForStock } from "./inventory.service";

/**
 * Order with items for inventory operations
 */
export type OrderWithItems = {
  id: string;
  status: OrderStatus;
  items: {
    productId: string;
    variantId: string | null;
    quantity: number;
  }[];
};

/**
 * Create a new order in PENDING_PAYMENT status
 * This should be called AFTER stock reservation succeeds
 *
 * @param tx - Prisma transaction client
 * @param data - Order creation data
 * @returns Created order
 */
export async function createPendingOrder(
  tx: Prisma.TransactionClient,
  data: {
    userId?: string;
    items: Array<{
      productId: string;
      variantId?: string | null;
      sku: string;
      title: string;
      quantity: number;
      unitPrice: number | string;
    }>;
    shippingAddressId?: string;
    billingAddressId?: string;
    shippingMethodId?: string;
    shippingCost?: number;
    taxAmount?: number;
    discountAmount?: number;
    currency?: string;
    metadata?: Prisma.JsonValue;
  }
) {
  // Calculate totals
  const subtotal = data.items.reduce((sum, item) => {
    const price = typeof item.unitPrice === "string" ? parseFloat(item.unitPrice) : item.unitPrice;
    return sum + price * item.quantity;
  }, 0);

  const shippingCost = data.shippingCost || 0;
  const taxAmount = data.taxAmount || 0;
  const discountAmount = data.discountAmount || 0;
  const total = subtotal + shippingCost + taxAmount - discountAmount;

  // Set reservation expiry (60 minutes from now)
  const reservationExpiresAt = new Date();
  reservationExpiresAt.setMinutes(reservationExpiresAt.getMinutes() + 60);

  // Create order
  const order = await tx.order.create({
    data: {
      userId: data.userId,
      status: OrderStatus.PENDING_PAYMENT,
      paymentStatus: PaymentStatus.PENDING,
      shippingStatus: "NOT_REQUIRED", // Update based on product types
      currency: data.currency || "USD",
      subtotal,
      shippingCost,
      taxAmount,
      discountAmount,
      total,
      shippingAddressId: data.shippingAddressId,
      billingAddressId: data.billingAddressId,
      shippingMethodId: data.shippingMethodId,
      reservationExpiresAt,
      metadata: data.metadata,
      placedAt: new Date(),
    },
    include: {
      shippingAddress: true,
      billingAddress: true,
      shippingMethod: true,
    },
  });

  // Create order items
  for (const item of data.items) {
    await tx.orderItem.create({
      data: {
        orderId: order.id,
        productId: item.productId,
        variantId: item.variantId || null,
        sku: item.sku,
        title: item.title,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice:
          (typeof item.unitPrice === "string" ? parseFloat(item.unitPrice) : item.unitPrice) *
          item.quantity,
        taxAmount: 0, // Can be calculated per item if needed
        discountAmount: 0,
      },
    });
  }

  return order;
}

/**
 * Mark order as PAID after successful payment
 * This should be called AFTER stock is committed
 *
 * @param tx - Prisma transaction client
 * @param orderId - Order ID
 * @param paymentData - Payment confirmation data
 */
export async function markOrderAsPaid(
  tx: Prisma.TransactionClient,
  orderId: string,
  paymentData: {
    provider: string;
    providerPaymentId: string;
    amount: number | string;
    method?: string;
    rawResponse?: Prisma.JsonValue;
    webhookEventId?: string;
  }
) {
  // Update order status
  const order = await tx.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.PAID,
      paymentStatus: PaymentStatus.PAID,
      paidAt: new Date(),
      reservationExpiresAt: null, // Clear expiry since it's paid
    },
    include: {
      items: true,
    },
  });

  // Create payment record
  await tx.payment.create({
    data: {
      orderId,
      provider: paymentData.provider,
      providerPaymentId: paymentData.providerPaymentId,
      amount: paymentData.amount,
      currency: order.currency,
      status: PaymentStatus.PAID,
      method: paymentData.method,
      rawResponse: paymentData.rawResponse as Prisma.InputJsonValue | undefined,
      webhookEventId: paymentData.webhookEventId,
      processedAt: new Date(),
    },
  });

  return order;
}

/**
 * Mark order as EXPIRED and release stock
 * Called when payment times out (no payment within reservation window)
 *
 * @param tx - Prisma transaction client
 * @param orderId - Order ID
 */
export async function expireOrder(tx: Prisma.TransactionClient, orderId: string) {
  // Get order with items
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        select: {
          productId: true,
          variantId: true,
          quantity: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  // Only expire orders in PENDING_PAYMENT status
  if (order.status !== OrderStatus.PENDING_PAYMENT) {
    return order;
  }

  // Release reserved stock
  const items: CartItemForStock[] = order.items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    quantity: item.quantity,
  }));

  await releaseReservedStock(tx, items);

  // Update order status
  const updatedOrder = await tx.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.EXPIRED,
      cancelledAt: new Date(),
    },
  });

  return updatedOrder;
}

/**
 * Cancel order and release stock
 * Can be called by user or admin
 *
 * @param tx - Prisma transaction client
 * @param orderId - Order ID
 * @param reason - Cancellation reason
 */
export async function cancelOrder(tx: Prisma.TransactionClient, orderId: string, reason?: string) {
  // Get order with items
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        select: {
          productId: true,
          variantId: true,
          quantity: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  // Can only cancel PENDING_PAYMENT orders
  if (order.status !== OrderStatus.PENDING_PAYMENT) {
    throw new Error(
      `Cannot cancel order in ${order.status} status. Only PENDING_PAYMENT orders can be cancelled.`
    );
  }

  // Release reserved stock
  const items: CartItemForStock[] = order.items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    quantity: item.quantity,
  }));

  await releaseReservedStock(tx, items);

  // Update order status
  const existingMetadata = order.metadata as unknown;
  let newMetadataForOrder: Record<string, unknown>;
  if (
    existingMetadata &&
    typeof existingMetadata === "object" &&
    !Array.isArray(existingMetadata)
  ) {
    newMetadataForOrder = {
      ...(existingMetadata as Record<string, unknown>),
      cancellationReason: reason,
    };
  } else {
    newMetadataForOrder = { cancellationReason: reason };
  }
  const updatedOrder = await tx.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.CANCELLED,
      cancelledAt: new Date(),
      metadata: newMetadataForOrder as Prisma.InputJsonValue,
    },
  });

  return updatedOrder;
}

/**
 * Get order by ID with full details
 */
export async function getOrderById(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                take: 1,
                orderBy: { sortOrder: "asc" },
              },
            },
          },
          variant: true,
        },
      },
      shippingAddress: true,
      billingAddress: true,
      shippingMethod: true,
      payments: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return order;
}

/**
 * Get orders for a user
 */
export async function getUserOrders(
  userId: string,
  options?: {
    status?: OrderStatus;
    limit?: number;
    offset?: number;
  }
) {
  const where: Prisma.OrderWhereInput = { userId };

  if (options?.status) {
    where.status = options.status;
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                take: 1,
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      },
      shippingAddress: true,
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit || 10,
    skip: options?.offset || 0,
  });

  return orders;
}

/**
 * Find expired orders that need stock release
 * This should be called by a cron job
 */
export async function findExpiredOrders() {
  const now = new Date();

  const expiredOrders = await prisma.order.findMany({
    where: {
      status: OrderStatus.PENDING_PAYMENT,
      reservationExpiresAt: {
        lte: now,
      },
    },
    include: {
      items: {
        select: {
          productId: true,
          variantId: true,
          quantity: true,
        },
      },
    },
  });

  return expiredOrders;
}
