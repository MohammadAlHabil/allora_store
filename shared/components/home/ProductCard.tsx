"use client";

import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/features/cart/components/AddToCartButton";
import { WishlistButton } from "@/features/wishlist";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  rating?: number;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative bg-card rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-sm hover:border-primary/20">
      <Link href={`/product/${product.slug}`} className="block">
        {/* Image Container */}
        <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/banner.png";
            }}
          />

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
              <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
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
      <div className="px-4 pb-4">
        <AddToCartButton productId={product.id} />
      </div>
    </article>
  );
}
