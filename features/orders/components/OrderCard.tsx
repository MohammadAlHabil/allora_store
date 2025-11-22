"use client";

import { Calendar, CreditCard, MapPin, Package, Truck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { formatPrice } from "@/shared/lib/utils/formatters";
import type { OrderSummary } from "../types";
import { StatusBadge } from "./StatusBadge";

type OrderCardProps = {
  order: OrderSummary;
};

export function OrderCard({ order }: OrderCardProps) {
  const orderDate = order.placedAt || order.createdAt;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            <CardTitle className="text-base font-semibold">
              Order #{order.id.slice(-8).toUpperCase()}
            </CardTitle>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {new Date(orderDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <p className="text-base font-bold whitespace-nowrap text-right">
              {formatPrice(Number(order.total), order.currency)}
            </p>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex flex-1 flex-col pb-0">
        {/* Status Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Package className="h-3.5 w-3.5" />
              <p className="text-xs">Status</p>
            </div>
            <StatusBadge status={order.status} type="order" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5" />
              <p className="text-xs">Payment</p>
            </div>
            <StatusBadge status={order.paymentStatus} type="payment" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Truck className="h-3.5 w-3.5" />
              <p className="text-xs">Shipping</p>
            </div>
            <StatusBadge status={order.shippingStatus} type="shipping" />
          </div>
        </div>

        {/* Items Count and Shipping Address */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">
              {order.itemsCount} {order.itemsCount === 1 ? "item" : "items"}
            </span>
          </div>

          {order.shippingAddress && (
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground truncate">
                {order.shippingAddress.city}, {order.shippingAddress.country}
              </span>
            </div>
          )}
        </div>

        {/* Action Button - Always at bottom */}
        <div className="mt-auto">
          <Button asChild className="w-full" size="sm">
            <Link href={`/orders/${order.id}`}>View Order Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
