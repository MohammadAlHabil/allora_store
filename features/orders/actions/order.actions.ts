"use server";

import { auth } from "@/auth";
import { orderService } from "../services/order.service";
import type { OrderWithDetails, OrdersListResult, OrdersListParams } from "../types";
import { ordersListParamsSchema, cancelOrderSchema } from "../validations/order.schema";

/**
 * Get user's orders with filters and pagination
 */
export async function getUserOrdersAction(
  params: OrdersListParams
): Promise<{ success: true; data: OrdersListResult } | { success: false; error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedParams = ordersListParamsSchema.parse(params);
    const result = await orderService.getUserOrders(session.user.id, validatedParams);

    return { success: true, data: result };
  } catch (error) {
    console.error("Get user orders error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch orders",
    };
  }
}

/**
 * Get order by ID
 */
export async function getOrderByIdAction(
  orderId: string
): Promise<{ success: true; data: OrderWithDetails } | { success: false; error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const order = await orderService.getOrderById(orderId, session.user.id);

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    return { success: true, data: order };
  } catch (error) {
    console.error("Get order error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch order",
    };
  }
}

/**
 * Cancel an order
 */
export async function cancelOrderAction(
  orderId: string,
  reason?: string
): Promise<{ success: true; data: OrderWithDetails } | { success: false; error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = cancelOrderSchema.parse({ orderId, reason });
    const order = await orderService.cancelOrder(validated, session.user.id);

    return { success: true, data: order };
  } catch (error) {
    console.error("Cancel order error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel order",
    };
  }
}
