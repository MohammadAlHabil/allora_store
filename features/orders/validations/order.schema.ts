import { z } from "zod";
import { OrderStatus, PaymentStatus, ShippingStatus } from "@/app/generated/prisma";

export const orderFilterSchema = z.object({
  status: z.union([z.nativeEnum(OrderStatus), z.array(z.nativeEnum(OrderStatus))]).optional(),
  paymentStatus: z
    .union([z.nativeEnum(PaymentStatus), z.array(z.nativeEnum(PaymentStatus))])
    .optional(),
  shippingStatus: z
    .union([z.nativeEnum(ShippingStatus), z.array(z.nativeEnum(ShippingStatus))])
    .optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  search: z.string().optional(),
});

export const ordersListParamsSchema = orderFilterSchema.extend({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(["createdAt", "placedAt", "total"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const cancelOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  reason: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  shippingStatus: z.nativeEnum(ShippingStatus).optional(),
});

export type OrderFilterInput = z.infer<typeof orderFilterSchema>;
export type OrdersListParamsInput = z.infer<typeof ordersListParamsSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
