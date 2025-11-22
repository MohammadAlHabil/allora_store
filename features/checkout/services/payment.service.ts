/**
 * Payment Service
 *
 * Handles payment processing and webhooks from payment providers (Stripe, PayPal, etc.)
 *
 * CRITICAL: All webhook handlers MUST be idempotent
 * - Multiple webhook calls with the same event ID should NOT double-process
 * - Use webhookEventId for deduplication
 *
 * PAYMENT FLOW:
 * 1. Order created in PENDING_PAYMENT status (stock reserved)
 * 2. User redirected to payment provider
 * 3. Payment provider sends webhook on success/failure
 * 4. Webhook handler:
 *    - SUCCESS: Commit stock, mark order as PAID
 *    - FAILURE: Release stock, mark order as CANCELLED
 */

import { OrderStatus, PaymentStatus } from "@/app/generated/prisma";
import prisma from "@/shared/lib/prisma";
import { commitStock, releaseReservedStock, type CartItemForStock } from "./inventory.service";
import { markOrderAsPaid, cancelOrder, getOrderById } from "./order.service";

/**
 * Stripe webhook event data (simplified)
 */
export type StripeWebhookEvent = {
  id: string; // Stripe event ID (for idempotency)
  type: string; // e.g., 'checkout.session.completed'
  data: {
    object: {
      id: string; // Payment intent or session ID
      amount_total?: number;
      currency?: string;
      payment_intent?: string;
      metadata?: {
        orderId?: string;
      };
    };
  };
};

/**
 * PHASE C: Process successful payment webhook
 *
 * This is called when payment provider confirms successful payment.
 * - Validates order status
 * - Commits stock (deducts from inventory)
 * - Marks order as PAID
 * - Creates payment record
 *
 * IDEMPOTENT: Can be called multiple times with same webhookEventId
 *
 * @param webhookEvent - Stripe/PayPal webhook event
 * @returns Processed order
 */
export async function processPaymentSuccess(webhookEvent: StripeWebhookEvent) {
  const { id: webhookEventId, data } = webhookEvent;
  const orderId = data.object.metadata?.orderId;

  if (!orderId) {
    throw new Error("Order ID not found in webhook metadata");
  }

  // Check if this webhook was already processed (idempotency)
  const existingPayment = await prisma.payment.findFirst({
    where: {
      webhookEventId,
    },
  });

  if (existingPayment) {
    console.log(`Webhook ${webhookEventId} already processed, skipping`);
    // Return the existing order (idempotent behavior)
    const order = await getOrderById(orderId);
    return order;
  }

  // Load order with items
  const order = await getOrderById(orderId);

  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  // If order is already PAID, this is a duplicate webhook
  if (order.status === OrderStatus.PAID) {
    console.log(`Order ${orderId} already paid, skipping`);
    return order;
  }

  // Only process PENDING_PAYMENT orders
  if (order.status !== OrderStatus.PENDING_PAYMENT) {
    throw new Error(
      `Cannot process payment for order in ${order.status} status. ` +
        `Order must be in PENDING_PAYMENT status.`
    );
  }

  // ATOMIC TRANSACTION: Commit stock + Mark as PAID
  const updatedOrder = await prisma.$transaction(async (tx) => {
    // 1. Commit stock (deduct from inventory)
    const stockItems: CartItemForStock[] = order.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    await commitStock(tx, stockItems);

    // 2. Mark order as PAID and create payment record
    const paidOrder = await markOrderAsPaid(tx, orderId, {
      provider: "stripe",
      providerPaymentId: data.object.payment_intent || data.object.id,
      amount: data.object.amount_total
        ? data.object.amount_total / 100
        : parseFloat(order.total.toString()),
      method: "card",
      rawResponse: webhookEvent,
      webhookEventId,
    });

    return paidOrder;
  });

  console.log(`Payment processed successfully for order ${orderId}`);

  return updatedOrder;
}

/**
 * PHASE D: Process failed payment webhook
 *
 * This is called when payment fails or is cancelled.
 * - Releases reserved stock
 * - Marks order as CANCELLED
 * - Creates payment record with FAILED status
 *
 * IDEMPOTENT: Can be called multiple times with same webhookEventId
 *
 * @param webhookEvent - Stripe/PayPal webhook event
 * @returns Cancelled order
 */
export async function processPaymentFailure(webhookEvent: StripeWebhookEvent, reason?: string) {
  const { id: webhookEventId, data } = webhookEvent;
  const orderId = data.object.metadata?.orderId;

  if (!orderId) {
    throw new Error("Order ID not found in webhook metadata");
  }

  // Check if this webhook was already processed (idempotency)
  const existingPayment = await prisma.payment.findFirst({
    where: {
      webhookEventId,
    },
  });

  if (existingPayment) {
    console.log(`Webhook ${webhookEventId} already processed, skipping`);
    const order = await getOrderById(orderId);
    return order;
  }

  // Load order
  const order = await getOrderById(orderId);

  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  // If order is already CANCELLED or EXPIRED, skip
  if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.EXPIRED) {
    console.log(`Order ${orderId} already ${order.status}, skipping`);
    return order;
  }

  // Only process PENDING_PAYMENT orders
  if (order.status !== OrderStatus.PENDING_PAYMENT) {
    throw new Error(
      `Cannot cancel order in ${order.status} status. ` + `Order must be in PENDING_PAYMENT status.`
    );
  }

  // ATOMIC TRANSACTION: Release stock + Cancel order
  const updatedOrder = await prisma.$transaction(async (tx) => {
    // 1. Cancel order and release stock
    const cancelledOrder = await cancelOrder(tx, orderId, reason || "Payment failed");

    // 2. Create payment record with FAILED status
    await tx.payment.create({
      data: {
        orderId,
        provider: "stripe",
        providerPaymentId: data.object.payment_intent || data.object.id,
        amount: data.object.amount_total
          ? data.object.amount_total / 100
          : parseFloat(order.total.toString()),
        currency: order.currency,
        status: PaymentStatus.FAILED,
        method: "card",
        rawResponse: webhookEvent,
        webhookEventId,
        processedAt: new Date(),
      },
    });

    return cancelledOrder;
  });

  console.log(`Payment failure processed for order ${orderId}`);

  return updatedOrder;
}

/**
 * Create Stripe checkout session
 * This is called when user clicks "Pay with Card"
 *
 * @param orderId - Order ID
 * @returns Stripe session URL
 */
export async function createStripeCheckoutSession(orderId: string) {
  const order = await getOrderById(orderId);

  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  if (order.status !== OrderStatus.PENDING_PAYMENT) {
    throw new Error(`Order ${orderId} is not pending payment`);
  }

  // In production, you would use the actual Stripe SDK:
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // const session = await stripe.checkout.sessions.create({
  //   payment_method_types: ['card'],
  //   line_items: order.items.map(item => ({
  //     price_data: {
  //       currency: order.currency.toLowerCase(),
  //       product_data: {
  //         name: item.title,
  //       },
  //       unit_amount: Math.round(parseFloat(item.unitPrice.toString()) * 100),
  //     },
  //     quantity: item.quantity,
  //   })),
  //   mode: 'payment',
  //   success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${orderId}`,
  //   cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancelled?orderId=${orderId}`,
  //   metadata: {
  //     orderId,
  //   },
  // });
  // return session.url;

  // For now, return a mock URL
  const mockSessionUrl = `https://checkout.stripe.com/c/pay/mock?orderId=${orderId}`;

  return {
    sessionUrl: mockSessionUrl,
    sessionId: `cs_test_${orderId}`,
  };
}

/**
 * Verify Stripe webhook signature
 *
 * IMPORTANT: In production, ALWAYS verify webhook signatures
 * to prevent spoofed requests
 *
 * @param payload - Raw request body
 * @param signature - Stripe signature header
 * @returns Whether signature is valid
 */
export function verifyStripeWebhookSignature(payload: string | Buffer, signature: string): boolean {
  // In production, use Stripe SDK:
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // try {
  //   const event = stripe.webhooks.constructEvent(
  //     payload,
  //     signature,
  //     process.env.STRIPE_WEBHOOK_SECRET
  //   );
  //   return true;
  // } catch (err) {
  //   return false;
  // }

  // For development, skip verification (NOT SAFE FOR PRODUCTION)
  console.warn("Webhook signature verification skipped (development mode)");
  return true;
}
