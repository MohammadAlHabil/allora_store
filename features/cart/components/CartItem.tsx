"use client";

import { Plus, Minus, Trash2, Loader2, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import { useUpdateQuantity, useRemoveItem } from "../hooks";
import type { CartItemResponse } from "../types";
import { formatCartItemPrice, formatCartItemTotal } from "../utils/formatters";

export interface CartItemProps {
  item: CartItemResponse;
  className?: string;
  showRemoveButton?: boolean;
  showImage?: boolean;
  imageUrl?: string;
}

/**
 * Cart Item Component
 * Displays a single cart item with quantity controls and remove button
 *
 * @example
 * ```tsx
 * <CartItem
 *   item={cartItem}
 *   showRemoveButton
 *   showImage
 *   imageUrl="/product-image.jpg"
 * />
 * ```
 */
export function CartItem({
  item,
  className,
  showRemoveButton = true,
  showImage = false,
  imageUrl = item.imageUrl || undefined,
}: CartItemProps) {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const { mutate: updateQuantity, isPending: isUpdating } = useUpdateQuantity();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveItem();
  const [imgSrc, setImgSrc] = useState(imageUrl || "/images/placeholder.png");

  // Update imgSrc when imageUrl prop changes
  useEffect(() => {
    if (imageUrl) {
      setImgSrc(imageUrl);
    }
  }, [imageUrl]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem({ itemId: item.id, productName: item.title });
      return;
    }

    setLocalQuantity(newQuantity);
    updateQuantity(
      { itemId: item.id, input: { quantity: newQuantity }, productName: item.title },
      {
        onError: () => {
          // Revert on error
          setLocalQuantity(item.quantity);
        },
      }
    );
  };

  const handleIncrement = () => {
    handleQuantityChange(localQuantity + 1);
  };

  const handleDecrement = () => {
    handleQuantityChange(localQuantity - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      handleQuantityChange(value);
    } else if (e.target.value === "" || value <= 0) {
      // Reset to current quantity if invalid
      setLocalQuantity(item.quantity);
    }
  };

  const handleRemove = () => {
    removeItem({ itemId: item.id, productName: item.title });
  };

  const isLoading = isUpdating || isRemoving;

  return (
    <div className={cn("space-y-4", className)} data-testid="cart-item">
      <div className="flex items-start gap-4 transition-all duration-200">
        {showImage && (
          <div className="relative h-24 w-24 md:h-28 md:w-28 flex-shrink-0 overflow-hidden rounded-lg border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 group">
            {imageUrl ? (
              <Link href={`/products/${item.slug}`}>
                <Image
                  src={imgSrc}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 96px, 112px"
                  onError={() => setImgSrc("/images/placeholder.png")}
                />
              </Link>
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-muted via-muted to-muted/50 flex items-center justify-center">
                <Package className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground/50" />
              </div>
            )}
          </div>
        )}

        <div className="flex-1 space-y-3">
          <div>
            <Link href={`/products/${item.slug}`} className="hover:underline">
              <h3 className="text-sm font-medium leading-tight">{item.title}</h3>
            </Link>
            {item.variantId && (
              <p className="text-xs text-muted-foreground mt-1">Variant: {item.variantId}</p>
            )}
            <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{formatCartItemPrice(item)}</span>
              {localQuantity > 1 && (
                <>
                  <span className="text-xs text-muted-foreground">×</span>
                  <span className="text-xs text-muted-foreground">{localQuantity}</span>
                </>
              )}
            </div>

            <span className="text-base font-semibold">{formatCartItemTotal(item)}</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center border rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleDecrement}
                disabled={isLoading || localQuantity <= 1}
                className="h-8 w-8 rounded-r-none hover:bg-muted transition-colors duration-200"
                aria-label="Decrease quantity"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
              </Button>
              <Input
                type="number"
                min="1"
                value={localQuantity}
                onChange={handleInputChange}
                disabled={isLoading}
                className="h-8 w-14 border-0 rounded-none text-center text-sm font-semibold focus-visible:ring-0 bg-transparent"
                aria-label="Quantity"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleIncrement}
                disabled={isLoading}
                className="h-8 w-8 rounded-l-none hover:bg-muted transition-colors duration-200"
                aria-label="Increase quantity"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Plus className="h-3 w-3" />
                )}
              </Button>
            </div>

            {showRemoveButton && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleRemove}
                disabled={isLoading}
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-110"
                aria-label="Remove item"
              >
                {isRemoving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
      <Separator />
    </div>
  );
}
