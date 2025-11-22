import { type Prisma, OrderStatus, PaymentStatus, ShippingStatus } from "@/app/generated/prisma";
import prisma from "@/shared/lib/prisma";
import type { OrderWithDetails, OrderSummary, OrderFilterParams, OrdersListParams } from "../types";

export class OrderRepository {
  /**
   * Get order by ID with all relations
   */
  async findById(orderId: string): Promise<OrderWithDetails | null> {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  select: { url: true, alt: true },
                  orderBy: { sortOrder: "asc" },
                  take: 1,
                },
              },
            },
            variant: {
              select: {
                id: true,
                title: true,
                optionValues: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        shippingMethod: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }) as Promise<OrderWithDetails | null>;
  }

  /**
   * Get user orders with pagination and filters
   */
  async findUserOrders(
    userId: string,
    params: OrdersListParams
  ): Promise<{ orders: OrderSummary[]; total: number }> {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", ...filters } = params;

    const where = this.buildWhereClause({ ...filters, userId });
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          shippingStatus: true,
          total: true,
          currency: true,
          createdAt: true,
          placedAt: true,
          items: {
            select: { id: true },
          },
          shippingAddress: {
            select: { city: true, country: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((order) => ({
        id: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        shippingStatus: order.shippingStatus,
        total: order.total,
        currency: order.currency,
        createdAt: order.createdAt,
        placedAt: order.placedAt,
        itemsCount: order.items.length,
        shippingAddress: order.shippingAddress,
      })) as OrderSummary[],
      total,
    };
  }

  /**
   * Get order statistics for a user
   */
  async getUserOrderStats(userId: string) {
    const [total, pending, paid, fulfilled, cancelled] = await Promise.all([
      prisma.order.count({ where: { userId } }),
      prisma.order.count({
        where: { userId, status: "PENDING_PAYMENT" },
      }),
      prisma.order.count({
        where: { userId, paymentStatus: "PAID" },
      }),
      prisma.order.count({
        where: { userId, status: "FULFILLED" },
      }),
      prisma.order.count({
        where: { userId, status: "CANCELLED" },
      }),
    ]);

    return { total, pending, paid, fulfilled, cancelled };
  }

  /**
   * Update order status
   */
  async updateStatus(
    orderId: string,
    data: {
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
      shippingStatus?: ShippingStatus;
    }
  ) {
    const updateData: Prisma.OrderUpdateInput = {};

    if (data.status) {
      updateData.status = data.status;
      if (data.status === "CANCELLED") {
        updateData.cancelledAt = new Date();
      } else if (data.status === "FULFILLED") {
        updateData.fulfilledAt = new Date();
      }
    }

    if (data.paymentStatus) {
      updateData.paymentStatus = data.paymentStatus;
      if (data.paymentStatus === "PAID") {
        updateData.paidAt = new Date();
      }
    }

    if (data.shippingStatus) {
      updateData.shippingStatus = data.shippingStatus;
    }

    return prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });
  }

  /**
   * Cancel order
   */
  async cancel(orderId: string, reason?: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        metadata: reason
          ? {
              cancellationReason: reason,
            }
          : undefined,
      },
    });
  }

  /**
   * Build where clause for filtering
   */
  private buildWhereClause(
    filters: OrderFilterParams & { userId?: string }
  ): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.status) {
      where.status = Array.isArray(filters.status) ? { in: filters.status } : filters.status;
    }

    if (filters.paymentStatus) {
      where.paymentStatus = Array.isArray(filters.paymentStatus)
        ? { in: filters.paymentStatus }
        : filters.paymentStatus;
    }

    if (filters.shippingStatus) {
      where.shippingStatus = Array.isArray(filters.shippingStatus)
        ? { in: filters.shippingStatus }
        : filters.shippingStatus;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      where.total = {};
      if (filters.minAmount !== undefined) {
        where.total.gte = filters.minAmount;
      }
      if (filters.maxAmount !== undefined) {
        where.total.lte = filters.maxAmount;
      }
    }

    if (filters.search) {
      where.id = {
        contains: filters.search,
        mode: "insensitive",
      };
    }

    return where;
  }
}

export const orderRepository = new OrderRepository();
