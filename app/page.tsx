"use client";

import { useNewArrivals, useBestSellers } from "@/features/products/hooks/useProducts";
import FeaturedCategories from "@/shared/components/home/FeaturedCategories";
import HeroBanner from "@/shared/components/home/HeroBanner";
import ProductGrid from "@/shared/components/home/ProductGrid";

export default function Home() {
  // Fetch products using React Query hooks
  const {
    data: newArrivals = [],
    isLoading: isLoadingNewArrivals,
    isError: isErrorNewArrivals,
    error: errorNewArrivals,
    refetch: refetchNewArrivals,
  } = useNewArrivals();

  const {
    data: bestSellers = [],
    isLoading: isLoadingBestSellers,
    isError: isErrorBestSellers,
    error: errorBestSellers,
    refetch: refetchBestSellers,
  } = useBestSellers();

  return (
    <main>
      <HeroBanner />

      <FeaturedCategories />

      <ProductGrid
        title="New Arrivals"
        products={newArrivals}
        isLoading={isLoadingNewArrivals}
        isError={isErrorNewArrivals}
        error={errorNewArrivals}
        onRetry={() => refetchNewArrivals()}
      />

      <ProductGrid
        title="Best Sellers"
        products={bestSellers}
        isLoading={isLoadingBestSellers}
        isError={isErrorBestSellers}
        error={errorBestSellers}
        onRetry={() => refetchBestSellers()}
      />
    </main>
  );
}
