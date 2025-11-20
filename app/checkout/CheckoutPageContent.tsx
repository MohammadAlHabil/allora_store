"use client";

import { ChevronLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/features/cart/hooks";
import { AddressStep, ShippingMethodStep } from "@/features/checkout/components";
import { useCheckoutFlow, useCreateOrder } from "@/features/checkout/hooks";
import type { AddressResponse } from "@/features/checkout/types/address.types";
import { Button } from "@/shared/components/ui/button";

/**
 * Checkout page content (client component)
 * Manages checkout flow with multiple steps
 */
export function CheckoutPageContent() {
  const router = useRouter();
  const { items, total } = useCart();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { currentStep, formData, nextStep, previousStep, canGoBack, isLastStep } =
    useCheckoutFlow();

  const [selectedAddress, setSelectedAddress] = useState<AddressResponse | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<string | undefined>();
  const [shippingCost, setShippingCost] = useState<number>(0);

  const handleSubmit = () => {
    if (
      isLastStep &&
      formData.shippingAddress &&
      formData.paymentMethod &&
      formData.shippingMethodId
    ) {
      // Create order
      createOrder(
        {
          shippingAddress: formData.shippingAddress,
          billingAddress: formData.useSameAddress ? undefined : formData.billingAddress,
          shippingMethodId: formData.shippingMethodId,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
        },
        {
          onSuccess: (order) => {
            // Redirect to confirmation page
            router.push(`/orders/${order.id}`);
          },
        }
      );
    } else {
      // Move to next step
      nextStep();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="text-muted-foreground mt-2">Complete your purchase in a few simple steps</p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <StepIndicator
            step={1}
            label="Address"
            isActive={currentStep === "address"}
            isCompleted={["shipping", "payment", "review"].includes(currentStep)}
          />
          <div className="flex-1 h-0.5 bg-border mx-2" />
          <StepIndicator
            step={2}
            label="Shipping"
            isActive={currentStep === "shipping"}
            isCompleted={["payment", "review"].includes(currentStep)}
          />
          <div className="flex-1 h-0.5 bg-border mx-2" />
          <StepIndicator
            step={3}
            label="Payment"
            isActive={currentStep === "payment"}
            isCompleted={currentStep === "review"}
          />
          <div className="flex-1 h-0.5 bg-border mx-2" />
          <StepIndicator step={4} label="Review" isActive={currentStep === "review"} />
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg border p-6">
            {currentStep === "address" && (
              <AddressStep
                onAddressSelected={setSelectedAddress}
                selectedAddressId={selectedAddress?.id}
              />
            )}

            {currentStep === "shipping" && selectedAddress && (
              <ShippingMethodStep
                addressId={selectedAddress.id}
                onMethodSelected={(methodId, cost) => {
                  setSelectedMethodId(methodId);
                  setShippingCost(cost);
                }}
                selectedMethodId={selectedMethodId}
              />
            )}

            {currentStep === "payment" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <p className="text-muted-foreground">
                  This is a placeholder. Payment method selection will be implemented here.
                </p>
                {/* TODO: Implement PaymentMethodSelector component */}
              </div>
            )}

            {currentStep === "review" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Review Order</h2>
                <p className="text-muted-foreground">
                  This is a placeholder. Order review will be implemented here.
                </p>
                {/* TODO: Implement OrderReview component */}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-4 mt-6">
              {canGoBack && (
                <Button variant="outline" onClick={previousStep} disabled={isPending}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}

              <Button
                className="ml-auto"
                onClick={handleSubmit}
                disabled={
                  isPending ||
                  (currentStep === "address" && !selectedAddress) ||
                  (currentStep === "shipping" && !selectedMethodId)
                }
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : isLastStep ? (
                  "Place Order"
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg border p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            {/* Cart items */}
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">
                    ${parseFloat(item.totalPrice.toString()).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{shippingCost > 0 ? `${shippingCost} EGP` : "TBD"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>${(total * 0.1).toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>${(total + shippingCost + total * 0.1).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Step indicator component
 */
function StepIndicator({
  step,
  label,
  isActive = false,
  isCompleted = false,
}: {
  step: number;
  label: string;
  isActive?: boolean;
  isCompleted?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center font-semibold
          ${isCompleted ? "bg-primary text-primary-foreground" : ""}
          ${isActive ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : ""}
          ${!isActive && !isCompleted ? "bg-muted text-muted-foreground" : ""}
        `}
      >
        {isCompleted ? "✓" : step}
      </div>
      <span className="text-xs mt-2 font-medium">{label}</span>
    </div>
  );
}
