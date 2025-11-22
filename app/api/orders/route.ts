import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { orderService } from "@/features/orders/services/order.service";
import { ordersListParamsSchema } from "@/features/orders/validations/order.schema";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = {
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 10,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
      status: searchParams.get("status") || undefined,
      paymentStatus: searchParams.get("paymentStatus") || undefined,
      shippingStatus: searchParams.get("shippingStatus") || undefined,
    };

    const validatedParams = ordersListParamsSchema.parse(params);
    const result = await orderService.getUserOrders(session.user.id, validatedParams);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Get user orders error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}
