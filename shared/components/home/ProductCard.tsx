"use client";

import Image from "next/image";
import Link from "next/link";
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
          {/* <Image src={product.image} alt={product.name} fill className="object-cover" /> */}
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
        <Button className="w-full" size="sm" onClick={() => alert("Added to cart")}>
          Add to cart
        </Button>
      </div>
    </article>
  );
}
