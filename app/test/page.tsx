"use client";

import {
  ShoppingCart,
  Package,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Gift,
  Shield,
  Truck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { AddToCartButton, CartItem, CartSummary, CouponInput } from "@/features/cart/components";
import { useCart } from "@/features/cart/hooks";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import { formatPrice } from "@/shared/lib/utils/formatters";

// Mock product for testing
const mockProducts = [
  {
    id: "prod-1",
    name: "Test Product 1",
    price: 29.99,
    variantId: "var-1",
  },
  {
    id: "prod-2",
    name: "Test Product 2",
    price: 49.99,
    variantId: null,
  },
  {
    id: "prod-3",
    name: "Test Product 3",
    price: 19.99,
    variantId: "var-3",
  },
];

export default function TestPage() {
  const {
    cart,
    items,
    itemCount,
    total,
    isEmpty,
    isLoading,
    isAdding,
    isUpdating,
    isRemoving,
    error,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    refetchCart,
  } = useCart();

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const handleApplyCoupon = async (code: string) => {
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

    // Refetch cart to update totals
    refetchCart();
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

      // Refetch cart to update totals
      refetchCart();
    } catch (error: unknown) {
      if (typeof error === "string") console.error("Error removing coupon:", error);
      else if (error && typeof error === "object" && "message" in error) {
        const m = (error as { message?: unknown }).message;
        console.error("Error removing coupon:", typeof m === "string" ? m : error);
      } else {
        console.error("Error removing coupon:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-3 shadow-md">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    Cart System Test Page
                  </h1>
                  <p className="text-muted-foreground text-lg mt-1">
                    صفحة اختبار شاملة لنظام السلة - اختبار جميع المكونات والوظائف
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="px-3 py-1 text-sm font-semibold shadow-sm">
                Test Mode
              </Badge>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
            <Card className="shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-card/80 backdrop-blur-sm border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Cart Items</p>
                    <p className="text-3xl font-bold mt-1">{itemCount}</p>
                  </div>
                  <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-3 shadow-sm">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-card/80 backdrop-blur-sm border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Total</p>
                    <p className="text-3xl font-bold mt-1">{formatPrice(total)}</p>
                  </div>
                  <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-3 shadow-sm">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-card/80 backdrop-blur-sm border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Status</p>
                    <Badge
                      variant={isEmpty ? "outline" : "default"}
                      className="mt-2 shadow-sm font-semibold"
                    >
                      {isEmpty ? "Empty" : "Active"}
                    </Badge>
                  </div>
                  <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-3 shadow-sm">
                    {isEmpty ? (
                      <AlertCircle className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-card/80 backdrop-blur-sm border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Loading</p>
                    <div className="flex items-center gap-2 mt-2">
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                      <span className="text-sm font-medium">{isLoading ? "Yes" : "No"}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {isAdding && (
                      <Badge variant="outline" className="text-xs shadow-sm">
                        Adding
                      </Badge>
                    )}
                    {isUpdating && (
                      <Badge variant="outline" className="text-xs shadow-sm">
                        Updating
                      </Badge>
                    )}
                    {isRemoving && (
                      <Badge variant="outline" className="text-xs shadow-sm">
                        Removing
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="mb-8 border-destructive shadow-lg bg-destructive/5 animate-in fade-in slide-in-from-top-4 duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-destructive">
                  <div className="rounded-full bg-destructive/10 p-2">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cart State Info */}
          <Card className="mb-8 shadow-lg border bg-card/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-primary/5 to-transparent">
              <CardTitle className="text-xl font-bold">Cart State (Raw Data)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <pre className="bg-muted/50 p-4 rounded-md overflow-auto text-xs border shadow-inner">
                {JSON.stringify(
                  {
                    cart,
                    items,
                    itemCount,
                    total,
                    isEmpty,
                    isLoading,
                  },
                  null,
                  2
                )}
              </pre>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
            {/* Left Column - Test Components */}
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 delay-200">
              {/* Add to Cart Buttons */}
              <Card className="shadow-lg border bg-card/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-primary/5 to-transparent">
                  <CardTitle className="text-xl font-bold">Add to Cart Buttons</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Simple Button</h3>
                    <AddToCartButton
                      productId={mockProducts[0].id}
                      variantId={mockProducts[0].variantId}
                      defaultQuantity={1}
                    />
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-2">With Quantity Input</h3>
                    <AddToCartButton
                      productId={mockProducts[1].id}
                      variantId={mockProducts[1].variantId}
                      showQuantityInput
                      defaultQuantity={1}
                    />
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-2">Different Variants</h3>
                    <div className="flex gap-2 flex-wrap">
                      <AddToCartButton
                        productId={mockProducts[2].id}
                        variantId={mockProducts[2].variantId}
                        variant="default"
                        size="sm"
                      />
                      <AddToCartButton
                        productId={mockProducts[2].id}
                        variantId={mockProducts[2].variantId}
                        variant="outline"
                        size="sm"
                      />
                      <AddToCartButton
                        productId={mockProducts[2].id}
                        variantId={mockProducts[2].variantId}
                        variant="secondary"
                        size="sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cart Items List */}
              <Card className="shadow-lg border bg-card/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-primary/5 to-transparent">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">Cart Items</CardTitle>
                    <Badge variant="outline" className="font-semibold shadow-sm">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isEmpty ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="relative mx-auto w-20 h-20 mb-4">
                        <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
                        <div className="relative rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-4">
                          <ShoppingCart className="h-10 w-10 opacity-50" />
                        </div>
                      </div>
                      <p className="font-medium">Cart is empty</p>
                      <p className="text-sm mt-2">Use the buttons above to add items</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {items.map((item, index) => (
                        <div
                          key={item.id}
                          className="transition-all duration-200 hover:bg-muted/30"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <CartItem
                            key={item.id}
                            item={item}
                            showRemoveButton
                            showImage={true}
                            imageUrl={item.imageUrl || undefined}
                            className="px-4 md:px-6 py-6"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card className="shadow-lg border bg-card/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-primary/5 to-transparent">
                  <CardTitle className="text-xl font-bold">Cart Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-6">
                  <Button
                    onClick={() => refetchCart()}
                    variant="outline"
                    className="w-full shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      "Refresh Cart"
                    )}
                  </Button>

                  <Button
                    onClick={() => clearCart()}
                    variant="destructive"
                    className="w-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                    disabled={isEmpty || isLoading}
                  >
                    Clear Cart
                  </Button>

                  <div className="pt-4">
                    <p className="text-sm font-medium mb-2">Test Direct Actions:</p>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button
                          onClick={() =>
                            addItem({
                              productId: mockProducts[0].id,
                              variantId: mockProducts[0].variantId,
                              quantity: 1,
                            })
                          }
                          variant="outline"
                          size="sm"
                          className="flex-1 shadow-sm hover:shadow-md transition-all duration-200"
                          disabled={isAdding}
                        >
                          Add Product 1
                        </Button>
                        <Button
                          onClick={() =>
                            addItem({
                              productId: mockProducts[1].id,
                              variantId: null,
                              quantity: 2,
                            })
                          }
                          variant="outline"
                          size="sm"
                          className="flex-1 shadow-sm hover:shadow-md transition-all duration-200"
                          disabled={isAdding}
                        >
                          Add Product 2 (x2)
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary & Coupon */}
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
                    placeholder="Try: TEST10 or SAVE20"
                  />
                </CardContent>
              </Card>

              {/* Cart Summary */}
              <Card className="shadow-xl border-2 border-primary/10 sticky top-4 bg-card/90 backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-primary/5 to-transparent">
                  <CardTitle className="text-xl font-bold">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <CartSummary
                    showCheckoutButton
                    checkoutButtonLabel="Proceed to Checkout"
                    onCheckout={() => {
                      alert("Checkout clicked! Total: " + formatPrice(total));
                    }}
                    showItemCount
                    showSubtotal
                    showShipping={false}
                    showTax={false}
                    showDiscount={!!appliedCoupon && discountAmount > 0}
                    discountAmount={discountAmount}
                    couponCode={appliedCoupon || undefined}
                  />
                </CardContent>
              </Card>

              {/* Test Info */}
              <Card className="shadow-lg border bg-card/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-primary/5 to-transparent">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Test Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm pt-6">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors duration-200">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Test Adding Items:
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Click any &quot;Add to Cart&quot; button above
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors duration-200">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Test Quantity:
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Use +/- buttons or input in cart items
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors duration-200">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Test Removing:
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Click trash icon on any cart item
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors duration-200">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Test Coupons:
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Try any coupon code from your database
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      Make sure to create coupons in your database first
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors duration-200">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Test States:
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Watch loading states and status cards
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Card className="border shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-primary/5 via-primary/5 to-transparent">
              <CardContent className="pt-4 pb-4 px-3 md:px-4 text-center">
                <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 w-12 h-12 flex items-center justify-center mx-auto mb-2 transition-transform duration-200 hover:scale-110">
                  <Truck className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <p className="text-xs md:text-sm font-medium">Free Shipping</p>
              </CardContent>
            </Card>

            <Card className="border shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-primary/5 via-primary/5 to-transparent">
              <CardContent className="pt-4 pb-4 px-3 md:px-4 text-center">
                <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 w-12 h-12 flex items-center justify-center mx-auto mb-2 transition-transform duration-200 hover:scale-110">
                  <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <p className="text-xs md:text-sm font-medium">Secure Payment</p>
              </CardContent>
            </Card>

            <Card className="border shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-primary/5 via-primary/5 to-transparent">
              <CardContent className="pt-4 pb-4 px-3 md:px-4 text-center">
                <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 w-12 h-12 flex items-center justify-center mx-auto mb-2 transition-transform duration-200 hover:scale-110">
                  <Package className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <p className="text-xs md:text-sm font-medium">Easy Returns</p>
              </CardContent>
            </Card>

            <Card className="border shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-primary/5 via-primary/5 to-transparent">
              <CardContent className="pt-4 pb-4 px-3 md:px-4 text-center">
                <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 w-12 h-12 flex items-center justify-center mx-auto mb-2 transition-transform duration-200 hover:scale-110">
                  <Gift className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <p className="text-xs md:text-sm font-medium">Rewards</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
