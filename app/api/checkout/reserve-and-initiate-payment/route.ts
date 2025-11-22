/**
 * PHASE B: Reserve Stock and Create PENDING_PAYMENT Order
 *
 * POST /api/checkout/reserve-and-initiate-payment
 *
 * This endpoint:
 * 1. Validates stock availability
 * 2. Reserves stock (soft reservation)
 * 3. Creates order with PENDING_PAYMENT status
 * 4. Returns payment session URL
 *
 * All operations are atomic via Prisma transaction.
 * If any step fails, stock reservation is rolled back.
 *
 * REQUEST BODY:
 * {
 *   shippingAddressId?: string,
 *   billingAddressId?: string,
 *   shippingAddress?: { firstName, lastName, ... },
 *   billingAddress?: { ... },
 *   shippingMethodId: string,
 *   paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH_ON_DELIVERY',
 *   couponCode?: string,
 *   notes?: string,
 * }
 *
 * RESPONSE:
 * {
 *   success: true,
 *   order: {
 *     id: string,
 *     orderNumber: string,
 *     status: 'PENDING_PAYMENT',
 *     total: number,
 *     createdAt: Date,
 *     paymentUrl?: string,
 *   }
 * }
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { reserveAndCreateOrder } from "@/features/checkout/services/checkout.service";
import type { CreateOrderInput } from "@/features/checkout/types";
import { withApiRoute } from "@/shared/lib/errors/handlers/api";

export const POST = withApiRoute(async (request: Request) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Authentication required",
          code: "AUTH_REQUIRED",
        },
      },
      { status: 401 }
    );
  }

  try {
    const body: CreateOrderInput = await request.json();

    // Validate required fields
    if (!body.shippingMethodId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Shipping method is required",
            code: "INVALID_INPUT",
          },
        },
        { status: 400 }
      );
    }

    if (!body.paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Payment method is required",
            code: "INVALID_INPUT",
          },
        },
        { status: 400 }
      );
    }

    // Must have either address IDs or address data
    if (!body.shippingAddressId && !body.shippingAddress) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Shipping address is required",
            code: "INVALID_INPUT",
          },
        },
        { status: 400 }
      );
    }

    // Reserve stock and create order
    const orderResponse = await reserveAndCreateOrder(session.user.id, body);

    return NextResponse.json({
      success: true,
      order: orderResponse,
    });
  } catch (error: unknown) {
    console.error("[Reserve & Initiate Payment] Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    const code = "ORDER_CREATION_FAILED";

    return NextResponse.json(
      {
        success: false,
        error: {
          message: message || "Failed to create order",
          code,
        },
      },
      { status: 400 }
    );
  }
});
