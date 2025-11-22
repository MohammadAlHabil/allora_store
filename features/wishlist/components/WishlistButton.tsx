"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useToggleWishlist, useWishlist } from "../hooks/useWishlist";
import type { WishlistProduct } from "../types/wishlist.types";
import { WishlistIcon } from "./WishlistIcon";

/**
 * Wishlist Button Component
 * Toggle button to add/remove products from wishlist
 */

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost";
  showLabel?: boolean;
  iconSize?: number;
}

export function WishlistButton({
  productId,
  className,
  size = "icon",
  variant = "ghost",
  showLabel = false,
  iconSize = 20,
}: WishlistButtonProps) {
  const { data: wishlist } = useWishlist();
  const { mutate: toggleWishlist, isPending } = useToggleWishlist();

  // Check if product is in wishlist
  const isInWishlist =
    wishlist?.items.some((item: WishlistProduct) => item.id === productId) ?? false;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId);
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={isPending}
      size={size}
      variant={variant}
      className={cn(
        "transition-all duration-200 hover:scale-110",
        size === "icon" && "h-9 w-9 rounded-full",
        className
      )}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isPending ? (
        <Loader2 className="animate-spin" size={iconSize} />
      ) : (
        <>
          <WishlistIcon isInWishlist={isInWishlist} size={iconSize} />
          {showLabel && (
            <span className="ml-2">{isInWishlist ? "In Wishlist" : "Add to Wishlist"}</span>
          )}
        </>
      )}
    </Button>
  );
}
