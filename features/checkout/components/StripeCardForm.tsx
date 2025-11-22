"use client";

import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import Skeleton from "@/shared/components/ui/skeleton";

interface StripeCardFormProps {
  onSuccess: (paymentIntentId?: string) => void;
  onError?: (error: string) => void;
  billingCountry?: string | null;
  isProcessingOrder?: boolean;
}

export function StripeCardForm({
  onSuccess,
  onError,
  billingCountry,
  isProcessingOrder = false,
}: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🔵 StripeCardForm: handleSubmit started");

    if (!stripe || !elements) {
      console.log("❌ Stripe or Elements not loaded");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Submit the form (validates PaymentElement fields)
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "An error occurred");
        onError?.(submitError.message || "An error occurred");
        setIsProcessing(false);
        return;
      }

      // Build confirm args. When the PaymentElement is configured to hide the
      // billing country (fields.billingDetails.address.country = 'never'),
      // Stripe requires that we pass the country in confirmPayment.
      // Use a loose object for confirm args (Stripe types differ across SDKs)
      const confirmArgs: Record<string, unknown> = {
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: "if_required",
      };

      // If the checkout form provides a billing country, pass it through to
      // confirmPayment so it can supplement or override the Element data.
      if (billingCountry) {
        confirmArgs.payment_method_data = {
          billing_details: {
            address: {
              country: billingCountry,
            },
          },
        };
      }

      // Stripe's typed client can be incompatible across versions.
      // Create a narrow runtime wrapper to avoid using `any` in assertions.
      const stripeClient = stripe as unknown as {
        confirmPayment: (args: unknown) => Promise<unknown>;
      };

      const result = await stripeClient.confirmPayment(confirmArgs as unknown);

      console.log("🔵 Payment result:", result);

      if (result && typeof result === "object") {
        const resObj = result as Record<string, unknown>;

        const errObj = resObj["error"] as Record<string, unknown> | undefined;
        if (errObj && typeof errObj === "object") {
          const msg = (errObj["message"] as string) || "Payment failed";
          console.log("❌ Payment error:", msg);
          setError(msg);
          onError?.(msg);
          return;
        }

        const piObj = resObj["paymentIntent"] as Record<string, unknown> | undefined;
        if (piObj && typeof piObj === "object") {
          const status = piObj["status"] as string | undefined;
          const id = piObj["id"] as string | undefined;
          if (status === "succeeded" && id) {
            console.log("✅ Payment succeeded! PaymentIntent ID:", id);
            setPaymentComplete(true);
            onSuccess(id);
            return;
          }
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || "An unexpected error occurred");
      onError?.(errorMessage || "An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentComplete || isProcessingOrder) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-green-600">Payment Successful!</h3>
          <p className="text-sm text-gray-600 mt-1">
            {isProcessingOrder ? "Creating your order..." : "Processing your order..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Stripe Payment Element */}
      <div className="relative border border-gray-200 rounded-lg p-4 bg-white min-h-[180px]">
        {/* Show custom skeleton overlay until PaymentElement reports ready */}
        {!isReady ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="w-full px-4 !py-4 space-y-4">
              <div className="flex items-start gap-4">
                {/* Card number (large) */}
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-2">Card number</div>
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Expiration date (small) */}
                <div className="w-40">
                  <div className="text-sm text-muted-foreground mb-2">Expiration date</div>
                  <Skeleton className="h-10 w-40" />
                </div>

                {/* Security code (small) */}
                <div className="w-32">
                  <div className="text-sm text-muted-foreground mb-2">Security code</div>
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-2">Country</div>
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        ) : null}

        <div className={isReady ? "" : "opacity-0"}>
          <PaymentElement
            onReady={() => setIsReady(true)}
            options={{
              layout: "tabs",
              paymentMethodOrder: ["card"],
              // show the country field again
              fields: {
                billingDetails: {
                  address: {
                    country: "auto",
                  },
                },
              },
              terms: {
                card: "never",
              },
            }}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || isProcessing || isProcessingOrder}
        className="w-full h-12 text-base font-semibold"
        size="lg"
      >
        {isProcessingOrder ? (
          <span className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Creating Order...
          </span>
        ) : isProcessing ? (
          <span className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Processing Payment...
          </span>
        ) : (
          "Place Order"
        )}
      </Button>
    </form>
  );
}
