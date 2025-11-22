import { CheckoutGuard } from "@/features/checkout/components";
import { CheckoutPageContent } from "./CheckoutPageContent";

export const metadata = {
  title: "Checkout | Allora Store",
  description: "Complete your purchase",
};

/**
 * Checkout page
 * Protected by CheckoutGuard (requires authentication and non-empty cart)
 */
export default function CheckoutPage() {
  return (
    <CheckoutGuard>
      <CheckoutPageContent />
    </CheckoutGuard>
  );
}
