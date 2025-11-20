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
  try {
    const validatedInput = createOrderSchema.parse(body);

    // Create order
    const order = await createOrder(session.user.id, validatedInput);

    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors || [] },
        { status: 400 }
      );
    }

    throw error;
  }
});
