"use client";

import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/features/cart/components/AddToCartButton";
import { WishlistButton } from "@/features/wishlist";
import { Badge } from "@/shared/components/ui/badge";
import { formatPrice } from "@/shared/lib/utils/formatters";
import {
  getAvailabilityMessage,
  getAvailabilityStatus,
  isProductAvailable,
  type ProductAvailabilityData,
} from "@/shared/lib/utils/product-availability";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  rating?: number;
  isAvailable: boolean;
  isArchived: boolean;
  stock: number;
  // Variant information if product has variants
  defaultVariantId?: string | null;
  hasVariants?: boolean;
};

export default function ProductCard({ product }: { product: Product }) {
  const availability: ProductAvailabilityData = {
    isAvailable: product.isAvailable,
    isArchived: product.isArchived,
    stock: product.stock,
  };

  const availabilityStatus = getAvailabilityStatus(availability);
  const isAvailable = isProductAvailable(availability);
  const availabilityMessage = getAvailabilityMessage(availability);

  // Determine variantId to use:
  // - If product has variants, use defaultVariantId
  // - If no variants, use null (direct inventory)
  const variantId = product.hasVariants ? product.defaultVariantId || null : null;

  return (
    <article className="group relative bg-card rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-sm hover:border-primary/20">
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image Container */}
        <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            quality={85}
            priority={false}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmM2Y0ZjY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2U1ZTdlYjtzdG9wLW9wYWNpdHk6MSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPgo8L3N2Zz4="
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/placeholder.png";
            }}
          />

          {/* Availability Badge - Top Left */}
          {!isAvailable && (
            <div className="absolute top-3 left-3 z-10">
              <Badge
                variant={
                  availabilityStatus === "archived" || availabilityStatus === "unavailable"
                    ? "secondary"
                    : "glass"
                }
              >
                {availabilityMessage}
              </Badge>
            </div>
          )}

          {/* Wishlist Button - Top Right */}
          <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-background/95 backdrop-blur-sm rounded-full shadow-lg">
              <WishlistButton
                productId={product.id}
                productName={product.name}
                size="icon"
                variant="ghost"
                iconSize={18}
              />
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-base line-clamp-2">{product.name}</h3>

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
              {product.rating ? (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span className="text-yellow-500">★</span>
                  <span className="font-medium">{product.rating.toFixed(1)}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="px-4 pb-4 text-end">
        <AddToCartButton
          productId={product.id}
          productName={product.name}
          variantId={variantId}
          expandDirection="left"
          className="ml-auto"
          availability={availability}
        />
      </div>
    </article>
  );
}
