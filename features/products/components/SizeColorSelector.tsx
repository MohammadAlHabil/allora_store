"use client";

import { Check } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { AvailableColor, AvailableSize } from "../types/product.types";

interface SizeColorSelectorProps {
  sizes: AvailableSize[];
  colors: AvailableColor[];
  selectedSize: string | null;
  selectedColor: string | null;
  onSizeChange: (size: string) => void;
  onColorChange: (color: string) => void;
  variantLabel?: string;
}

/**
 * Size and color selector component
 */
export function SizeColorSelector({
  sizes,
  colors,
  selectedSize,
  selectedColor,
  onSizeChange,
  onColorChange,
  variantLabel = "Size",
}: SizeColorSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Color selector */}
      {colors.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Color
              {selectedColor && (
                <span className="ml-2 text-muted-foreground font-normal">
                  ({colors.find((c) => c.value === selectedColor)?.label})
                </span>
              )}
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => onColorChange(color.value)}
                disabled={!color.isAvailable}
                className={cn(
                  "group relative h-10 w-10 rounded-full border-2 transition-all",
                  selectedColor === color.value
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-muted hover:border-primary/50",
                  !color.isAvailable && "opacity-50 cursor-not-allowed"
                )}
                aria-label={`Select ${color.label} color${!color.isAvailable ? " (unavailable)" : ""}`}
                title={color.label}
              >
                {color.hexCode ? (
                  <div
                    className={cn(
                      "h-full w-full rounded-full",
                      color.hexCode === "#FFFFFF" && "border border-gray-200"
                    )}
                    style={{ backgroundColor: color.hexCode }}
                  />
                ) : (
                  <div className="h-full w-full rounded-full bg-linear-to-br from-pink-500 via-purple-500 to-blue-500" />
                )}

                {selectedColor === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="h-5 w-5 text-white drop-shadow-md" strokeWidth={3} />
                  </div>
                )}

                {!color.isAvailable && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-px w-full rotate-45 bg-destructive" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size selector */}
      {sizes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              {variantLabel}
              {selectedSize && (
                <span className="ml-2 text-muted-foreground font-normal">({selectedSize})</span>
              )}
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <Button
                key={size.value}
                variant={selectedSize === size.value ? "default" : "outline"}
                size="sm"
                onClick={() => onSizeChange(size.value)}
                disabled={!size.isAvailable}
                className={cn(
                  "min-w-12 transition-all",
                  !size.isAvailable && "opacity-50 cursor-not-allowed line-through"
                )}
                aria-label={`Select size ${size.label}${!size.isAvailable ? " (unavailable)" : ""}`}
              >
                {size.label}
              </Button>
            ))}
          </div>

          {selectedSize && (
            <p className="text-xs text-muted-foreground">
              {sizes.find((s) => s.value === selectedSize)?.stockCount} items available
            </p>
          )}
        </div>
      )}

      {/* Size guide link */}
      {sizes.length > 0 && (
        <button
          className="text-sm text-primary hover:underline"
          onClick={() => {
            // TODO: Open size guide modal
            console.log("Open size guide");
          }}
        >
          Size Guide
        </button>
      )}
    </div>
  );
}
