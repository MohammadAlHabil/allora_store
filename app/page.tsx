import FeaturedCategories from "@/shared/components/home/FeaturedCategories";
import HeroBanner from "@/shared/components/home/HeroBanner";
import ProductGrid from "@/shared/components/home/ProductGrid";

export default function Home() {
  return (
    <main>
      <HeroBanner />

      <FeaturedCategories />

      <ProductGrid title="New Arrivals" apiEndpoint="/api/products/new-arrivals" />

      <ProductGrid title="Best Sellers" apiEndpoint="/api/products/best-sellers" />
    </main>
  );
}
