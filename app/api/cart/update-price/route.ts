import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/shared/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, variantId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Get current cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        cart: { userId: session.user.id },
        productId,
        variantId: variantId || null,
      },
    });

    if (!cartItem) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    // Get latest price from product/variant
    let latestPrice: number;

    if (variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        select: { price: true },
      });

      if (!variant) {
        return NextResponse.json({ error: "Variant not found" }, { status: 404 });
      }

      latestPrice = Number(variant.price);
    } else {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { basePrice: true },
      });

      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      latestPrice = Number(product.basePrice);
    }

    // Update cart item with latest price and recalculate total
    await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: {
        unitPrice: latestPrice,
        totalPrice: latestPrice * cartItem.quantity,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Price updated successfully",
      price: latestPrice,
    });
  } catch (error) {
    console.error("Error updating price:", error);
    return NextResponse.json({ error: "Failed to update price" }, { status: 500 });
  }
}
