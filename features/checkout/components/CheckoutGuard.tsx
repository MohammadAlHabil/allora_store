"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { useCart } from "@/features/cart/hooks";

import { useCheckoutValidation } from "@/features/checkout/hooks";
import CheckoutSkeleton from "./CheckoutSkeleton";

/**
 * CheckoutGuard
 * - Ensures the user is authenticated
 * - Validates checkout access (cart not empty, etc.)
 * - Redirects to sign-in or cart page when invalid
 */
export function CheckoutGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isLoading: isCartLoading } = useCart();

  // Initialize checkout validation hook
  useCheckoutValidation();

  // Check authentication
  useEffect(() => {
    if (status !== "loading" && !session?.user) {
      toast.info("Please sign in to continue to checkout");
      router.push("/signin?callbackUrl=/checkout");
    }
  }, [status, session, router]);

  // If session is loading, show a loading state
  if (status === "loading") {
    return <CheckoutSkeleton />;
  }

  // If cart is loading, show loading state
  if (isCartLoading) {
    return <CheckoutSkeleton />;
  }

  // If not authenticated, don't render children (effect will navigate)
  if (!session?.user) return null;

  // All good — render children
  return <>{children}</>;
}

export default CheckoutGuard;
