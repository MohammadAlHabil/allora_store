"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (quantity: number) => void;
  disabled?: boolean;
}

/**
 * Quantity selector with increment/decrement buttons
 */
export function QuantitySelector({
  quantity,
  maxQuantity,
  onQuantityChange,
  disabled = false,
}: QuantitySelectorProps) {
  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);

    if (isNaN(value) || value < 1) {
      onQuantityChange(1);
    } else if (value > maxQuantity) {
      onQuantityChange(maxQuantity);
    } else {
      onQuantityChange(value);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Quantity</label>

      <div className="flex items-center gap-3">
        <div className="flex items-center border rounded-md">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDecrement}
            disabled={disabled || quantity <= 1}
            className="h-10 w-10 rounded-r-none"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </Button>

          <Input
            type="number"
            min="1"
            max={maxQuantity}
            value={quantity}
            onChange={handleInputChange}
            disabled={disabled}
            className="h-10 w-16 border-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="Quantity"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleIncrement}
            disabled={disabled || quantity >= maxQuantity}
            className="h-10 w-10 rounded-l-none"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {maxQuantity > 0 && (
          <span className="text-sm text-muted-foreground">{maxQuantity} available</span>
        )}
      </div>
    </div>
  );
}
