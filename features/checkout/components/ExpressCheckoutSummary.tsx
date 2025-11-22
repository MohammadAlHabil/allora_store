"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useExpressCheckout } from "@/features/checkout/hooks/useExpressCheckout";

/**
 * Express Checkout Summary
 * Displays single product for express purchase
 */
export function ExpressCheckoutSummary() {
  const { expressItem, clearExpressItem } = useExpressCheckout();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const mode = searchParams.get("mode");

  useEffect(() => {
    // If not in express mode or no express item, redirect
    if (mode !== "express" || !expressItem) {
      router.push("/cart");
    }
  }, [mode, expressItem, router]);

  // Show loading if checking
  if (!expressItem) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const subtotal = expressItem.unitPrice * expressItem.quantity;
  const tax = subtotal * 0.1; // 10% tax
  const shippingCost = 0; // Will be calculated in shipping step

  return (
    <div className="bg-card rounded-lg border p-6 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Express Checkout</h2>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Quick Buy</span>
      </div>

      {/* Product Item */}
      <div className="mb-4 pb-4 border-b">
        <div className="flex gap-3">
          {expressItem.image && (
            <div className="relative w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={expressItem.image}
                alt={expressItem.productName}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{expressItem.productName}</p>
            {expressItem.sku && (
              <p className="text-xs text-muted-foreground">SKU: {expressItem.sku}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Qty: {expressItem.quantity} × ${expressItem.unitPrice.toFixed(2)}
            </p>
          </div>
          <p className="font-medium whitespace-nowrap">${subtotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>TBD</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax (10%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-semibold">
          <span>Total</span>
          <span>${(subtotal + tax + shippingCost).toFixed(2)}</span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          💡 Your cart items are safe and will not be affected by this purchase
        </p>
      </div>
    </div>
  );
}
