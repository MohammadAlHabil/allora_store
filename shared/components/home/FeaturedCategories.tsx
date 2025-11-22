"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  image: string;
};

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const response = await fetch("/api/categories/featured");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">Featured Categories</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 justify-items-center">
        {loading || categories.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="group block overflow-hidden text-center w-full max-w-[220px]">
                <div className="overflow-hidden relative h-36 w-36 sm:h-44 sm:w-44 mx-auto mb-3 rounded-full shadow-md bg-gray-200 animate-pulse" />
                <div className="h-5 w-20 mx-auto bg-gray-200 rounded animate-pulse" />
              </div>
            ))
          : categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className=" group block overflow-hidden text-center w-full max-w-[220px]"
              >
                <div className="overflow-hidden relative h-36 w-36 sm:h-44 sm:w-44 mx-auto mb-3 rounded-full shadow-md">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/banner.png";
                    }}
                  />
                </div>
                <div className="px-3">
                  <h3 className="font-medium">{cat.name}</h3>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}
