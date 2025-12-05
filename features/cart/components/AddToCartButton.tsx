"use client";

import { Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import {
  getAvailabilityMessage,
  shouldDisableAddToCart,
  type ProductAvailabilityData,
} from "@/shared/lib/utils/product-availability";
import { isValidQuantity } from "@/shared/lib/utils/validation";
import { useAddToCart, useCart, useRemoveItem, useUpdateQuantity } from "../hooks";
import type { AddToCartInput } from "../types";

export interface AddToCartButtonProps {
  productId: string;
  productName?: string; // Optional product name for toast messages
  variantId?: string | null;
  disabled?: boolean;
  className?: string;
  defaultQuantity?: number;
  showQuantityInput?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  expandDirection?: "left" | "right"; // Direction for desktop expanded controls
  // Product availability data (comes from API with product data)
  availability?: ProductAvailabilityData;
}

/**
 * Enhanced Add to Cart Icon Button Component
 *
 * Features:
 * - Uses product availability data from API (no separate request needed)
 * - Mobile: Always shows full controls when item is in cart
 * - Desktop: Shows icon with badge, expands to controls on hover
 * - Handles out of stock scenarios
 */
export function AddToCartButton({
  productId,
  productName,
  variantId = null,
  disabled = false,
  className,
  defaultQuantity = 1,
  showQuantityInput = false,
  size = "icon",
  variant = "default",
  expandDirection = "left",
  availability,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(defaultQuantity);
  const [isHovered, setIsHovered] = useState(false);

  // Cart hooks
  const { items } = useCart();
  const { mutate: addItem, isPending: isAdding } = useAddToCart();
  const { mutate: updateQuantity, isPending: isUpdating } = useUpdateQuantity();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveItem();

  // Check if product is in cart
  const cartItem = items.find(
    (item) => item.productId === productId && item.variantId === variantId
  );
  const isInCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;

  // Product availability check (use provided data or assume available if not provided)
  const isProductDisabled = availability
    ? disabled || shouldDisableAddToCart(availability)
    : disabled;
  const availabilityMessage = availability ? getAvailabilityMessage(availability) : "";
  const isPending = isAdding || isUpdating || isRemoving;

  const handleAddToCart = () => {
    if (!isValidQuantity(quantity) || isProductDisabled) {
      return;
    }

    const input: AddToCartInput = {
      productId,
      variantId,
      quantity,
      productName, // Pass product name for toast
    };

    addItem(input, {
      onSuccess: () => {
        if (showQuantityInput) {
          setQuantity(defaultQuantity);
        }
      },
      onError: (error) => {
        console.error("Failed to add item to cart:", error);
      },
    });
  };

  const handleIncrement = () => {
    if (isInCart && cartItem) {
      updateQuantity({
        itemId: cartItem.id,
        input: { quantity: cartQuantity + 1 },
        productName,
      });
    } else {
      setQuantity((prev) => {
        const newQuantity = prev + 1;
        return isValidQuantity(newQuantity) ? newQuantity : prev;
      });
    }
  };

  const handleDecrement = () => {
    if (isInCart && cartItem) {
      if (cartQuantity > 1) {
        updateQuantity({
          itemId: cartItem.id,
          input: { quantity: cartQuantity - 1 },
          productName,
        });
      }
    } else {
      setQuantity((prev) => Math.max(1, prev - 1));
    }
  };

  const handleRemove = () => {
    if (cartItem?.id) {
      removeItem({ itemId: cartItem.id, productName });
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      if (isInCart && cartItem) {
        updateQuantity({
          itemId: cartItem.id,
          input: { quantity: value },
          productName,
        });
      } else {
        setQuantity(value);
      }
    } else if (e.target.value === "" || value <= 0) {
      setQuantity(defaultQuantity);
    }
  };

  // Desktop: Icon with badge mode (not in showQuantityInput mode)
  if (isInCart && cartItem && !showQuantityInput) {
    return (
      <div
        className={cn("relative group w-fit", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Mobile: Always show controls */}
        <div className="flex md:hidden items-center gap-1.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={cartQuantity === 1 ? handleRemove : handleDecrement}
                  disabled={isPending}
                  className={cn(
                    "h-8 w-8 rounded-full",
                    cartQuantity === 1 && "text-red-600 hover:text-red-700 hover:bg-red-50"
                  )}
                  aria-label={cartQuantity === 1 ? "Remove from cart" : "Decrease quantity"}
                >
                  {isPending && isRemoving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : cartQuantity === 1 ? (
                    <Trash2 className="h-4 w-4" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{cartQuantity === 1 ? "Remove from cart" : "Decrease quantity"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="h-8 min-w-8 px-2 flex items-center justify-center text-sm font-semibold">
            {isPending && (isUpdating || isAdding) ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              cartQuantity
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleIncrement}
                  disabled={isPending}
                  className="h-8 w-8 rounded-full"
                  aria-label="Increase quantity"
                >
                  {isPending && isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add one more</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Desktop: Icon with badge, expands on hover */}
        <div className="hidden md:block">
          {/* Collapsed state: Icon with badge */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={variant}
                  size="icon"
                  className={cn(
                    "relative rounded-full transition-transform duration-200 transform",
                    // Animate collapsed icon: fade & scale out when hovered
                    isHovered
                      ? "opacity-0 scale-75 translate-y-0 pointer-events-none"
                      : "opacity-100 scale-100"
                  )}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {cartQuantity}
                      </span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {cartQuantity} {cartQuantity === 1 ? "item" : "items"} in cart
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Expanded state: Controls (shown on hover) */}
          <div
            className={cn(
              "absolute top-0 flex items-center gap-1.5",
              isHovered ? "" : "pointer-events-none",
              expandDirection === "left" ? "right-0" : "left-0"
            )}
            // keep container interactive state based on hover
            aria-hidden={!isHovered}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={cartQuantity === 1 ? handleRemove : handleDecrement}
                    disabled={isPending}
                    className={cn(
                      "h-9 w-9 rounded-full shadow-sm border bg-background transform transition-all duration-400",
                      cartQuantity === 1 && "text-red-600 hover:text-red-700 hover:bg-red-50",
                      // animate in/out with translateY and opacity based on hover state
                      isHovered
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-2 scale-95 pointer-events-none"
                    )}
                    style={{ transitionDelay: isHovered ? "40ms" : "0ms" }}
                    aria-label={cartQuantity === 1 ? "Remove from cart" : "Decrease quantity"}
                  >
                    {isPending && isRemoving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : cartQuantity === 1 ? (
                      <Trash2 className="h-4 w-4" />
                    ) : (
                      <Minus className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{cartQuantity === 1 ? "Remove from cart" : "Decrease quantity"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div
              className={cn(
                "h-9 min-w-9 px-2 flex items-center justify-center text-sm font-semibold bg-background rounded-full shadow-sm border transform transition-all duration-250",
                isHovered
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-2 scale-95 pointer-events-none"
              )}
              style={{ transitionDelay: isHovered ? "80ms" : "0ms" }}
            >
              {isPending && (isUpdating || isAdding) ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                cartQuantity
              )}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleIncrement}
                    disabled={isPending}
                    className={cn(
                      "h-9 w-9 rounded-full shadow-sm border bg-background transform transition-all duration-250",
                      isHovered
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-2 scale-95 pointer-events-none"
                    )}
                    style={{ transitionDelay: isHovered ? "120ms" : "0ms" }}
                    aria-label="Increase quantity"
                  >
                    {isPending && isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add one more</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    );
  }

  // Show quantity input mode
  if (showQuantityInput) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center border rounded-md">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDecrement}
            disabled={isProductDisabled || isPending || quantity <= 1}
            className="h-8 w-8 rounded-r-none"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
            disabled={isProductDisabled || isPending}
            className="h-8 w-16 border-0 rounded-none text-center focus-visible:ring-0"
            aria-label="Quantity"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleIncrement}
            disabled={isProductDisabled || isPending}
            className="h-8 w-8 rounded-l-none"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={handleAddToCart}
          disabled={isProductDisabled || isPending || quantity <= 0}
          size={size}
          variant={variant}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isProductDisabled ? availabilityMessage || "Unavailable" : "Add to Cart"}
            </>
          )}
        </Button>
      </div>
    );
  }

  // Default icon button mode
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleAddToCart}
            disabled={isProductDisabled || isPending}
            size="icon-lg"
            variant={variant}
            className={cn("rounded-full relative", className)}
            aria-label={isProductDisabled ? availabilityMessage || "Unavailable" : "Add to cart"}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="relative">
                <ShoppingCart className="h-4 w-4" />
                <Plus className="h-2.5 w-2.5 absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5" />
              </div>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isPending ? "Adding..." : isProductDisabled ? availabilityMessage : "Add to cart"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
