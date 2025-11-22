"use client";

import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";

/**
 * Checkout button component
 * - Shows "Proceed to Checkout" button
 * - Redirects to sign-in if not authenticated
 * - Redirects to checkout page if authenticated
 * - Validates cart is not empty
 */
export function CheckoutButton({
  disabled = false,
  cartItemCount = 0,
}: {
  disabled?: boolean;
  cartItemCount?: number;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const handleCheckout = () => {
    // Check if cart is empty
    if (cartItemCount === 0) {
      toast.error("Your cart is empty", {
        description: "Please add items before checkout",
      });
      return;
    }

    // Check if user is authenticated
    if (!session?.user) {
      toast.info("Sign in required", {
        description: "Please sign in to proceed with checkout",
      });
      // Redirect to sign-in with callback to checkout
      router.push("/signin?callbackUrl=/checkout");
      return;
    }

    // Proceed to checkout
    router.push("/checkout");
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || isLoading || cartItemCount === 0}
      className="w-full"
      size="lg"
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      Proceed to Checkout
    </Button>
  );
}
