"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { useCart } from "@/features/cart/hooks";
import {
  checkoutKeys,
  useCheckoutValidation,
  validateCheckoutAPI,
} from "@/features/checkout/hooks";
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
  const { items, isLoading: isCartLoading } = useCart();

  const {
    data: validation,
    isLoading: isValidating,
    isError,
  } = useQuery({
    queryKey: checkoutKeys.validation(),
    queryFn: validateCheckoutAPI,
    retry: false,
    enabled: status === "authenticated", // Only validate if authenticated
  });

  // Initialize checkout validation hook
  useCheckoutValidation();

  // Check authentication
  useEffect(() => {
    if (status !== "loading" && !session?.user) {
      toast.info("Please sign in to continue to checkout");
      router.push("/signin?callbackUrl=/checkout");
    }
  }, [status, session, router]);

  // Check if cart is empty
  useEffect(() => {
    if (status === "authenticated" && !isCartLoading && items.length === 0) {
      toast.error("Your cart is empty. Add items before checkout.");
      router.push("/cart");
    }
  }, [status, isCartLoading, items, router]);

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

  // If cart is empty, don't render children (effect will navigate)
  if (items.length === 0) return null;

  // All good — render children
  return <>{children}</>;
}

export default CheckoutGuard;
