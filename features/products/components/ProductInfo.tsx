"use client";

import { Heart, Share2, ShoppingCart, Star, TruckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useCart } from "@/features/cart/hooks/useCart";
import { useExpressCheckout } from "@/features/checkout/hooks/useExpressCheckout";
import { useToggleWishlist, useWishlist } from "@/features/wishlist/hooks/useWishlist";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import {
  calculateTotalStock,
  calculateVariantStock,
  shouldDisableAddToCart,
  type ProductAvailabilityData,
} from "@/shared/lib/utils/product-availability";
import type { ProductDetails, ProductSelection } from "../types/product.types";
import {
  findMatchingVariant,
  formatPrice,
  getAvailableColors,
  getAvailableColorsForSize,
  getAvailableQuantity,
  getAvailableSizes,
  getAvailableSizesForColor,
  getPriceInfo,
  getStockStatus,
  getStockStatusMessage,
  getVariantColor,
  getVariantLabel,
  getVariantSize,
  isValidSelection,
  validateSelection,
} from "../utils/product.utils";
import { QuantitySelector } from "./QuantitySelector";
import { SizeColorSelector } from "./SizeColorSelector";

interface ProductInfoProps {
  product: ProductDetails;
}

/**
 * Product information component with selection and actions
 */
export function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter();
  const { addItem, isAdding } = useCart();
  const { setExpressItem } = useExpressCheckout();

  // NOTE: product availability depends on the selected variant (if any)
  // We'll compute availability after the selected variant is known below.

  const [selection, setSelection] = useState<ProductSelection>({
    size: null,
    color: null,
    quantity: 1,
    selectedVariantId: null,
  });

  const { data: wishlistData } = useWishlist();
  const { mutate: toggleWishlist, isPending: isTogglingWishlist } = useToggleWishlist();

  const isInWishlist = useMemo(() => {
    return wishlistData?.items?.some((item: { id: string }) => item.id === product.id) ?? false;
  }, [wishlistData, product.id]);

  const [isBuyingNow, setIsBuyingNow] = useState(false);

  // Auto-select first available variant on mount
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      // Find the first variant with stock or the default variant
      const defaultVariant =
        product.variants.find((v) => v.isDefault) ||
        product.variants.find((v) => getAvailableQuantity(v) > 0) ||
        product.variants[0];

      if (defaultVariant) {
        const size = getVariantSize(defaultVariant);
        const color = getVariantColor(defaultVariant);

        setSelection({
          size: size || null,
          color: color || null,
          quantity: 1,
          selectedVariantId: defaultVariant.id,
        });
      }
    }
  }, [product.variants]);

  // Get available options (memoized for performance)
  const allSizes = useMemo(() => getAvailableSizes(product.variants), [product.variants]);
  const allColors = useMemo(() => getAvailableColors(product.variants), [product.variants]);
  const variantLabel = useMemo(() => getVariantLabel(product.variants), [product.variants]);

  // Filter options based on current selection (memoized)
  const filteredSizes = useMemo(
    () =>
      selection.color ? getAvailableSizesForColor(product.variants, selection.color) : allSizes,
    [selection.color, product.variants, allSizes]
  );

  const filteredColors = useMemo(
    () =>
      selection.size ? getAvailableColorsForSize(product.variants, selection.size) : allColors,
    [selection.size, product.variants, allColors]
  );

  const displaySizes = selection.color ? filteredSizes : allSizes;
  const displayColors = selection.size ? filteredColors : allColors;

  // Find matching variant (memoized)
  const selectedVariant = useMemo(
    () => findMatchingVariant(product.variants, selection),
    [product.variants, selection]
  );
  const priceInfo = useMemo(
    () => getPriceInfo(product, selectedVariant),
    [product, selectedVariant]
  );
  const stockStatus = useMemo(
    () => getStockStatus(product, selectedVariant),
    [product, selectedVariant]
  );
  const maxQuantity = useMemo(() => {
    if (selectedVariant) return getAvailableQuantity(selectedVariant);

    // For products without variants, calculate total available from product-level inventories
    const total = calculateTotalStock(product.variants, product.inventories);
    return total;
  }, [selectedVariant, product]);

  // Calculate total product availability using centralized utility
  const productAvailability: ProductAvailabilityData = useMemo(() => {
    const stock = selectedVariant
      ? calculateVariantStock(selectedVariant?.inventory)
      : calculateTotalStock(product.variants, product.inventories);

    return {
      isAvailable: product.isAvailable,
      isArchived: product.isArchived,
      stock,
    };
  }, [product, selectedVariant]);

  // Check if selection is valid and product is available (memoized)
  const canAddToCart = useMemo(
    () => isValidSelection(product, selection) && !shouldDisableAddToCart(productAvailability),
    [product, selection, productAvailability]
  );

  // Handlers (memoized with useCallback)
  const handleSizeChange = useCallback(
    (size: string) => {
      const newSelection = {
        ...selection,
        size,
      };

      // Find matching variant for the new selection
      const matchedVariant = findMatchingVariant(product.variants, newSelection);

      setSelection({
        ...newSelection,
        selectedVariantId: matchedVariant?.id || null,
      });
    },
    [selection, product.variants]
  );

  const handleColorChange = useCallback(
    (color: string) => {
      const newSelection = {
        ...selection,
        color,
      };

      // Find matching variant for the new selection
      const matchedVariant = findMatchingVariant(product.variants, newSelection);

      setSelection({
        ...newSelection,
        selectedVariantId: matchedVariant?.id || null,
      });
    },
    [selection, product.variants]
  );

  const handleQuantityChange = useCallback(
    (quantity: number) => {
      const available = maxQuantity;

      // Validate quantity doesn't exceed available stock
      if (quantity > available && available > 0) {
        toast.warning("Quantity adjusted", {
          description: `Only ${available} item${available !== 1 ? "s" : ""} available`,
        });
        setSelection((prev) => ({ ...prev, quantity: available }));
      } else {
        setSelection((prev) => ({ ...prev, quantity }));
      }
    },
    [maxQuantity]
  );

  const handleAddToCart = () => {
    // Use enhanced validation
    const validation = validateSelection(product, selection);

    if (!validation.isValid) {
      toast.error("Cannot add to cart", {
        description: validation.error,
      });
      return;
    }

    addItem({
      productId: product.id,
      variantId: selectedVariant?.id || null,
      quantity: selection.quantity,
      productName: product.name,
    });
  };

  const handleBuyNow = async () => {
    // Use enhanced validation
    const validation = validateSelection(product, selection);

    if (!validation.isValid) {
      toast.error("Cannot proceed to checkout", {
        description: validation.error,
      });
      return;
    }

    setIsBuyingNow(true);

    try {
      // Store express checkout item (does NOT add to cart)
      setExpressItem({
        productId: product.id,
        productName: product.name,
        variantId: selectedVariant?.id || null,
        quantity: selection.quantity,
        unitPrice: priceInfo.current,
        image: product.images[0]?.url,
        sku: selectedVariant?.sku || product.sku || undefined,
      });

      // Navigate to express checkout
      router.push("/checkout?mode=express");

      toast.success("Proceeding to checkout", {
        description: `Buying ${selection.quantity}x ${product.name}`,
      });
    } catch (error) {
      console.error("Error during buy now:", error);
      toast.error("Failed to proceed to checkout", {
        description: "Please try again",
      });
    } finally {
      setIsBuyingNow(false);
    }
  };

  const handleWishlistToggle = () => {
    toggleWishlist({ productId: product.id, productName: product.name });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.shortDesc || product.name,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied", {
        description: "Product link has been copied to clipboard",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title and rating */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>

        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold tracking-tight">
            {formatPrice(priceInfo.current, product.currency)}
          </div>
          {priceInfo.original && (
            <div className="text-lg text-muted-foreground line-through">
              {formatPrice(Number(priceInfo.original), product.currency)}
            </div>
          )}
          {priceInfo.discountPercentage && (
            <Badge variant="destructive" className="px-2 py-0.5 text-sm">
              -{priceInfo.discountPercentage}% OFF
            </Badge>
          )}
        </div>

        {/* Product Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {product.sku && (
            <div className="flex items-center gap-1">
              <span className="font-medium">SKU:</span>
              {selectedVariant?.sku || product.sku}
            </div>
          )}
          {product.avgRating! > 0 && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <div className="flex text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <span className="font-medium text-foreground">{product.avgRating}</span>
                <span>({product.reviewCount} reviews)</span>
              </div>
            </>
          )}
        </div>

        {product.shortDesc && (
          <p className="text-base text-muted-foreground leading-relaxed">{product.shortDesc}</p>
        )}
      </div>

      <Separator />

      <SizeColorSelector
        sizes={displaySizes}
        colors={displayColors}
        selectedSize={selection.size}
        selectedColor={selection.color}
        onSizeChange={(size) => setSelection((prev) => ({ ...prev, size }))}
        onColorChange={(color) => setSelection((prev) => ({ ...prev, color }))}
        variantLabel={variantLabel}
      />
      {/* Quantity selector */}
      <QuantitySelector
        quantity={selection.quantity}
        maxQuantity={maxQuantity}
        onQuantityChange={handleQuantityChange}
        disabled={!selectedVariant && product.variants && product.variants.length > 0}
      />

      {/* Action buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleAddToCart}
          disabled={!canAddToCart || isAdding || isBuyingNow}
          className="w-full h-12 text-base"
          size="lg"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {isAdding ? "Adding..." : "Add to Cart"}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleBuyNow}
            disabled={!canAddToCart || isAdding || isBuyingNow}
            className="h-12"
          >
            {isBuyingNow ? "Processing..." : "Buy Now"}
          </Button>

          <div className="grid grid-cols-2 gap-2 w-fit">
            <Button
              variant="outline"
              size="icon"
              onClick={handleWishlistToggle}
              disabled={isAdding || isBuyingNow || isTogglingWishlist}
              className="h-12 "
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={cn("h-5 w-5", isInWishlist && "fill-destructive text-destructive")}
              />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              disabled={isAdding || isBuyingNow}
              className="h-12"
              aria-label="Share product"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product meta */}
      <div className="space-y-3 border-t pt-6">
        <div className="flex items-center gap-3 text-sm">
          <TruckIcon className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">Free shipping</p>
            <p className="text-muted-foreground">On orders over $100</p>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4 text-sm">
          {product.sku && (
            <div>
              <p className="text-muted-foreground">SKU</p>
              <p className="font-medium">{product.sku}</p>
            </div>
          )}

          {product.categories.length > 0 && (
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="font-medium">{product.categories[0].category.name}</p>
            </div>
          )}

          <div>
            <p className="text-muted-foreground">Product Type</p>
            <p className="font-medium capitalize">{product.type.toLowerCase()}</p>
          </div>

          {selectedVariant?.sku && (
            <div>
              <p className="text-muted-foreground">Variant SKU</p>
              <p className="font-medium">{selectedVariant.sku}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
