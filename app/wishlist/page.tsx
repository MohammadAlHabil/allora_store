"use client";

import { Heart, ShoppingCart, Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/features/cart/components/AddToCartButton";
import { WishlistButton } from "@/features/wishlist";
import { useWishlist } from "@/features/wishlist/hooks/useWishlist";
import type { WishlistProduct } from "@/features/wishlist/types/wishlist.types";
import { Button } from "@/shared/components/ui/button";

export default function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  const items = wishlist?.items || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Wishlist</h1>
              <p className="text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "items"} saved
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-100 rounded-full p-6 mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start adding products you love to your wishlist and find them here later!
            </p>
            <Link href="/">
              <Button size="lg">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((product: WishlistProduct) => (
              <article
                key={product.id}
                className="group relative bg-card rounded-2xl border overflow-hidden hover:shadow-sm transition-all duration-300"
              >
                <Link href={`/product/${product.slug}`} className="block">
                  {/* Image Container */}
                  <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/banner.png";
                      }}
                    />
                    {/* Availability Badge */}
                    {!product.isAvailable || product.isArchived ? (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                        Unavailable
                      </div>
                    ) : null}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">
                        ${Number(product.basePrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Action Buttons */}
                <div className="p-4 pt-0 flex items-center justify-between gap-2">
                  {/* Add to Cart Button */}
                  {product.isAvailable && !product.isArchived ? (
                    <AddToCartButton
                      productId={product.id}
                      productName={product.name}
                      expandDirection="right"
                    />
                  ) : (
                    <Button
                      disabled
                      size="icon-lg"
                      className="flex-1 rounded-full"
                      variant="secondary"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  )}

                  {/* Remove from Wishlist Button */}
                  <WishlistButton
                    productId={product.id}
                    productName={product.name}
                    size="icon"
                    variant="outline"
                    className="rounded-full border-red-200 h-10 w-10"
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
