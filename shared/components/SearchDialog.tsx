"use client";

import { Search, X, TrendingUp, Clock, Package, Tag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { VisuallyHidden } from "@/shared/components/ui/visually-hidden";
import { formatPrice } from "@/shared/lib/utils/formatters";

interface SearchResult {
  products: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    basePrice: number;
    image: string | null;
    categoryName: string | null;
    categorySlug: string | null;
  }[];
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
  total: number;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const saveToRecentSearches = useCallback(
    (searchTerm: string) => {
      const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    },
    [recentSearches]
  );

  const handleProductClick = (product: SearchResult["products"][0]) => {
    saveToRecentSearches(query);
    onOpenChange(false);
    router.push(`/product/${product.slug}`);
  };

  const handleCategoryClick = (category: SearchResult["categories"][0]) => {
    saveToRecentSearches(query);
    onOpenChange(false);
    router.push(`/category/${category.slug}`);
  };

  const handleRecentSearch = (searchTerm: string) => {
    setQuery(searchTerm);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden p-0">
        <VisuallyHidden>
          <DialogTitle>Search Products and Categories</DialogTitle>
        </VisuallyHidden>
        <DialogHeader className="px-6 pt-10 pb-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search products, categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(80vh-120px)] px-6 pb-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          )}

          {!query && recentSearches.length > 0 && (
            <div className="py-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Searches
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="h-auto p-1 text-xs"
                >
                  Clear
                </Button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearch(search)}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm"
                  >
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && results && results.total === 0 && query && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">No results found</h3>
              <p className="text-sm text-muted-foreground">Try searching with different keywords</p>
            </div>
          )}

          {!loading && results && results.total > 0 && (
            <div className="space-y-6 py-4">
              {/* Categories */}
              {results.categories.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Categories
                  </h3>
                  <div className="space-y-1">
                    {results.categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category)}
                        className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
                      >
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                          <Tag className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{category.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {results.products.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Products
                  </h3>
                  <div className="space-y-1">
                    {results.products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
                      >
                        <div className="h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={64}
                              height={64}
                              className="h-full w-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{product.name}</p>
                          {product.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {product.description}
                            </p>
                          )}
                          {product.categoryName && (
                            <p className="text-xs text-muted-foreground">
                              in {product.categoryName}
                            </p>
                          )}
                        </div>
                        <div className="text-sm font-semibold text-right">
                          {formatPrice(Number(product.basePrice))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && !results && !query && recentSearches.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">Start searching</h3>
              <p className="text-sm text-muted-foreground">Find products and categories quickly</p>
            </div>
          )}
        </div>

        <div className="border-t px-6 py-3 bg-muted/30 text-xs text-muted-foreground">
          <kbd className="px-2 py-1 bg-background rounded border">Esc</kbd> to close
        </div>
      </DialogContent>
    </Dialog>
  );
}
