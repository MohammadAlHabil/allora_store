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
  type = "new",
  title,
}: {
  type?: string;
  title?: string;
}) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);

  // ref to swiper instance so prev/next buttons can control it
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const r = await fetch(`/api/products?type=${type}`);
        const data = await r.json();
        if (mounted) setProducts(data);
      } catch {
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [type]);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 relative">
      {/* Section title */}
      {title && <h2 className="text-2xl md:text-3xl font-semibold mb-6">{title}</h2>}

      {/* Arrows (control Swiper) */}
      <button
        onClick={() => swiperRef.current?.slidePrev()}
        aria-label="Previous"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:scale-105 duration-200"
      >
        ←
      </button>

      <button
        onClick={() => swiperRef.current?.slideNext()}
        aria-label="Next"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:scale-105 duration-200"
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
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <SwiperSlide key={i} className="w-auto">
                  <div className="bg-card rounded-2xl p-4">
                    <ProductSkeleton />
                  </div>
                </SwiperSlide>
              ))
            : (products ?? []).map((p) => (
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
