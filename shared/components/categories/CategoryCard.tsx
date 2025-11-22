"use client";

import { ArrowRight, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";

type CategoryCardProps = {
  category: {
    id: string;
    name: string;
    slug: string;
    imageUrl?: string | null;
    _count: {
      products: number;
    };
  };
  index: number;
};

export default function CategoryCard({ category, index }: CategoryCardProps) {
  // Category-specific images mapping
  const categoryImages: Record<string, string> = {
    bags: "/images/categories/bags.jpg",
    fashion: "/images/categories/fashion.jpg",
    dresses: "/images/categories/dresses.jpg",
    watches: "/images/categories/watches.webp",
    belts: "/images/categories/belts.webp",
    makeup: "/images/categories/makeup.webp",
    skincare: "/images/categories/Skincare.webp",
    accessories: "/images/categories/accesories.webp",
    sportswear: "/images/categories/sportware.webp",
    haircare: "/images/categories/haircare.webp",
    shoes: "/images/categories/shoes.webp",
    pants: "/images/categories/pantes.webp",
    scarves: "/images/categories/Scarves.webp",
    sunglasses: "/images/categories/Sunglasses.webp",
    perfumes: "/images/categories/Perfumes.webp",
    skirts: "/images/categories/Skirts.webp",
    tops: "/images/categories/Tops.webp",
    beauty: "/images/categories/Beauty.webp",
  };

  // Get category-specific image or fallback to placeholder
  const categoryImage =
    category.imageUrl ||
    categoryImages[category.slug] ||
    `/images/categories/placeholder-${(index % 4) + 1}.jpg`;

  return (
    <Link href={`/products?category=${category.slug}`}>
      <Card
        className="
          relative overflow-hidden min-h-[280px] p-4
          bg-transparent border-none shadow-none
          cursor-pointer group
        "
        style={{
          animationDelay: `${index * 100}ms`,
        }}
      >
        {/* Main Image Container - Rounded & Shadowed */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-500">
          <Image
            src={categoryImage}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={90}
          />

          {/* Subtle gradient only at the very bottom for depth, not darkness */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
        </div>

        {/* Floating Glass Panel - Bottom */}
        <div className="absolute bottom-4 left-4 right-4">
          <div
            className="
            relative overflow-hidden
            bg-white/10 backdrop-blur-md
            border border-white/20
            rounded-2xl p-4
            transition-all duration-300
            group-hover:bg-white/20 group-hover:border-white/30
            group-hover:translate-y-[-4px]
          "
          >
            {/* Shine Effect on Glass */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />

            <div className="flex items-center justify-between relative z-10">
              <div>
                <h3 className="text-xl font-bold text-white drop-shadow-md mb-1">
                  {category.name}
                </h3>
                <p className="text-xs text-white/90 font-medium flex items-center gap-1">
                  {category._count.products} {category._count.products === 1 ? "Item" : "Items"}
                </p>
              </div>

              {/* Icon Circle */}
              <div
                className="
                w-10 h-10 rounded-full
                bg-white/20 backdrop-blur-sm
                flex items-center justify-center
                group-hover:bg-white group-hover:text-black
                transition-all duration-300
              "
              >
                <ArrowRight className="w-4 h-4 text-white group-hover:text-black transition-colors duration-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Right Icon - Floating */}
        <div className="absolute top-4 right-4 z-10">
          <div
            className="
             w-10 h-10 rounded-full
             bg-black/20 backdrop-blur-md border border-white/10
             flex items-center justify-center
             opacity-0 group-hover:opacity-100
             translate-y-[-10px] group-hover:translate-y-0
             transition-all duration-500 ease-out
           "
          >
            <Package className="w-4 h-4 text-white" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
