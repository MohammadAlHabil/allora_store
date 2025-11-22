import type { Metadata } from "next";

import { ProductPageContent } from "@/features/products/components/ProductPageContent";

interface ProductPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { productId } = await params;

  // Fetch product data for metadata
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/products/${productId}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return {
        title: "Product Not Found",
      };
    }

    const product = await response.json();

    return {
      title: product.name,
      description: product.shortDesc || product.description || product.name,
      openGraph: {
        title: product.name,
        description: product.shortDesc || product.description,
        images: product.images?.[0]?.url ? [{ url: product.images[0].url, alt: product.name }] : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Product",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;

  return <ProductPageContent slug={productId} />;
}
