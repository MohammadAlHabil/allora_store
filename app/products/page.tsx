import Link from "next/link";

import { Button } from "@/shared/components/ui/button";

export default function ProductsIndexPage() {
  // Sample product slugs for testing
  const sampleProducts = [
    { slug: "floral-midi-dress", name: "Floral Midi Dress" },
    { slug: "leather-ankle-boots", name: "Leather Ankle Boots" },
    { slug: "silk-scarf", name: "Silk Scarf" },
    { slug: "statement-necklace", name: "Statement Necklace" },
    { slug: "everyday-tote", name: "Everyday Tote Bag" },
    { slug: "satin-camisole", name: "Satin Camisole" },
    { slug: "high-waist-jeans", name: "High-waist Jeans" },
    { slug: "chunky-knit-sweater", name: "Chunky Knit Sweater" },
    { slug: "strappy-sandals", name: "Strappy Sandals" },
    { slug: "classic-blazer", name: "Classic Blazer" },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Products</h1>
        <p className="text-muted-foreground">Browse our collection of quality products</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleProducts.map((product) => (
          <Link key={product.slug} href={`/products/${product.slug}`} className="group">
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <Button variant="outline" className="w-full">
                View Product
              </Button>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/">
          <Button variant="ghost">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
