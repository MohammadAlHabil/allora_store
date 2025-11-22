"use client";

import { Heart, ShoppingCart, Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/features/cart/components/AddToCartButton";
import { useWishlist, useToggleWishlist } from "@/features/wishlist/hooks/useWishlist";
import type { WishlistProduct } from "@/features/wishlist/types/wishlist.types";
import { Button } from "@/shared/components/ui/button";

export default function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist();
  const { mutate: toggleWishlist } = useToggleWishlist();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
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
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
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
                className="bg-card rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link href={`/product/${product.slug}`} className="block">
                  <div className="relative h-56 w-full bg-gray-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/banner.png";
                      }}
                    />
                    {/* Availability Badge */}
                    {!product.isAvailable || product.isArchived ? (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Unavailable
                      </div>
                    ) : null}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-1 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-lg">
                        ${Number(product.basePrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="p-4 pt-0 space-y-2">
                  {/* Add to Cart Button */}
                  {product.isAvailable && !product.isArchived ? (
                    <AddToCartButton
                      productId={product.id}
                      size="sm"
                      className="w-full"
                      defaultQuantity={1}
                    />
                  ) : (
                    <Button disabled size="sm" className="w-full" variant="secondary">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Out of Stock
                    </Button>
                  )}
                  {/* Remove from Wishlist Button */}
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist(product.id);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Heart className="w-4 h-4 mr-2 fill-current" />
                    Remove from Wishlist
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
