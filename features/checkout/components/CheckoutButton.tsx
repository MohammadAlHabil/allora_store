import { Loader2, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CheckoutAlertModal } from "@/features/checkout/components/CheckoutAlertModal";
import { useCheckoutValidation } from "@/features/checkout/hooks/useCheckoutValidation";
import { Button } from "@/shared/components/ui/button";

/**
 * Checkout button component
 * - Shows "Proceed to Checkout" button
 * - Redirects to sign-in if not authenticated
 * - Redirects to checkout page if authenticated
 * - Validates cart is not empty
 * - Validates stock availability before proceeding
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
  const { validateCheckout, isValidating, issues, generalErrors, showModal, setShowModal } =
    useCheckoutValidation();

  const handleCheckout = async () => {
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

    // Validate checkout (stock, etc.)
    const isValid = await validateCheckout();
    if (isValid) {
      // Proceed to checkout
      router.push("/checkout");
    }
  };

  return (
    <>
      <Button
        onClick={handleCheckout}
        disabled={disabled || isLoading || isValidating || cartItemCount === 0}
        className="w-full"
        size="lg"
      >
        {isValidating ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <ShoppingCart className="mr-2 h-5 w-5" />
        )}
        {isValidating ? "Validating..." : "Proceed to Checkout"}
      </Button>

      <CheckoutAlertModal
        open={showModal}
        onOpenChange={setShowModal}
        issues={issues}
        generalErrors={generalErrors}
      />
    </>
  );
}
