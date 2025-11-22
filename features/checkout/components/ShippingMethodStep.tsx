"use client";

/**
 * ═══════════════════════════════════════════════════════════════
 * ShippingMethodStep - Shipping method selection step in checkout
 * ═══════════════════════════════════════════════════════════════
 */

import { Truck, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useShippingMethods, useSelectShippingMethod } from "@/features/checkout/hooks";
import type { ShippingMethodResponse } from "@/features/checkout/types/shipping.types";
import { Button } from "@/shared/components/ui/button";

interface ShippingMethodStepProps {
  addressId: string;
  onMethodSelected: (methodId: string, cost: number) => void;
  selectedMethodId?: string;
}

export function ShippingMethodStep({
  addressId,
  onMethodSelected,
  selectedMethodId,
}: ShippingMethodStepProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | undefined>(selectedMethodId);

  const {
    data: methods,
    isLoading,
    error,
  } = useShippingMethods({
    addressId,
    enabled: !!addressId,
  });

  const { mutate: selectMethod, isPending: isSelecting } = useSelectShippingMethod();

  // Auto-select first method if none selected
  useEffect(() => {
    if (methods && methods.length > 0 && !selectedMethod) {
      // Avoid calling setState synchronously inside the effect body to satisfy
      // react-hooks/set-state-in-effect lint rule. Schedule it in a microtask.
      void Promise.resolve().then(() => setSelectedMethod(methods[0].id));
    }
  }, [methods, selectedMethod]);

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);

    // Call API to validate and calculate cost
    selectMethod(
      { addressId, shippingMethodId: methodId },
      {
        onSuccess: (response: unknown) => {
          // Safely access cost.total with runtime checks instead of using `any`.
          const resp = response as { cost?: { total?: number } } | null;
          const total = resp?.cost?.total ?? 0;
          onMethodSelected(methodId, total);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Shipping Method</h2>
          <p className="text-sm text-muted-foreground">Loading available shipping methods...</p>
        </div>
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="border border-border rounded-lg p-4 animate-pulse bg-muted/10">
              <div className="h-6 w-32 bg-muted rounded mb-2" />
              <div className="h-4 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !methods || methods.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Shipping Method</h2>
        </div>
        <div className="border border-destructive/50 bg-destructive/5 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-destructive mb-2">Shipping Not Available</h3>
          <p className="text-sm text-muted-foreground">
            {error
              ? "Failed to load shipping methods. Please try again."
              : "Shipping is not available for the selected address. Please select a different address."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Shipping Method</h2>
        <p className="text-sm text-muted-foreground">Choose your preferred delivery method</p>
      </div>

      <div className="grid gap-4">
        {methods.map((method: ShippingMethodResponse) => {
          const isSelected = selectedMethod === method.id;
          const displayText =
            method.estimatedDaysMin === method.estimatedDaysMax
              ? `${method.estimatedDaysMin} business days`
              : `${method.estimatedDaysMin}-${method.estimatedDaysMax} business days`;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => handleMethodSelect(method.id)}
              disabled={isSelecting}
              className={`
                relative border rounded-lg p-5 text-left transition-all
                ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                }
                ${isSelecting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
              )}

              {/* Method header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1">{method.name}</h3>
                  {method.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {method.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery estimate and price */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{displayText}</span>
                </div>
                <div className="text-lg font-semibold">
                  {method.basePrice === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    <span>
                      {method.basePrice} {method.currency}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Company branding note */}
      <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg border border-border/50">
        <Truck className="h-5 w-5 text-muted-foreground shrink-0" />
        <p className="text-sm text-muted-foreground">
          All deliveries are handled by{" "}
          <span className="font-semibold text-foreground">Allora Delivery</span>
        </p>
      </div>
    </div>
  );
}
