import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { orderService } from "@/features/orders/services/order.service";
import { cancelOrderSchema } from "@/features/orders/validations/order.schema";

type Props = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const validated = cancelOrderSchema.parse({
      orderId: id,
      reason: body.reason,
    });

    const order = await orderService.cancelOrder(validated, session.user.id);

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to cancel order",
      },
      { status: 500 }
    );
  }
}
