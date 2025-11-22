"use client";

import { ShoppingCart, Loader2 } from "lucide-react";
import { CheckoutAlertModal } from "@/features/checkout/components/CheckoutAlertModal";
import { useCheckoutValidation } from "@/features/checkout/hooks/useCheckoutValidation";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import { formatPrice } from "@/shared/lib/utils/formatters";
import { useCart } from "../hooks";
import { calculateCartSubtotal, calculateCartTotal } from "../utils/formatters";

export interface CartSummaryProps {
  className?: string;
  showCheckoutButton?: boolean;
  checkoutButtonLabel?: string;
  onCheckout?: () => void;
  showItemCount?: boolean;
  showSubtotal?: boolean;
  showShipping?: boolean;
  shippingCost?: number;
  showTax?: boolean;
  taxAmount?: number;
  showDiscount?: boolean;
  discountAmount?: number;
  couponCode?: string;
}

/**
 * Cart Summary Component
 * Displays cart totals and summary information
 *
 * @example
 * ```tsx
 * <CartSummary
 *   showCheckoutButton
 *   onCheckout={() => router.push('/checkout')}
 *   showShipping
 *   shippingCost={10}
 * />
 * ```
 */

export function CartSummary({
  className,
  showCheckoutButton = true,
  checkoutButtonLabel = "Proceed to Checkout",
  onCheckout,
  showItemCount = true,
  showSubtotal = true,
  showShipping = false,
  shippingCost = 0,
  showTax = false,
  taxAmount = 0,
  showDiscount = false,
  discountAmount = 0,
  couponCode,
}: CartSummaryProps) {
  const { items, itemCount, isEmpty, isLoading } = useCart();
  const {
    validateCheckout,
    isValidating,
    isProcessing,
    issues,
    generalErrors,
    showModal,
    setShowModal,
    handleRemoveItem,
    handleUpdateQuantity,
    handleUpdatePrice,
  } = useCheckoutValidation();

  // Calculate totals using utils
  const subtotal = calculateCartSubtotal(items);
  const shipping = showShipping ? shippingCost : 0;
  const tax = showTax ? taxAmount : 0;
  const discount = showDiscount ? discountAmount : 0;
  const total = calculateCartTotal(items, discount, shipping, tax);

  const handleCheckoutClick = async () => {
    if (onCheckout) {
      const isValid = await validateCheckout();
      if (isValid) {
        onCheckout();
      }
    }
  };

  if (isEmpty && !isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">Your cart is empty</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showItemCount && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Items</span>
              <span className="font-medium">{itemCount}</span>
            </div>
          )}

          {showSubtotal && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
          )}

          {showShipping && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">{shipping > 0 ? formatPrice(shipping) : "Free"}</span>
            </div>
          )}

          {showTax && tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium">{formatPrice(tax)}</span>
            </div>
          )}

          {showDiscount && discount > 0 && (
            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
              <span>Discount{couponCode && ` (${couponCode})`}</span>
              <span className="font-medium">-{formatPrice(discount)}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </CardContent>

        {showCheckoutButton && (
          <CardFooter className="flex-col gap-2">
            <Button
              onClick={handleCheckoutClick}
              disabled={isEmpty || isLoading || isValidating}
              className="w-full"
              size="lg"
            >
              {isLoading || isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isValidating ? "Validating..." : "Loading..."}
                </>
              ) : (
                checkoutButtonLabel
              )}
            </Button>
            {isEmpty && (
              <p className="text-xs text-center text-muted-foreground">
                Add items to your cart to checkout
              </p>
            )}
          </CardFooter>
        )}
      </Card>

      <CheckoutAlertModal
        open={showModal}
        onOpenChange={setShowModal}
        issues={issues}
        generalErrors={generalErrors}
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
        onUpdatePrice={handleUpdatePrice}
        isProcessing={isProcessing}
      />
    </>
  );
}
