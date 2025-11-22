import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils/tailwind.utils";
import type { OrderStatus, PaymentStatus, ShippingStatus } from "../types";

type StatusBadgeProps = {
  status: OrderStatus | PaymentStatus | ShippingStatus;
  type: "order" | "payment" | "shipping";
};

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const getStatusInfo = () => {
    if (type === "order") {
      const statusMap: Record<
        string,
        {
          label: string;
          variant: "default" | "secondary" | "destructive" | "outline";
          className?: string;
        }
      > = {
        DRAFT: { label: "Draft", variant: "outline" },
        PENDING_PAYMENT: { label: "Pending", variant: "secondary" },
        PAID: {
          label: "Paid",
          variant: "default",
          className: "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600",
        },
        CANCELLED: { label: "Cancelled", variant: "destructive" },
        EXPIRED: { label: "Expired", variant: "destructive" },
        FULFILLED: {
          label: "Fulfilled",
          variant: "default",
          className: "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600",
        },
        PARTIALLY_FULFILLED: { label: "Partial", variant: "default" },
        REFUNDED: { label: "Refunded", variant: "secondary" },
      };
      return statusMap[status as string] || { label: status, variant: "default" as const };
    }

    if (type === "payment") {
      const statusMap: Record<
        string,
        {
          label: string;
          variant: "default" | "secondary" | "destructive" | "outline";
          className?: string;
        }
      > = {
        PENDING: { label: "Pending", variant: "secondary" },
        PAID: {
          label: "Paid",
          variant: "default",
          className: "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600",
        },
        FAILED: { label: "Failed", variant: "destructive" },
        REFUNDED: { label: "Refunded", variant: "outline" },
      };
      return statusMap[status as string] || { label: status, variant: "default" as const };
    }

    // shipping
    const statusMap: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
        className?: string;
      }
    > = {
      NOT_REQUIRED: { label: "Not Required", variant: "outline" },
      PENDING: { label: "Pending", variant: "secondary" },
      SHIPPED: { label: "Shipped", variant: "default" },
      DELIVERED: {
        label: "Delivered",
        variant: "default",
        className: "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600",
      },
      RETURNED: { label: "Returned", variant: "destructive" },
      CANCELLED: { label: "Cancelled", variant: "destructive" },
    };
    return statusMap[status as string] || { label: status, variant: "default" as const };
  };

  const { label, variant, className } = getStatusInfo();

  return (
    <Badge variant={variant} className={cn("font-medium text-xs", className)}>
      {label}
    </Badge>
  );
}
