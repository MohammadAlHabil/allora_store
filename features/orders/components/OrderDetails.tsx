"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, CreditCard, Package, Truck, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cartQueryKeys } from "@/features/cart/hooks/cart.query-keys";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { formatPrice } from "@/shared/lib/utils/formatters";
import { useCancelOrder, useOrder } from "../hooks";
import { AddressCard } from "./AddressCard";
import { OrderDetailsSkeleton } from "./OrderDetailsSkeleton";
import { OrderItemsList } from "./OrderItemsList";
import { StatusBadge } from "./StatusBadge";

type OrderDetailsProps = {
  orderId: string;
};

export function OrderDetails({ orderId }: OrderDetailsProps) {
  const router = useRouter();
  const { data: order, isLoading } = useOrder(orderId);
  const cancelOrder = useCancelOrder();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelOrder.mutateAsync({ orderId });
      router.refresh();
    } finally {
      setIsCancelling(false);
    }
  };

  // Invalidate cart on mount to ensure it's empty after a successful order
  // This is the safest place to do it, as we are sure the user has left the checkout page
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() });
  }, [queryClient]);

  if (isLoading) {
    return <OrderDetailsSkeleton />;
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Order not found</h3>
        <p className="text-muted-foreground mb-6">
          The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Button onClick={() => router.push("/orders")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  // Determine if order can be cancelled
  // Business Rules:
  // - DRAFT: Can cancel (order not finalized)
  // - PENDING_PAYMENT (COD): Can cancel (payment not received yet)
  // - PAID (Credit Card): CANNOT cancel (payment already processed)
  // - CANCELLED/EXPIRED/FULFILLED: Cannot cancel (already in final state)
  const canCancel = order.status === "PENDING_PAYMENT" || order.status === "DRAFT";

  const orderDate = order.placedAt || order.createdAt;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/orders")} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-muted-foreground mt-1">
            Placed on{" "}
            {new Date(orderDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} type="order" />
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isCancelling}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Order
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this order? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, keep order</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel}>Yes, cancel order</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Order Paid Notice - Cannot Cancel */}
      {order.status === "PAID" && order.paymentStatus === "PAID" && (
        <Card className="border-border bg-secondary/3 shadow-none">
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">Payment Confirmed</h3>
                <p className="text-sm text-muted-foreground">
                  Your payment has been successfully processed. This order cannot be cancelled
                  online. If you need to return items, please contact our support team after
                  receiving your order.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={order.status} type="order" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={order.paymentStatus} type="payment" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Shipping Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={order.shippingStatus} type="shipping" />
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <OrderItemsList order={order} />

      {/* Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {order.shippingAddress && (
          <AddressCard
            address={order.shippingAddress}
            title="Shipping Address"
            icon={<Truck className="h-5 w-5" />}
          />
        )}
        {order.billingAddress && (
          <AddressCard
            address={order.billingAddress}
            title="Billing Address"
            icon={<CreditCard className="h-5 w-5" />}
          />
        )}
      </div>

      {/* Shipping Method */}
      {order.shippingMethod && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{order.shippingMethod.name}</p>
                {order.shippingMethod.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.shippingMethod.description}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  Estimated delivery: {order.shippingMethod.estimatedDaysMin}-
                  {order.shippingMethod.estimatedDaysMax} business days
                </p>
              </div>
              <p className="font-semibold">
                {formatPrice(Number(order.shippingMethod.basePrice), order.shippingMethod.currency)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
