"use client";

import { Heart } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/**
 * Wishlist Icon Component
 * Animated heart icon for wishlist
 */

interface WishlistIconProps {
  isInWishlist: boolean;
  className?: string;
  size?: number;
}

export function WishlistIcon({ isInWishlist, className, size = 20 }: WishlistIconProps) {
  return (
    <Heart
      className={cn(
        "transition-all duration-300 ease-in-out",
        isInWishlist
          ? "fill-red-500 text-red-500 scale-110"
          : "fill-none text-gray-700 hover:text-red-500 hover:scale-110",
        className
      )}
      size={size}
      strokeWidth={2}
    />
  );
}
