import type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
  Address,
  ShippingMethod,
} from "@/app/generated/prisma";

// Extended types with relations
export type OrderWithDetails = Order & {
  items: (OrderItem & {
    product: {
      id: string;
      name: string;
      slug: string;
      images: Array<{ url: string; alt: string | null }>;
    };
    variant: {
      id: string;
      title: string | null;
      optionValues: Record<string, unknown> | null;
    } | null;
  })[];
  shippingAddress: Address | null;
  billingAddress: Address | null;
  shippingMethod: ShippingMethod | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

export type OrderSummary = Pick<
  Order,
  | "id"
  | "status"
  | "paymentStatus"
  | "shippingStatus"
  | "total"
  | "currency"
  | "createdAt"
  | "placedAt"
> & {
  itemsCount: number;
  shippingAddress: Pick<Address, "city" | "country"> | null;
};

// Filter types
export type OrderFilterParams = {
  status?: OrderStatus | OrderStatus[];
  paymentStatus?: PaymentStatus | PaymentStatus[];
  shippingStatus?: ShippingStatus | ShippingStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
};

// Pagination
export type OrdersListParams = {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "placedAt" | "total";
  sortOrder?: "asc" | "desc";
} & OrderFilterParams;

export type OrdersListResult = {
  orders: OrderSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: {
    total: number;
    pending: number;
    paid: number;
    fulfilled: number;
    cancelled: number;
  };
};

// Order actions
export type CancelOrderInput = {
  orderId: string;
  reason?: string;
};

export type UpdateOrderStatusInput = {
  orderId: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shippingStatus?: ShippingStatus;
};

// Export Prisma enums
export { OrderStatus, PaymentStatus, ShippingStatus };
