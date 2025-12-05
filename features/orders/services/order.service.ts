import { orderRepository } from "../repositories/order.repository";
import type {
  OrderWithDetails,
  OrdersListParams,
  OrdersListResult,
  CancelOrderInput,
  UpdateOrderStatusInput,
} from "../types";

export class OrderService {
  /**
   * Get order details by ID
   * Validates user ownership
   */
  async getOrderById(orderId: string, userId: string): Promise<OrderWithDetails | null> {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      return null;
    }

    // Verify ownership
    if (order.userId !== userId) {
      throw new Error("Unauthorized access to order");
    }

    return order;
  }

  /**
   * Get user's orders with pagination and filters
   */
  async getUserOrders(userId: string, params: OrdersListParams): Promise<OrdersListResult> {
    const { orders, total } = await orderRepository.findUserOrders(userId, params);

    const stats = await orderRepository.getUserOrderStats(userId);

    const { page = 1, limit = 10 } = params;
    const totalPages = Math.ceil(total / limit);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      stats,
    };
  }

  /**
   * Cancel an order
   * Only allows cancellation for certain statuses
   */
  async cancelOrder(input: CancelOrderInput, userId: string): Promise<OrderWithDetails> {
    const order = await orderRepository.findById(input.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    // Verify ownership
    if (order.userId !== userId) {
      throw new Error("Unauthorized access to order");
    }

    // Check if order can be cancelled
    if (!this.canCancelOrder(order.status, order.paymentStatus)) {
      throw new Error("Order cannot be cancelled at this stage");
    }

    // Cancel the order
    await orderRepository.cancel(input.orderId, input.reason);

    // Return updated order
    const updatedOrder = await orderRepository.findById(input.orderId);
    if (!updatedOrder) {
      throw new Error("Failed to retrieve cancelled order");
    }

    return updatedOrder;
  }

  /**
   * Update order status (Admin only - called from admin actions)
   */
  async updateOrderStatus(input: UpdateOrderStatusInput): Promise<OrderWithDetails> {
    const order = await orderRepository.findById(input.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    await orderRepository.updateStatus(input.orderId, {
      status: input.status,
      paymentStatus: input.paymentStatus,
      shippingStatus: input.shippingStatus,
    });

    const updatedOrder = await orderRepository.findById(input.orderId);
    if (!updatedOrder) {
      throw new Error("Failed to retrieve updated order");
    }

    return updatedOrder;
  }

  /**
   * Check if order can be cancelled based on status
   *
   * Business Rules:
   * - DRAFT: Can cancel (not finalized)
   * - PENDING_PAYMENT (COD): Can cancel (payment not received)
   * - PAID (Credit Card): CANNOT cancel (payment already processed)
   * - FULFILLED/CANCELLED/REFUNDED: Cannot cancel (final states)
   */
  private canCancelOrder(orderStatus: string, paymentStatus: string): boolean {
    // Can cancel if order is pending payment or draft
    if (orderStatus === "DRAFT" || orderStatus === "PENDING_PAYMENT") {
      return true;
    }

    // Cannot cancel paid orders (payment already processed)
    // User must contact support for refunds/returns
    if (orderStatus === "PAID") {
      return false;
    }

    // Cannot cancel fulfilled, already cancelled, or refunded orders
    return false;
  }

  /**
   * Get order status badge info
   */
  getOrderStatusInfo(status: string): {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "success";
  } {
    type StatusInfo = {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline" | "success";
    };
    const statusMap: Record<string, StatusInfo> = {
      DRAFT: { label: "Draft", variant: "outline" },
      PENDING_PAYMENT: { label: "Pending Payment", variant: "secondary" },
      PAID: { label: "Paid", variant: "success" },
      CANCELLED: { label: "Cancelled", variant: "destructive" },
      EXPIRED: { label: "Expired", variant: "destructive" },
      FULFILLED: { label: "Fulfilled", variant: "success" },
      PARTIALLY_FULFILLED: { label: "Partially Fulfilled", variant: "default" },
      REFUNDED: { label: "Refunded", variant: "secondary" },
    };

    return statusMap[status] || { label: status, variant: "default" };
  }

  /**
   * Get payment status badge info
   */
  getPaymentStatusInfo(status: string): {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "success";
  } {
    type StatusInfo = {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline" | "success";
    };
    const statusMap: Record<string, StatusInfo> = {
      PENDING: { label: "Pending", variant: "secondary" },
      PAID: { label: "Paid", variant: "success" },
      FAILED: { label: "Failed", variant: "destructive" },
      REFUNDED: { label: "Refunded", variant: "outline" },
    };

    return statusMap[status] || { label: status, variant: "default" };
  }

  /**
   * Get shipping status badge info
   */
  getShippingStatusInfo(status: string): {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "success";
  } {
    type StatusInfo = {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline" | "success";
    };
    const statusMap: Record<string, StatusInfo> = {
      NOT_REQUIRED: { label: "Not Required", variant: "outline" },
      PENDING: { label: "Pending", variant: "secondary" },
      SHIPPED: { label: "Shipped", variant: "default" },
      DELIVERED: { label: "Delivered", variant: "success" },
      RETURNED: { label: "Returned", variant: "destructive" },
      CANCELLED: { label: "Cancelled", variant: "destructive" },
    };

    return statusMap[status] || { label: status, variant: "default" };
  }
}

export const orderService = new OrderService();
