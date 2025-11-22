import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { createOrder } from "@/features/checkout/services";
import { createOrderSchema } from "@/features/checkout/validations";
import { withApiRoute } from "@/shared/lib/errors/handlers/api";

export const POST = withApiRoute(async (request: Request) => {
  const req = request as unknown as NextRequest;

  // Get authenticated user
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Please sign in to complete checkout" }, { status: 401 });
  }

  // Parse and validate request body
  const body = await req.json();
  console.log("🔵 Create Order API - Request body:", JSON.stringify(body, null, 2));

  try {
    const validatedInput = createOrderSchema.parse(body);
    console.log("✅ Validation passed, creating order...");

    // Create order
    const order = await createOrder(session.user.id, validatedInput);
    console.log("✅ Order created successfully:", order.id);

    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      console.log("❌ Validation failed:", JSON.stringify(error.errors, null, 2));
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors || [] },
        { status: 400 }
      );
    }

    console.log("❌ Unexpected error:", error);
    throw error;
  }
});
