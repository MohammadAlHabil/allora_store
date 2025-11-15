"use client";

import Image from "next/image";
import Link from "next/link";

type Category = {
  id: string;
  name: string;
  slug: string;
  image: string;
  subcategories?: string[];
};

export default function FeaturedCategories({ categories }: { categories?: Category[] }) {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">Featured Categories</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 justify-items-center">
        {(
          categories ?? [
            {
              id: "cat-fashion",
              name: "Fashion",
              slug: "fashion",
              image: "/images/cat-fashion.jpg",
              subcategories: ["Dresses", "Tops", "Pants", "Skirts"],
            },
            { id: "cat-shoes", name: "Shoes", slug: "shoes", image: "/images/cat-shoes.jpg" },
            {
              id: "cat-beauty",
              name: "Beauty",
              slug: "beauty",
              image: "/images/cat-beauty.jpg",
              subcategories: ["Makeup", "Skincare", "Haircare", "Perfumes"],
            },
            {
              id: "cat-accessories",
              name: "Accessories",
              slug: "accessories",
              image: "/images/cat-accessories.jpg",
              subcategories: ["Watches", "Scarves", "Sunglasses", "Belts"],
            },
            { id: "cat-bags", name: "Bags", slug: "bags", image: "/images/cat-bags.jpg" },
            {
              id: "cat-sports",
              name: "Sportswear",
              slug: "sportswear",
              image: "/images/cat-sportswear.jpg",
            },
          ]
        ).map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="group block overflow-hidden rounded-2xl shadow-md bg-card w-full max-w-[220px]"
          >
            <div className="relative h-36 sm:h-44 w-full bg-gray-100/50">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="p-3">
              <h3 className="font-medium">{cat.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
