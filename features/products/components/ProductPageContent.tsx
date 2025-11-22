"use client";

import DOMPurify from "dompurify";
import { Home } from "lucide-react";
import Link from "next/link";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

import { useProduct } from "../hooks/useProduct";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductInfo } from "./ProductInfo";
import { ProductPageSkeleton } from "./ProductPageSkeleton";

interface ProductPageContentProps {
  slug: string;
}

/**
 * Product page content component
 */
export function ProductPageContent({ slug }: ProductPageContentProps) {
  const { data: product, isLoading, error } = useProduct(slug);

  if (isLoading) {
    return <ProductPageSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">
          {error.message || "The product you're looking for doesn't exist or has been removed."}
        </p>
        <Link href="/products" className="inline-flex items-center text-primary hover:underline">
          <Home className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Main product content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image gallery */}
        <ProductImageGallery images={product.images} productName={product.name} />

        {/* Product info */}
        <ProductInfo product={product} />
      </div>

      {/* Product details tabs */}
      <div className="mt-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6 space-y-4">
            <div className="prose prose-sm max-w-none">
              {product.description ? (
                <div
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}
                />
              ) : (
                <p className="text-muted-foreground">No description available.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {product.sku && (
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">SKU</span>
                  <span className="text-muted-foreground">{product.sku}</span>
                </div>
              )}

              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Type</span>
                <span className="text-muted-foreground capitalize">
                  {product.type.toLowerCase()}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Currency</span>
                <span className="text-muted-foreground">{product.currency}</span>
              </div>

              {product.categories.length > 0 && (
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Categories</span>
                  <span className="text-muted-foreground">
                    {product.categories.map((c) => c.category.name).join(", ")}
                  </span>
                </div>
              )}

              {product.variants.length > 0 && (
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Variants</span>
                  <span className="text-muted-foreground">{product.variants.length} options</span>
                </div>
              )}

              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Availability</span>
                <span className="text-muted-foreground">
                  {product.isAvailable ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            {product.reviews.length > 0 ? (
              <div className="space-y-6">
                {product.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{review.user.name || "Anonymous"}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={i < review.rating ? "text-primary" : "text-muted"}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <time className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    {review.title && <h4 className="font-medium mb-1">{review.title}</h4>}
                    {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
                    {review.isVerified && (
                      <span className="text-xs text-green-600 mt-2 inline-block">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No reviews yet.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
