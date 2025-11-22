/**
 * PHASE A: Validate Cart and Check Stock Availability
 *
 * GET /api/checkout/validate
 *
 * This endpoint validates that the user can proceed to checkout:
 * - User is authenticated
 * - Cart is not empty
 * - All items have sufficient stock
 *
 * This is a READ-ONLY check and does NOT reserve stock.
 * Stock is reserved in the next phase (reserve-and-initiate-payment).
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { validateCheckout } from "@/features/checkout/services/checkout.service";
import { withApiRoute } from "@/shared/lib/errors/handlers/api";

export const GET = withApiRoute(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        success: false,
        canProceed: false,
        error: {
          message: "Please sign in to proceed with checkout",
          code: "AUTH_REQUIRED",
        },
      },
      { status: 401 }
    );
  }

  try {
    // Validate cart and check stock availability
    const validation = await validateCheckout(session.user.id);

    return NextResponse.json({
      success: validation.isValid,
      canProceed: validation.isValid,
      cart: {
        id: validation.cart.id,
        itemCount: validation.cart.items.length,
        items: validation.cart.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          variantId: item.variantId,
          sku: item.sku,
          title: item.title,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unitPrice.toString()),
          totalPrice: parseFloat(item.totalPrice.toString()),
          product: item.product,
          variant: item.variant,
        })),
      },
      stockResults: validation.stockResults.map((result) => ({
        ...result,
        title: result.title || "Unknown Product",
      })),
      errors: validation.errors,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        canProceed: false,
        error: {
          message: message || "Validation failed",
          code: "VALIDATION_ERROR",
        },
      },
      { status: 400 }
    );
  }
});
