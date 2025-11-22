"use client";

import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { WishlistButton } from "@/features/wishlist";
import { Button } from "@/shared/components/ui/button";

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
    <article className="bg-card rounded-2xl shadow-sm overflow-hidden">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative h-56 w-full bg-gray-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/banner.png";
            }}
          />
          {/* Wishlist Button */}
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-white/80 backdrop-blur-sm rounded-full shadow-md">
              <WishlistButton productId={product.id} size="icon" variant="ghost" iconSize={18} />
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-medium  mb-1">{product.name}</h3>
          <div className="flex items-center justify-between">
            <span className="font-semibold">${product.price.toFixed(2)}</span>
            <div className="text-sm text-muted">{product.rating ?? 4.5} ★</div>
          </div>
        </div>
      </Link>
      <div className="p-4 pt-0">
        <Button
          className="w-full flex items-center gap-2"
          size="sm"
          onClick={() => alert("Added to cart")}
        >
          <ShoppingCart className="w-4 h-4" />
          Add to cart
        </Button>
      </div>
    </article>
  );
}
