"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { useCheckoutValidation } from "@/features/checkout/hooks";

/**
 * CheckoutGuard
 * - Ensures the user is authenticated
 * - Validates checkout access (cart not empty, etc.)
 * - Redirects to sign-in or cart page when invalid
 */
export function CheckoutGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const { data: validation, isLoading: isValidating, isError } = useCheckoutValidation();
  // Call effects unconditionally (Rules of Hooks) but run logic conditionally inside
  useEffect(() => {
    if (status !== "loading" && !session?.user) {
      toast.info("Please sign in to continue to checkout");
      router.push("/signin?callbackUrl=/checkout");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (!isValidating && (isError || (validation && !validation.canProceed))) {
      const reason = validation?.reason || "Your cart is not ready for checkout";
      toast.error(reason);
      router.push("/cart");
    }
  }, [isValidating, isError, validation, router]);

  // If session is loading or validation is loading, show a loading state
  if (status === "loading" || isValidating) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // If not authenticated, don't render children (effect will navigate)
  if (!session?.user) return null;

  // If validation failed or indicates cannot proceed, don't render children (effect will navigate)
  if (isError || (validation && !validation.canProceed)) return null;

  // All good — render children
  return <>{children}</>;
}

export default CheckoutGuard;
