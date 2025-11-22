"use client";

import { CreditCard as CreditCardIcon, DollarSign } from "lucide-react";
import { useState } from "react";
import type { PaymentMethod } from "@/features/checkout/types/checkout.types";
import { StripeCardForm } from "./StripeCardForm";
import { StripePaymentWrapper } from "./StripePaymentWrapper";

export function PaymentMethodStep({
  selected,
  onSelect,
  orderAmount = 0,
  billingCountry,
  onPlaceOrder,
  isProcessingOrder = false,
}: {
  selected?: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  orderAmount?: number;
  billingCountry?: string | null;
  onPlaceOrder?: (paymentIntentId?: string) => void;
  isProcessingOrder?: boolean;
}) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | undefined>(selected);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    onSelect(method);
  };

  const handlePaymentSuccess = (paymentIntentId?: string) => {
    setPaymentSuccess(true);
    console.log(
      "✅ Payment successful!",
      paymentIntentId ? `PaymentIntent: ${paymentIntentId}` : ""
    );
    // Trigger order creation
    onPlaceOrder?.(paymentIntentId);
  };

  const handlePaymentError = (error: string) => {
    console.error("❌ Payment error:", error);
  };

  const handleCODPlaceOrder = () => {
    // For Cash on Delivery, skip payment and create order immediately
    console.log("✅ Cash on Delivery selected");
    onPlaceOrder?.(); // No paymentIntentId for COD
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="grid gap-3">
        {/* Credit/Debit Card Option */}
        <button
          type="button"
          onClick={() => handleMethodSelect("CREDIT_CARD")}
          className={`text-left p-4 rounded-lg border-2 transition-all ${
            selectedMethod === "CREDIT_CARD"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-md ${
                selectedMethod === "CREDIT_CARD" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              <CreditCardIcon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Credit or Debit Card</p>
              <p className="text-sm text-muted-foreground">Secure payment via Stripe</p>
            </div>
            {selectedMethod === "CREDIT_CARD" && (
              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-primary-foreground" />
              </div>
            )}
          </div>
        </button>

        {/* Cash on Delivery Option */}
        <button
          type="button"
          onClick={() => handleMethodSelect("CASH_ON_DELIVERY")}
          className={`text-left p-4 rounded-lg border-2 transition-all ${
            selectedMethod === "CASH_ON_DELIVERY"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-md ${
                selectedMethod === "CASH_ON_DELIVERY"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Cash on Delivery</p>
              <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
            </div>
            {selectedMethod === "CASH_ON_DELIVERY" && (
              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-primary-foreground" />
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Card Payment Form - Only show when card is selected */}
      {selectedMethod === "CREDIT_CARD" && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          <StripePaymentWrapper amount={orderAmount}>
            <StripeCardForm
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              billingCountry={billingCountry ?? null}
              isProcessingOrder={isProcessingOrder}
            />
          </StripePaymentWrapper>
        </div>
      )}

      {/* Cash on Delivery Info & Place Order Button */}
      {selectedMethod === "CASH_ON_DELIVERY" && (
        <div className="space-y-4 animate-in fade-in-50 duration-300">
          <div className="bg-muted/50 rounded-lg p-4 border">
            <p className="text-sm text-muted-foreground">
              Pay with cash when your order is delivered to your doorstep. Please have the exact
              amount ready.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCODPlaceOrder}
            disabled={isProcessingOrder}
            className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isProcessingOrder ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating Order...
              </span>
            ) : (
              "Place Order"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default PaymentMethodStep;
