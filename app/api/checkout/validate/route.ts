import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrCreateUserCart } from "@/features/cart/services/cart.service";
import { canProceedToCheckout } from "@/features/checkout/utils";
import { withApiRoute } from "@/shared/lib/errors/handlers/api";

export const GET = withApiRoute(async (request: Request) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({
      canProceed: false,
      reason: "Please sign in to proceed with checkout",
    });
  }

  // Check cart
  const cart = await getOrCreateUserCart(session.user.id);
  const itemCount = cart?.items?.length || 0;

  const validation = canProceedToCheckout(true, itemCount);

  return NextResponse.json(validation);
});
