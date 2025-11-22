"use client";

import { ShoppingCart, Loader2, ArrowLeft, Package, Gift, Shield, Truck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CartItem, CartSummary, CouponInput } from "@/features/cart/components";
import { useCart } from "@/features/cart/hooks";
import { CheckoutButton } from "@/features/checkout/components";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export default function CartPage() {
  const { items, itemCount, isLoading, isEmpty, total, refetchCart } = useCart();
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Handle coupon application
  const handleApplyCoupon = async (code: string) => {
    try {
      const response = await fetch("/api/cart/apply-coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || "Failed to apply coupon");
      }

      setAppliedCoupon(data.data.coupon.code);
      setDiscountAmount(data.data.discountAmount);

      toast.success(`Coupon "${code}" applied successfully`);

      // Refetch cart to update totals
      refetchCart();
    } catch (error: unknown) {
      let msg = "Invalid coupon code";
      if (typeof error === "string") msg = error;
      else if (error && typeof error === "object" && "message" in error) {
        const m = (error as { message?: unknown }).message;
        if (typeof m === "string") msg = m;
      }
      toast.error(msg);
      throw error;
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      const response = await fetch("/api/cart/apply-coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ action: "remove" }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || "Failed to remove coupon");
      }

      setAppliedCoupon(null);
      setDiscountAmount(0);

      toast.success("Coupon removed");

      // Refetch cart to update totals
      refetchCart();
    } catch (error: unknown) {
      let msg = "Failed to remove coupon";
      if (typeof error === "string") msg = error;
      else if (error && typeof error === "object" && "message" in error) {
        const m = (error as { message?: unknown }).message;
        if (typeof m === "string") msg = m;
      }
      toast.error(msg);
    }
  };

  // Checkout button is now handled by CheckoutButton component

  // Loading state
  if (isLoading && isEmpty) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <div className="absolute inset-0 h-12 w-12 mx-auto border-4 border-primary/20 rounded-full"></div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Loading your cart...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (isEmpty && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 hover:bg-muted/50 transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </Button>
              </Link>
            </div>

            <Card className="border-2 border-dashed shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="pt-16 pb-16 px-8">
                <div className="flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl"></div>
                    <div className="relative rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-8 transition-transform duration-300 hover:scale-105">
                      <ShoppingCart className="h-16 w-16 text-primary/60" />
                    </div>
                  </div>

                  <div className="space-y-3 max-w-md">
                    <h2 className="text-3xl font-bold tracking-tight">Your cart is empty</h2>
                    <p className="text-muted-foreground text-lg">
                      Looks like you haven&apos;t added any items to your cart yet. Start shopping
                      to fill it up!
                    </p>
                  </div>

                  <Link href="/">
                    <Button
                      size="lg"
                      className="mt-6 h-12 px-8 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      Start Shopping
                      <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Features Section */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 w-14 h-14 flex items-center justify-center mx-auto mb-3 transition-transform duration-200 hover:scale-110">
                    <Truck className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">Free Shipping</h3>
                  <p className="text-sm text-muted-foreground">On orders over $50</p>
                </CardContent>
              </Card>

              <Card className="border shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 w-14 h-14 flex items-center justify-center mx-auto mb-3 transition-transform duration-200 hover:scale-110">
                    <Shield className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">Secure Payment</h3>
                  <p className="text-sm text-muted-foreground">100% secure checkout</p>
                </CardContent>
              </Card>

              <Card className="border shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 w-14 h-14 flex items-center justify-center mx-auto mb-3 transition-transform duration-200 hover:scale-110">
                    <Package className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">Easy Returns</h3>
                  <p className="text-sm text-muted-foreground">30-day return policy</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Cart with items
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 hover:bg-muted/50 transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </Button>
              </Link>

              <Badge variant="secondary" className="px-3 py-1 text-sm font-semibold shadow-sm">
                {items.length} {items.length === 1 ? "item" : "items"}
              </Badge>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Shopping Cart
              </h1>
              <p className="text-muted-foreground text-lg">
                Review your items and proceed to checkout
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_420px]">
            {/* Cart Items Section */}
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
              <Card className="shadow-lg border bg-card/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300 pt-0">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-primary/5 to-transparent pt-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold">Your Items</CardTitle>
                    <Badge variant="outline" className="font-semibold shadow-sm">
                      {items.length} {items.length === 1 ? "product" : "products"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className="transition-all duration-200 hover:bg-muted/30"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <CartItem
                          item={item}
                          showRemoveButton
                          showImage={true}
                          imageUrl={item.imageUrl || undefined}
                          className="px-4 md:px-6 py-6"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                <Card className="flex-1 min-w-[140px] max-w-[200px] border shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-primary/5 via-primary/5 to-transparent">
                  <CardContent className="pt-4 pb-4 px-3 md:px-4 text-center">
                    <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 w-12 h-12 flex items-center justify-center mx-auto mb-2 transition-transform duration-200 hover:scale-110">
                      <Truck className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <p className="text-xs md:text-sm font-medium">Free Shipping</p>
                  </CardContent>
                </Card>

                <Card className="flex-1 min-w-[140px] max-w-[200px] border shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-primary/5 via-primary/5 to-transparent">
                  <CardContent className="pt-4 pb-4 px-3 md:px-4 text-center">
                    <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 w-12 h-12 flex items-center justify-center mx-auto mb-2 transition-transform duration-200 hover:scale-110">
                      <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <p className="text-xs md:text-sm font-medium">Secure Payment</p>
                  </CardContent>
                </Card>

                <Card className="flex-1 min-w-[140px] max-w-[200px] border shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-primary/5 via-primary/5 to-transparent">
                  <CardContent className="pt-4 pb-4 px-3 md:px-4 text-center">
                    <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 w-12 h-12 flex items-center justify-center mx-auto mb-2 transition-transform duration-200 hover:scale-110">
                      <Package className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <p className="text-xs md:text-sm font-medium">Easy Returns</p>
                  </CardContent>
                </Card>

                <Card className="flex-1 min-w-[140px] max-w-[200px] border shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-primary/5 via-primary/5 to-transparent">
                  <CardContent className="pt-4 pb-4 px-3 md:px-4 text-center">
                    <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 w-12 h-12 flex items-center justify-center mx-auto mb-2 transition-transform duration-200 hover:scale-110">
                      <Gift className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <p className="text-xs md:text-sm font-medium">Rewards</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sidebar - Coupon & Summary */}
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Coupon Input */}
              <Card className="shadow-lg border bg-gradient-to-br from-primary/5 via-primary/5 to-transparent hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <Gift className="h-5 w-5 text-primary" />
                    Promo Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CouponInput
                    onApply={handleApplyCoupon}
                    appliedCode={appliedCoupon}
                    onRemove={handleRemoveCoupon}
                    disabled={isLoading}
                  />
                </CardContent>
              </Card>

              {/* Cart Summary */}
              <Card className="shadow-xl border-2 border-primary/10 sticky top-4 bg-card/90 backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300 pt-0">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-primary/5 to-transparent pt-6">
                  <CardTitle className="text-xl font-bold">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <CartSummary
                    showCheckoutButton={false}
                    showItemCount
                    showSubtotal
                    showShipping={false}
                    showTax={false}
                    showDiscount={!!appliedCoupon && discountAmount > 0}
                    discountAmount={discountAmount}
                    couponCode={appliedCoupon || undefined}
                  />
                  {/* Checkout Button */}
                  <div className="mt-4">
                    <CheckoutButton cartItemCount={itemCount} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
