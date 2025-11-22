import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/features/checkout/services/stripe.service";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, orderId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Create Payment Intent - Cards only (no Link)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      payment_method_types: ["card"], // Only credit/debit cards
      payment_method_options: {
        card: {
          setup_future_usage: undefined, // Disable saving cards / Link
        },
      },
      metadata: {
        userId: session.user.id,
        orderId: orderId || "",
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: unknown) {
    console.error("Stripe Payment Intent Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: "Failed to create payment intent",
        details: message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
