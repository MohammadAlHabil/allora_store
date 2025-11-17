import FeaturedCategories from "@/shared/components/home/FeaturedCategories";
import HeroBanner from "@/shared/components/home/HeroBanner";
import ProductGrid from "@/shared/components/home/ProductGrid";

export default function Home() {
  return (
    <main>
      <HeroBanner />

      <FeaturedCategories />

      <ProductGrid type="new" title="New Arrivals" />

      <ProductGrid type="best" title="Best Sellers" />
    </main>
  );
}
