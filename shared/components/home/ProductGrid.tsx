"use client";

import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import type { Product } from "@/features/products/hooks/useProducts";
import { Button } from "@/shared/components/ui/button";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";

interface ProductGridProps {
  title?: string;
  products?: Product[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export default function ProductGrid({
  title,
  products = [],
  isLoading = false,
  isError = false,
  error = null,
  onRetry,
}: ProductGridProps) {
  const swiperRef = useRef<SwiperType | null>(null);

  // Error state
  if (isError) {
    return (
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {title && <h2 className="text-2xl md:text-3xl font-semibold mb-6">{title}</h2>}
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-lg">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load products</h3>
          <p className="text-muted-foreground mb-4">{error?.message || "Something went wrong"}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              Try Again
            </Button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 relative">
      {/* Section title */}
      {title && <h2 className="text-2xl md:text-3xl font-semibold mb-6">{title}</h2>}

      {/* Navigation Arrows */}
      <button
        onClick={() => swiperRef.current?.slidePrev()}
        aria-label="Previous"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm border border-border shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={() => swiperRef.current?.slideNext()}
        aria-label="Next"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm border border-border shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Products */}
      <div className="py-2">
        {isLoading || products.length === 0 ? (
          // Loading skeleton - use grid
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : (
          // Loaded products - use Swiper
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
            {products.map((p) => (
              <SwiperSlide key={p.id}>
                <ProductCard product={p} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}
