import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@/app/generated/prisma";
import { auth } from "@/auth";
import { createOrder } from "@/features/checkout/services";
import { createOrderSchema } from "@/features/checkout/validations";
import { withApiRoute } from "@/shared/lib/errors/handlers/api";
import prisma from "@/shared/lib/prisma";

export const POST = withApiRoute(async (request: Request) => {
  const req = request as unknown as NextRequest;

  // Get authenticated user
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Please sign in to complete checkout" }, { status: 401 });
  }

  // Check for Idempotency-Key
  const idempotencyKey = req.headers.get("Idempotency-Key");

  if (idempotencyKey) {
    const existingKey = await prisma.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });

    if (existingKey) {
      switch (existingKey.status) {
        case "COMPLETED":
          console.log(
            "🔄 Idempotency key found (COMPLETED), returning cached response:",
            idempotencyKey
          );
          return NextResponse.json(existingKey.responseBody, {
            status: existingKey.responseStatus || 200,
          });

        case "STARTED":
        case "PROCESSING":
          console.log("⏳ Idempotency key found (PROCESSING), returning 409:", idempotencyKey);
          return NextResponse.json(
            { message: "Request is currently being processed" },
            { status: 409 }
          );

        case "FAILED":
          console.log("❌ Idempotency key found (FAILED), retrying:", idempotencyKey);
          // Allow retry by updating status to STARTED (or deleting and recreating, but update is safer)
          await prisma.idempotencyKey.update({
            where: { key: idempotencyKey },
            data: { status: "STARTED", createdAt: new Date() }, // Reset timestamp
          });
          break;
      }
    } else {
      // Create new key with STARTED status
      await prisma.idempotencyKey.create({
        data: {
          key: idempotencyKey,
          userId: session.user.id,
          status: "STARTED",
        },
      });
    }
  }

  // Parse and validate request body
  const body = await req.json();
  console.log("🔵 Create Order API - Request body:", JSON.stringify(body, null, 2));

  try {
    const validatedInput = createOrderSchema.parse(body);
    console.log("✅ Validation passed, creating order...");

    // Update status to PROCESSING (optional, but good for granularity)
    if (idempotencyKey) {
      await prisma.idempotencyKey.update({
        where: { key: idempotencyKey },
        data: { status: "PROCESSING" },
      });
    }

    // Create order
    const order = await createOrder(session.user.id, validatedInput);
    console.log("✅ Order created successfully:", order.id);

    // Save idempotency key if present
    if (idempotencyKey) {
      await prisma.idempotencyKey.update({
        where: { key: idempotencyKey },
        data: {
          status: "COMPLETED",
          responseStatus: 201,
          responseBody: order as unknown as Prisma.InputJsonValue,
        },
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    // Mark as FAILED on error
    if (idempotencyKey) {
      await prisma.idempotencyKey.update({
        where: { key: idempotencyKey },
        data: { status: "FAILED" },
      });
    }

    if (error instanceof ZodError) {
      console.log("❌ Validation failed:", JSON.stringify(error.issues, null, 2));
      return NextResponse.json(
        { message: "Invalid input data", errors: error.issues || [] },
        { status: 400 }
      );
    }

    console.log("❌ Unexpected error:", error);
    throw error;
  }
});
