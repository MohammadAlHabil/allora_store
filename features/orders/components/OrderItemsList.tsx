"use client";

import { Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { formatPrice } from "@/shared/lib/utils/formatters";
import type { OrderWithDetails } from "../types";

type OrderItemsListProps = {
  order: OrderWithDetails;
};

export function OrderItemsList({ order }: OrderItemsListProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Package className="h-5 w-5" />
        Order Items
      </h2>

      <div className="space-y-4">
        {order.items.map((item, index) => (
          <div key={item.id}>
            {index > 0 && <Separator className="my-4" />}
            <div className="flex gap-4">
              {/* Product Image */}
              <Link
                href={`/products/${item.product.slug}`}
                className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-muted"
              >
                {item.product.images[0] ? (
                  <Image
                    src={item.product.images[0].url}
                    alt={item.product.images[0].alt || item.product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </Link>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="font-medium hover:underline line-clamp-2"
                >
                  {item.title}
                </Link>

                {item.variant && item.variant.optionValues && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    {Object.entries(item.variant.optionValues as Record<string, string>).map(
                      ([key, value]) => (
                        <span key={key} className="mr-3">
                          {key}: <span className="font-medium">{value}</span>
                        </span>
                      )
                    )}
                  </div>
                )}

                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Qty: <span className="font-medium text-foreground">{item.quantity}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Price:{" "}
                    <span className="font-medium text-foreground">
                      {formatPrice(Number(item.unitPrice), order.currency)}
                    </span>
                  </span>
                </div>
              </div>

              {/* Item Total */}
              <div className="text-right shrink-0">
                <p className="font-semibold">
                  {formatPrice(Number(item.totalPrice), order.currency)}
                </p>
                {Number(item.discountAmount) > 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    -{formatPrice(Number(item.discountAmount), order.currency)} off
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-6" />

      {/* Order Summary */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatPrice(Number(order.subtotal), order.currency)}</span>
        </div>

        {Number(order.shippingCost) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium">
              {formatPrice(Number(order.shippingCost), order.currency)}
            </span>
          </div>
        )}

        {Number(order.taxAmount) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span className="font-medium">
              {formatPrice(Number(order.taxAmount), order.currency)}
            </span>
          </div>
        )}

        {Number(order.discountAmount) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600 dark:text-green-400">Discount</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              -{formatPrice(Number(order.discountAmount), order.currency)}
            </span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatPrice(Number(order.total), order.currency)}</span>
        </div>
      </div>
    </Card>
  );
}
