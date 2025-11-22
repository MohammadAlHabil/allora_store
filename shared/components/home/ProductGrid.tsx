"use client";

import { useEffect, useRef, useState } from "react";
// Swiper
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  rating?: number;
};

export default function ProductCarousel({
  title,
  apiEndpoint,
}: {
  title?: string;
  apiEndpoint: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch(apiEndpoint);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [apiEndpoint]);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 relative">
      {/* Section title */}
      {title && <h2 className="text-2xl md:text-3xl font-semibold mb-6">{title}</h2>}

      {/* Arrows (control Swiper) */}
      <button
        onClick={() => swiperRef.current?.slidePrev()}
        aria-label="Previous"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background border border-border shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:scale-105 duration-200"
      >
        ←
      </button>

      <button
        onClick={() => swiperRef.current?.slideNext()}
        aria-label="Next"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background border border-border shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:scale-105 duration-200"
      >
        →
      </button>

      {/* Swiper slider */}
      <div className="py-2">
        <Swiper
          onSwiper={(s: SwiperType) => (swiperRef.current = s)}
          slidesPerView={1.1}
          spaceBetween={16}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
        >
          {loading || !products || products.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <SwiperSlide key={i} className="w-auto">
                  <div className="bg-card rounded-2xl p-4">
                    <ProductSkeleton />
                  </div>
                </SwiperSlide>
              ))
            : products.map((p) => (
                <SwiperSlide key={p.id} className="w-auto">
                  <div className="px-1">
                    <ProductCard product={p} />
                  </div>
                </SwiperSlide>
              ))}
        </Swiper>
      </div>
    </section>
  );
}
