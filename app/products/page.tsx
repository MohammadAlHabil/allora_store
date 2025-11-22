import { Suspense } from "react";
import ProductsPageContent from "./ProductsPageContent";

export const metadata = {
  title: "Products - Allora Store",
  description: "Browse our complete collection of products",
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsPageContent />
    </Suspense>
  );
}

function ProductsPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="h-96 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-96 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
