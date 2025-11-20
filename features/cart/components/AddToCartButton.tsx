"use client";

import { ShoppingCart, Plus, Minus, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { isValidQuantity } from "@/shared/lib/utils/validation";
import { useAddToCart } from "../hooks";
import type { AddToCartInput } from "../types";

export interface AddToCartButtonProps {
  productId: string;
  variantId?: string | null;
  disabled?: boolean;
  className?: string;
  defaultQuantity?: number;
  showQuantityInput?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
}

/**
 * Add to Cart Button Component
 *
 * @example
 * ```tsx
 * <AddToCartButton
 *   productId="123"
 *   variantId="456"
 *   showQuantityInput
 *   defaultQuantity={1}
 * />
 * ```
 */
export function AddToCartButton({
  productId,
  variantId = null,
  disabled = false,
  className,
  defaultQuantity = 1,
  showQuantityInput = false,
  size = "default",
  variant = "default",
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(defaultQuantity);
  const { mutate: addItem, isPending } = useAddToCart();

  const handleAddToCart = () => {
    // Validate quantity
    if (!isValidQuantity(quantity)) {
      return;
    }

    const input: AddToCartInput = {
      productId,
      variantId,
      quantity,
    };

    addItem(input, {
      onSuccess: () => {
        // Reset quantity after successful add
        if (showQuantityInput) {
          setQuantity(defaultQuantity);
        }
      },
      onError: (error) => {
        // Error is handled by toast in the hook
        console.error("Failed to add item to cart:", error);
      },
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    } else if (e.target.value === "" || value <= 0) {
      // Reset to default if invalid
      setQuantity(defaultQuantity);
    }
  };

  const handleIncrement = () => {
    setQuantity((prev) => {
      const newQuantity = prev + 1;
      return isValidQuantity(newQuantity) ? newQuantity : prev;
    });
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  if (showQuantityInput) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center border rounded-md">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleDecrement}
            disabled={disabled || isPending || quantity <= 1}
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
            disabled={disabled || isPending}
            className="h-8 w-16 border-0 rounded-none text-center focus-visible:ring-0"
            aria-label="Quantity"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleIncrement}
            disabled={disabled || isPending}
            className="h-8 w-8 rounded-l-none"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={handleAddToCart}
          disabled={disabled || isPending || quantity <= 0}
          size={size}
          variant={variant}
          className="flex-1"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || isPending || quantity <= 0}
      size={size}
      variant={variant}
      className={className}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
