"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { useEffect, useState } from "react";

// Initialize Stripe
const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentWrapperProps {
  amount: number; // Amount in dollars (e.g., 10.50)
  orderId?: string;
  children: React.ReactNode;
}

export function StripePaymentWrapper({ amount, orderId, children }: StripePaymentWrapperProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create Payment Intent when component mounts
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/checkout/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
            orderId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create payment intent");
        }

        setClientSecret(data.clientSecret);
      } catch (err: unknown) {
        console.error("Payment intent error:", err);
        const message = err instanceof Error ? err.message : String(err);
        setError(message || "Failed to initialize payment");
      } finally {
        setLoading(false);
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Initializing payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">⚠️ {error}</p>
        <p className="text-xs text-red-500 mt-2">
          Please check your Stripe configuration and try again.
        </p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-600 text-sm">Unable to initialize payment. Please try again.</p>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    locale: "en", // Force English language
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#0F172A",
        colorBackground: "#ffffff",
        colorText: "#1e293b",
        colorDanger: "#dc2626",
        fontFamily: "system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px",
      },
    },
    loader: "never",
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
